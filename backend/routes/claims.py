"""User claims API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import base64

from config.database import get_db
from models.models import User, Claim, ClaimDocument, UserPolicy, Policy, Provider
from schemas.claim_schemas import ClaimCreate, ClaimOut, ClaimDetailOut, DocumentOut
from services.claim_service import (
    generate_claim_number,
    verify_user_owns_policy,
    get_claim_with_details
)
from services.s3_service import S3Service
from tasks.document_tasks import upload_document_to_s3
from tasks.fraud_tasks import run_fraud_detection
from tasks.notification_tasks import send_claim_notification
from routes.auth import get_current_user

router = APIRouter()


@router.get("/user-policies")
def get_user_policies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all active policies owned by the current user.
    Returns policy details including provider info for filing claims.
    """
    user_policies = db.query(UserPolicy).filter(
        UserPolicy.user_id == current_user.id,
        UserPolicy.status == "active"
    ).all()
    
    result = []
    for up in user_policies:
        policy = db.query(Policy).filter(Policy.id == up.policy_id).first()
        if policy:
            provider = db.query(Provider).filter(Provider.id == policy.provider_id).first()
            result.append({
                "id": up.id,  # UserPolicy ID (needed for creating claims)
                "policy_id": policy.id,
                "title": policy.title,
                "policy_type": policy.policy_type,
                "provider_name": provider.name if provider else "Unknown",
                "premium": float(policy.premium),
                "coverage": policy.coverage,
                "purchased_at": up.purchased_at
            })
    
    return result



