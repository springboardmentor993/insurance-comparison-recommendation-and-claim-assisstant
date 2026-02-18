from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import RiskProfileRequest
from oauth2 import get_current_user

router = APIRouter()


@router.post("/users/{user_id}/risk-profile")
def save_risk_profile(
    user_id: int,
    request: RiskProfileRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🔐 ACCESS CHECK
    if user.email != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this profile"
        )

    # 🔥 AUTO CALCULATE RISK LEVEL
    if (
        request.age > 50 or
        request.dependents >= 3 or
        request.health_condition.lower() == "critical"
    ):
        calculated_risk = "high"
    else:
        calculated_risk = "low"

    # Save everything including calculated risk
    user.risk_profile = {
        "age": request.age,
        "annual_income": request.annual_income,
        "dependents": request.dependents,
        "health_condition": request.health_condition,
        "risk_level": calculated_risk
    }

    db.commit()

    return {
        "message": "Risk profile saved successfully",
        "calculated_risk": calculated_risk
    }


@router.get("/users/{user_id}/risk-profile")
def get_risk_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🔐 ACCESS CHECK
    if user.email != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this profile"
        )

    return {
        "risk_profile": user.risk_profile
    }
