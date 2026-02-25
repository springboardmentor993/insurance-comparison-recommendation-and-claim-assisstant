from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
import uuid
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from app.database import get_db
from app.models import Claim, ClaimDocument, UserPolicy, User, ClaimStatus
from app.schemas.schemas import (
    ClaimResponse,
    ClaimCreate,
    ClaimUpdate,
    ClaimDocumentResponse
)
from app.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/claims", tags=["Claims"])


def get_s3_client():
    """Create and return an S3 client using credentials from settings."""
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )


def upload_to_s3(file: UploadFile, claim_id: int) -> str:
    """Upload a file to S3 and return the S3 key (stored in DB)."""
    ext = ""
    if file.filename and "." in file.filename:
        ext = "." + file.filename.rsplit(".", 1)[-1]

    key = f"claims/{claim_id}/{uuid.uuid4().hex}{ext}"

    try:
        s3 = get_s3_client()
        s3.upload_fileobj(
            file.file,
            settings.S3_BUCKET_NAME,
            key,
            ExtraArgs={"ContentType": file.content_type or "application/octet-stream"},
        )
        # Store the S3 key as the file_url — we generate pre-signed URLs on demand
        return key
    except NoCredentialsError:
        raise HTTPException(status_code=500, detail="AWS credentials not configured")
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")


def generate_presigned_url(s3_key: str, expiry: int = 3600) -> str:
    """Generate a pre-signed URL for an S3 object (valid for `expiry` seconds)."""
    try:
        s3 = get_s3_client()
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.S3_BUCKET_NAME, "Key": s3_key},
            ExpiresIn=expiry,
        )
        return url
    except Exception:
        return ""



@router.post("/", response_model=ClaimResponse)
def create_claim(
    claim_data: ClaimCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new claim"""
    user_policy = db.query(UserPolicy).filter(
        UserPolicy.id == claim_data.user_policy_id,
        UserPolicy.user_id == current_user.id
    ).first()

    if not user_policy:
        raise HTTPException(status_code=404, detail="Policy not found or not owned by user")

    if user_policy.status != "active":
        raise HTTPException(status_code=400, detail="Cannot file claim on inactive policy")

    claim_number = f"CLM-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

    db_claim = Claim(
        user_policy_id=claim_data.user_policy_id,
        claim_number=claim_number,
        claim_type=claim_data.claim_type,
        incident_date=claim_data.incident_date,
        amount_claimed=claim_data.amount_claimed,
        description=claim_data.description,
        status=ClaimStatus.DRAFT
    )
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim


@router.get("/", response_model=List[ClaimResponse])
def get_user_claims(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    status: Optional[str] = None
):
    """Get all claims for current user"""
    user_policy_ids = [up.id for up in current_user.user_policies]
    query = db.query(Claim).filter(Claim.user_policy_id.in_(user_policy_ids))
    if status:
        query = query.filter(Claim.status == status)
    return query.order_by(desc(Claim.created_at)).all()


@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific claim"""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.user_policy.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this claim")
    return claim


@router.put("/{claim_id}", response_model=ClaimResponse)
def update_claim(
    claim_id: int,
    claim_update: ClaimUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a claim"""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.user_policy.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this claim")
    if claim.status not in [ClaimStatus.DRAFT, ClaimStatus.SUBMITTED]:
        raise HTTPException(status_code=400, detail="Cannot update claim in current status")

    if claim_update.claim_type:
        claim.claim_type = claim_update.claim_type
    if claim_update.incident_date:
        claim.incident_date = claim_update.incident_date
    if claim_update.amount_claimed:
        claim.amount_claimed = claim_update.amount_claimed
    if claim_update.description:
        claim.description = claim_update.description
    if claim_update.status:
        claim.status = claim_update.status

    db.commit()
    db.refresh(claim)
    return claim


@router.post("/{claim_id}/upload", response_model=ClaimDocumentResponse)
async def upload_claim_document(
    claim_id: int,
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a document for a claim — stored in AWS S3, viewable by admin only"""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.user_policy.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Upload to S3
    file_url = upload_to_s3(file, claim_id)

    document = ClaimDocument(
        claim_id=claim_id,
        file_url=file_url,
        doc_type=doc_type
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.post("/{claim_id}/submit", response_model=ClaimResponse)
def submit_claim(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a claim for review"""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.user_policy.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if not claim.documents:
        raise HTTPException(
            status_code=400,
            detail="Please upload at least one document before submitting"
        )

    claim.status = ClaimStatus.SUBMITTED
    db.commit()
    db.refresh(claim)

    # Trigger fraud detection (only if Celery/Redis configured)
    try:
        from app.tasks import run_fraud_detection
        run_fraud_detection.delay(claim_id)
    except Exception:
        pass

    return claim
