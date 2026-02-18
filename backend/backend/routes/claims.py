from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import uuid
import logging

from deps import get_db
from auth_deps import get_current_user, get_current_user_only
from models import User, Claim, ClaimDocument, UserPolicy, ClaimHistory
from schemas import ClaimCreate, ClaimOut, ClaimStatusUpdate
from s3_service import s3_service
from tasks import send_claim_submitted_notification, send_claim_status_update_notification
from services.fraud_engine import FraudEngine

router = APIRouter()
logger = logging.getLogger(__name__)

# Allowed file types and max size
ALLOWED_FILE_TYPES = {'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def generate_claim_number() -> str:
    """Generate unique claim number."""
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"CLM-{timestamp}-{unique_id}"


@router.post("/claims", response_model=ClaimOut)
async def create_claim(
    user_policy_id: int = Form(...),
    claim_type: str = Form(...),
    incident_date: date = Form(...),
    description: str = Form(...),
    claim_amount: float = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_only),
):
    """
    File a new claim with document uploads.
    """
    # Validate user policy exists and belongs to user
    user_policy = db.query(UserPolicy).filter(
        UserPolicy.id == user_policy_id,
        UserPolicy.user_id == current_user.id
    ).first()
    
    if not user_policy:
        raise HTTPException(status_code=404, detail="User policy not found")
    
    # Validate user policy is active
    if user_policy.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Cannot file claim for inactive policy"
        )
    
    # Validate files
    logger.info(f"Received claim creation request. Files: {files}, Form: user_policy_id={user_policy_id}")
    
    if not files:
        logger.error("No files received in request")
    else:
        logger.info(f"Received {len(files)} files")
        for f in files:
            logger.info(f"File: {f.filename}, Content-Type: {f.content_type}")

    if not files or len(files) == 0:
        raise HTTPException(
            status_code=400,
            detail="At least one document is required"
        )
    
    for file in files:
        # Check file type
        file_ext = file.filename.split('.')[-1].lower()
        if file_ext not in ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"File type .{file_ext} not allowed. Allowed types: {', '.join(ALLOWED_FILE_TYPES)}"
            )
        
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File {file.filename} exceeds maximum size of 10MB"
            )
    
    # Create claim
    claim_number = generate_claim_number()
    new_claim = Claim(
        user_id=current_user.id,
        user_policy_id=user_policy_id,
        claim_number=claim_number,
        claim_type=claim_type,
        incident_date=incident_date,
        description=description,
        claim_amount=claim_amount,
        status="pending"
    )
    
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    # ✅ Add history entry
    history_entry = ClaimHistory(
        claim_id=new_claim.id,
        status="pending",
        notes="Claim submitted"
    )
    db.add(history_entry)
    
    # Upload documents to S3
    uploaded_documents = []
    for file in files:
        try:
            # Read file content
            file_content = await file.read()
            file_ext = file.filename.split('.')[-1].lower()
            
            # Upload to S3
            s3_key = s3_service.upload_file(
                file_content=file_content,
                file_name=file.filename,
                content_type=file.content_type or 'application/octet-stream',
                folder=f"claims/{claim_number}"
            )
            
            if not s3_key:
                raise Exception(f"Failed to upload {file.filename} to S3")
            
            # Generate presigned URL (valid for 7 days)
            s3_url = s3_service.generate_presigned_url(s3_key, expiration=7*24*3600)
            
            if not s3_url:
                raise Exception(f"Failed to generate URL for {file.filename}")
            
            # Create document record
            document = ClaimDocument(
                claim_id=new_claim.id,
                file_name=file.filename,
                file_type=file_ext,
                file_size=len(file_content),
                s3_key=s3_key,
                s3_url=s3_url
            )
            
            db.add(document)
            uploaded_documents.append(document)
            
        except Exception as e:
            logger.error(f"Error uploading document {file.filename}: {e}")
            # Rollback claim if document upload fails
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error uploading document {file.filename}: {str(e)}"
            )
    
    db.commit()
    
    # Refresh to get documents and history
    db.refresh(new_claim)
    
    # Send notification email asynchronously
    try:
        # send_claim_submitted_notification.delay(
        #     user_email=current_user.email,
        #     user_name=current_user.name,
        #     claim_number=claim_number,
        #     claim_type=claim_type,
        #     claim_amount=float(claim_amount)
        # )
        pass
    except Exception as e:
        logger.error(f"Error sending claim notification email: {e}")
        # Don't fail the request if email fails
    
    # 🕵️ Check for fraud
    try:
        FraudEngine.evaluate(new_claim, db)
    except Exception as e:
        logger.error(f"Error checking fraud rules: {e}")
        # Don't fail claim creation if fraud check fails, just log it.

    return new_claim


@router.get("/claims", response_model=List[ClaimOut])
def get_user_claims(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all claims for the current user.
    """
    claims = db.query(Claim).filter(
        Claim.user_id == current_user.id
    ).order_by(Claim.created_at.desc()).all()
    
    return claims


@router.get("/claims/{claim_id}", response_model=ClaimOut)
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get claim details by ID.
    """
    claim = db.query(Claim).filter(
        Claim.id == claim_id,
        Claim.user_id == current_user.id
    ).first()
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    return claim


@router.patch("/claims/{claim_id}/status", response_model=ClaimOut)
def update_claim_status(
    claim_id: int,
    status_update: ClaimStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update claim status (for admin use or future implementation).
    For now, accessible by claim owner.
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Validate status
    valid_statuses = ["pending", "under_review", "approved", "rejected", "completed"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Update claim
    old_status = claim.status
    claim.status = status_update.status
    
    if status_update.status_notes:
        claim.status_notes = status_update.status_notes
    
    if status_update.approved_amount is not None:
        claim.approved_amount = status_update.approved_amount
    
    # ✅ Add history entry
    history_entry = ClaimHistory(
        claim_id=claim.id,
        status=status_update.status,
        notes=status_update.status_notes or f"Status updated from {old_status} to {status_update.status}"
    )
    db.add(history_entry)

    db.commit()
    db.refresh(claim)
    
    # Send notification email if status changed
    if old_status != status_update.status:
        try:
            # send_claim_status_update_notification.delay(
            #     user_email=claim.user.email,
            #     user_name=claim.user.name,
            #     claim_number=claim.claim_number,
            #     new_status=status_update.status,
            #     status_notes=status_update.status_notes,
            #     approved_amount=float(status_update.approved_amount) if status_update.approved_amount else None
            # )
            pass
        except Exception as e:
            logger.error(f"Error sending claim status update email: {e}")
    
    return claim


@router.get("/claims/{claim_id}/documents/{document_id}/refresh-url")
def refresh_document_url(
    claim_id: int,
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Refresh presigned URL for a document (when expired).
    """
    # Verify claim belongs to user
    claim = db.query(Claim).filter(
        Claim.id == claim_id,
        Claim.user_id == current_user.id
    ).first()
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Get document
    document = db.query(ClaimDocument).filter(
        ClaimDocument.id == document_id,
        ClaimDocument.claim_id == claim_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Generate new presigned URL
    new_url = s3_service.generate_presigned_url(
        document.s3_key,
        expiration=7*24*3600  # 7 days
    )
    
    if not new_url:
        raise HTTPException(status_code=500, detail="Failed to generate new URL")
    
    # Update document URL in database
    document.s3_url = new_url
    db.commit()
    
    return {"url": new_url}
