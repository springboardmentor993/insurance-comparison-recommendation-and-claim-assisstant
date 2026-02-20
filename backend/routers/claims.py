from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
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
# FRAUD RULES ENGINE
# -----------------------------
def run_fraud_checks(db: Session, claim: models.Claims):

    fraud_flags = []
    high_severity_found = False

    # Rule 1: Large Amount
    if float(claim.amount_claimed) > 100000:
        fraud_flags.append({
            "rule_code": "HIGH_AMOUNT",
            "severity": "high",
            "details": "Claim amount exceeds 100000"
        })
        high_severity_found = True

    # Rule 2: Suspicious Timing
    user_policy = db.query(models.UserPolicies).filter(
        models.UserPolicies.id == claim.user_policy_id
    ).first()

    if user_policy:
        days_difference = (claim.incident_date - user_policy.start_date).days
        if days_difference <= 7:
            fraud_flags.append({
                "rule_code": "SUSPICIOUS_TIMING",
                "severity": "medium",
                "details": "Claim filed within 7 days of policy start"
            })

    # Rule 3: Duplicate Claim Amount
    duplicate_claim = db.query(models.Claims).filter(
        models.Claims.user_policy_id == claim.user_policy_id,
        models.Claims.amount_claimed == claim.amount_claimed,
        models.Claims.id != claim.id
    ).first()

    if duplicate_claim:
        fraud_flags.append({
            "rule_code": "DUPLICATE_AMOUNT",
            "severity": "medium",
            "details": "Duplicate claim amount detected"
        })

    # Rule 4: Multiple Claims in 3 Days
    three_days_ago = datetime.utcnow() - timedelta(days=3)

    recent_claims = db.query(models.Claims).filter(
        models.Claims.user_policy_id == claim.user_policy_id,
        models.Claims.created_at >= three_days_ago,
        models.Claims.id != claim.id
    ).count()

    if recent_claims >= 2:
        fraud_flags.append({
            "rule_code": "MULTIPLE_RECENT_CLAIMS",
            "severity": "high",
            "details": "Multiple claims filed within 3 days"
        })
        high_severity_found = True

    # Insert Fraud Flags
    for flag in fraud_flags:
        new_flag = models.FraudFlags(
            claim_id=claim.id,
            rule_code=flag["rule_code"],
            severity=flag["severity"],
            details=flag["details"]
        )
        db.add(new_flag)

    # Auto change status if high severity
    if high_severity_found:
        claim.status = "under_review"

    db.commit()


# -----------------------------
# CREATE CLAIM
# -----------------------------
@router.post("/")
def create_claim(
    request: schemas.ClaimCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

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
        status="submitted"
    )

    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    run_fraud_checks(db, new_claim)

    return {
        "id": new_claim.id,
        "claim_number": new_claim.claim_number,
        "status": new_claim.status
    }


# -----------------------------
# GET CLAIMS FOR USER
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

    send_claim_status_email.delay(claim.id, claim.status)

    return {
        "message": "Claim status updated successfully",
        "claim_id": claim.id,
        "new_status": claim.status
    }