@router.post("", response_model=ClaimDetailOut, status_code=201)
def create_claim(
    claim_data: ClaimCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    File a new insurance claim.
    
    User must own the policy they're claiming against.
    Fraud detection runs asynchronously via Celery.
    """
    # Verify user owns this policy
    user_policy_id = verify_user_owns_policy(current_user.id, claim_data.policy_id, db)
    
    if not user_policy_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have an active policy with this ID"
        )
    
    # Generate unique claim number
    claim_number = generate_claim_number(db)
    
    # Create claim
    new_claim = Claim(
        user_policy_id=user_policy_id,
        claim_number=claim_number,
        claim_type=claim_data.claim_type,
        incident_date=claim_data.incident_date,
        amount_claimed=claim_data.amount_claimed,
        status="submitted"
    )
    
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)
    
    # Try async fraud detection via Celery, fall back to synchronous
    fraud_task_id = None
    try:
        fraud_task = run_fraud_detection.delay(new_claim.id)
        fraud_task_id = fraud_task.id
        
        # Send notification about new claim
        send_claim_notification.delay(
            user_email=current_user.email,
            claim_number=claim_number,
            status="submitted",
            message="Your claim has been submitted and is being reviewed."
        )
    except Exception:
        # Redis/Celery not available — run fraud detection synchronously
        from services.fraud_detection_service import FraudDetectionService
        fraud_service = FraudDetectionService(db)
        fraud_flags = fraud_service.check_all_rules(new_claim)
        fraud_service.save_fraud_flags(fraud_flags)
    
    # Return full details
    claim_details = get_claim_with_details(new_claim.id, db)
    if fraud_task_id:
        claim_details["fraud_detection_task_id"] = fraud_task_id
    
    return claim_details


@router.get("", response_model=List[ClaimOut])
def get_my_claims(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all claims for the current user.
    
    Optionally filter by status: submitted, under_review, approved, rejected, paid
    """
    # Get user's policies
    user_policy_ids = [
        up.id for up in db.query(UserPolicy).filter(
            UserPolicy.user_id == current_user.id
        ).all()
    ]
    
    # Query claims
    query = db.query(Claim).filter(Claim.user_policy_id.in_(user_policy_ids))
    
    if status:
        query = query.filter(Claim.status == status)
    
    claims = query.order_by(Claim.created_at.desc()).all()
    
    # Enrich with policy and provider info
    result = []
    for claim in claims:
        user_policy = db.query(UserPolicy).filter(UserPolicy.id == claim.user_policy_id).first()
        policy = db.query(Policy).filter(Policy.id == user_policy.policy_id).first() if user_policy else None
        provider = db.query(Provider).filter(Provider.id == policy.provider_id).first() if policy else None
        
        result.append({
            "id": claim.id,
            "user_policy_id": claim.user_policy_id,
            "claim_number": claim.claim_number,
            "claim_type": claim.claim_type,
            "incident_date": claim.incident_date,
            "amount_claimed": float(claim.amount_claimed),
            "status": claim.status,
            "created_at": claim.created_at,
            "policy_title": policy.title if policy else None,
            "provider_name": provider.name if provider else None,
            "documents_count": len(claim.documents)
        })
    
    return result


@router.get("/{claim_id}", response_model=ClaimDetailOut)
def get_claim_details(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific claim."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Admin can view any claim; regular users must own it
    if current_user.role != "admin":
        user_policy = db.query(UserPolicy).filter(
            UserPolicy.id == claim.user_policy_id,
            UserPolicy.user_id == current_user.id
        ).first()
        
        if not user_policy:
            raise HTTPException(status_code=403, detail="Not authorized to view this claim")
    
    return get_claim_with_details(claim_id, db)


@router.post("/{claim_id}/documents", status_code=202)
async def upload_document(
    claim_id: int,
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a document for a claim via S3 (async).
    
    The file is uploaded to S3 in the background via Celery.
    Returns a task_id to track upload progress.
    
    Supported doc_types: medical_report, invoice, photo, police_report, other
    """
    # Verify claim exists and user owns it
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    user_policy = db.query(UserPolicy).filter(
        UserPolicy.id == claim.user_policy_id,
        UserPolicy.user_id == current_user.id
    ).first()
    
    if not user_policy:
        raise HTTPException(status_code=403, detail="Not authorized to upload to this claim")
    
    # Read file into memory
    file_content = await file.read()
    
    # Try async S3 upload via Celery, fall back to sync S3 or local storage
    try:
        file_bytes_b64 = base64.b64encode(file_content).decode("utf-8")
        task = upload_document_to_s3.delay(
            file_bytes_b64=file_bytes_b64,
            claim_id=claim_id,
            claim_number=claim.claim_number,
            filename=file.filename,
            doc_type=doc_type,
            content_type=file.content_type or "application/octet-stream",
        )
        return {
            "status": "uploading",
            "task_id": task.id,
            "message": "Document is being uploaded to S3. Use task_id to check progress.",
        }
    except Exception:
        # Celery/Redis not available — try direct S3 upload
        try:
            from services.s3_service import S3Service
            from datetime import datetime as dt
            timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
            s3_key = f"claims/{claim.claim_number}/{timestamp}_{file.filename}"
            s3_service = S3Service()
            s3_url = s3_service.upload_file(
                file_content, s3_key, file.content_type or "application/octet-stream"
            )
            document = ClaimDocument(
                claim_id=claim_id, file_url=s3_url, s3_key=s3_key, doc_type=doc_type
            )
        except Exception:
            # S3 also unavailable — save locally
            import shutil
            from pathlib import Path
            upload_dir = Path("uploads/claim_documents")
            upload_dir.mkdir(parents=True, exist_ok=True)
            from datetime import datetime as dt
            safe_filename = f"{claim.claim_number}_{dt.now().timestamp()}_{file.filename}"
            file_path = upload_dir / safe_filename
            with file_path.open("wb") as buffer:
                buffer.write(file_content)
            document = ClaimDocument(
                claim_id=claim_id, file_url=str(file_path), doc_type=doc_type
            )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        return {
            "status": "uploaded",
            "document_id": document.id,
            "file_url": document.file_url,
        }


@router.get("/{claim_id}/documents/{doc_id}/download")
def download_document(
    claim_id: int,
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a presigned download URL for a claim document.
    
    Returns a temporary URL (valid for 1 hour) to download the document from S3.
    """
    # Verify claim exists and user owns it
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    user_policy = db.query(UserPolicy).filter(
        UserPolicy.id == claim.user_policy_id,
        UserPolicy.user_id == current_user.id
    ).first()
    
    if not user_policy:
        raise HTTPException(status_code=403, detail="Not authorized to access this claim")
    
    # Get document
    document = db.query(ClaimDocument).filter(
        ClaimDocument.id == doc_id,
        ClaimDocument.claim_id == claim_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Generate presigned URL if s3_key exists
    if document.s3_key:
        s3_service = S3Service()
        presigned_url = s3_service.generate_presigned_url(document.s3_key)
        
        if presigned_url:
            return {
                "download_url": presigned_url,
                "doc_type": document.doc_type,
                "expires_in": 3600,
            }
    
    # Fallback to stored file_url
    return {
        "download_url": document.file_url,
        "doc_type": document.doc_type,
        "expires_in": None,
    }
