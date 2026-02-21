
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from datetime import datetime
import random

router = APIRouter(prefix="/claims", tags=["Claims"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================
# 1️⃣ Get Purchased Policies with Claim Status
# =========================================================
@router.get("/user/{user_id}")
def get_user_policies_with_claims(user_id: int, db: Session = Depends(get_db)):

    results = (
        db.query(models.UserPolicies, models.Claims)
        .outerjoin(
            models.Claims,
            models.UserPolicies.id == models.Claims.user_policy_id
        )
        .filter(models.UserPolicies.user_id == user_id)
        .all()
    )

    response = []

    for up, claim in results:
        response.append({
            "user_policy_id": up.id,
            "policy_number": up.policy_number,
            "premium": up.premium,
            "status": claim.status if claim else "no_claim",
            "claim_id": claim.id if claim else None
        })

    return response


# =========================================================
# 2️⃣ File New Claim
# =========================================================
@router.post("/file/{user_policy_id}")
def file_claim(user_policy_id: int, db: Session = Depends(get_db)):

    new_claim = models.Claims(
        user_policy_id=user_policy_id,
        claim_number=f"CLM-{random.randint(10000, 99999)}",
        claim_type="Accident",
        incident_date=datetime.now(),
        amount_claimed=10000,
        status="submitted",  # must match your enum value
        created_at=datetime.now()
    )

    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    return {
        "message": "Claim filed successfully",
        "claim_id": new_claim.id
    }


# =========================================================
# 3️⃣ Get Only User Purchased Policies (No Claim Join)
# =========================================================
@router.get("/purchased/{user_id}")
def get_user_policies(user_id: int, db: Session = Depends(get_db)):

    policies = (
        db.query(models.UserPolicies)
        .filter(models.UserPolicies.user_id == user_id)
        .all()
    )

    return policies


# =========================================================
# 4️⃣ Get Only User Claims
# =========================================================
@router.get("/all/{user_id}")
def get_user_claims(user_id: int, db: Session = Depends(get_db)):

    claims = (
        db.query(models.Claims)
        .join(models.UserPolicies)
        .filter(models.UserPolicies.user_id == user_id)
        .all()
    )

    return claims
