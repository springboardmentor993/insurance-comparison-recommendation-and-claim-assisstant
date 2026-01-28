from fastapi import APIRouter, Depends, HTTPException,status
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

    user.risk_profile = request.dict()
    db.commit()

    return {"message": "Risk profile saved successfully"}


@router.get("/users/{user_id}/risk-profile")
def get_risk_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)   # ✅ PROTECTED
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

    return {"risk_profile": user.risk_profile}
