from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
import random
import string
import os

import models
import schemas
from database import get_db
from drive_service import upload_file_to_drive
from tasks import send_claim_status_email
from oauth2 import get_current_user

router = APIRouter(
    prefix="/claims",
    tags=["Claims"]
)


# -----------------------------
# GENERATE CLAIM NUMBER
# -----------------------------
def generate_claim_number():
    return "CLM-" + ''.join(random.choices(string.digits, k=6))


# -----------------------------
# CREATE CLAIM
# -----------------------------
@router.post("/")
def create_claim(
    request: schemas.ClaimCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # 🔒 Ensure policy belongs to logged-in user
    user_policy = (
        db.query(models.UserPolicies)
        .filter(
            models.UserPolicies.id == request.user_policy_id,
            models.UserPolicies.user_id == current_user.id
        )
        .first()
    )

    if not user_policy:
        raise HTTPException(status_code=403, detail="Invalid user policy")

    new_claim = models.Claims(
        user_policy_id=request.user_policy_id,
        claim_number=generate_claim_number(),
        claim_type=request.claim_type,
        incident_date=request.incident_date,
        amount_claimed=request.amount_claimed,
        status="draft"
    )

    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    return {
        "id": new_claim.id,
        "claim_number": new_claim.claim_number,
        "status": new_claim.status
    }


# -----------------------------
# GET CLAIMS FOR LOGGED-IN USER
# -----------------------------
@router.get("/")
def get_user_claims(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    claims = (
        db.query(models.Claims)
        .join(models.UserPolicies)
        .filter(models.UserPolicies.user_id == current_user.id)
        .all()
    )

    # ✅ Return clean JSON response
    return [
        {
            "id": claim.id,
            "claim_number": claim.claim_number,
            "amount_claimed": float(claim.amount_claimed),
            "incident_date": claim.incident_date,
            "status": claim.status,
            "created_at": claim.created_at
        }
        for claim in claims
    ]


# -----------------------------
# UPLOAD CLAIM DOCUMENT
# -----------------------------
@router.post("/{claim_id}/upload")
def upload_claim_document(
    claim_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    claim = (
        db.query(models.Claims)
        .join(models.UserPolicies)
        .filter(
            models.Claims.id == claim_id,
            models.UserPolicies.user_id == current_user.id
        )
        .first()
    )

    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    file_location = f"temp_{file.filename}"

    try:
        with open(file_location, "wb") as buffer:
            buffer.write(file.file.read())

        file_url = upload_file_to_drive(file_location, file.filename)

        new_doc = models.ClaimDocuments(
            claim_id=claim_id,
            file_url=file_url,
            doc_type="general"
        )

        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)

        return {
            "message": "File uploaded successfully",
            "file_url": file_url
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(file_location):
            os.remove(file_location)


# -----------------------------
# UPDATE CLAIM STATUS (ADMIN)
# -----------------------------
class ClaimStatusUpdate(BaseModel):
    status: str


@router.put("/{claim_id}/status")
def update_claim_status(
    claim_id: int,
    request: ClaimStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    claim = db.query(models.Claims).filter(models.Claims.id == claim_id).first()

    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = request.status
    db.commit()
    db.refresh(claim)

    # 🔥 Send background email
    send_claim_status_email.delay(claim.id, claim.status)

    return {
        "message": "Claim status updated successfully",
        "claim_id": claim.id,
        "new_status": claim.status
    }
