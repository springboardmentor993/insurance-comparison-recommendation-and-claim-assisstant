from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from schemas import RiskProfileCreate, RiskProfileOut, UserPreferencesUpdate
from models import User, RiskProfile
from deps import get_db
from auth_deps import get_current_user_email

router = APIRouter()
@router.post("/risk-profile", response_model=RiskProfileOut)
def create_or_update_risk_profile(
    profile: RiskProfileCreate,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    """Create or update user risk profile"""
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate risk level
    if profile.risk_profile.lower() not in ["high", "medium", "low"]:
        raise HTTPException(
            status_code=400,
            detail="risk_profile must be one of: high, medium, low"
        )

    try:
        existing_profile = db.query(RiskProfile).filter(RiskProfile.user_id == user.id).first()

        if existing_profile:
            existing_profile.dependents = profile.dependents
            existing_profile.risk_profile = profile.risk_profile.lower()
            db.commit()
            db.refresh(existing_profile)
            return existing_profile
        else:
            new_profile = RiskProfile(
                user_id=user.id,
                dependents=profile.dependents,
                risk_profile=profile.risk_profile.lower()
            )
            db.add(new_profile)
            db.commit()
            db.refresh(new_profile)
            return new_profile

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Risk profile already exists")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save risk profile: {str(e)}")


@router.get("/risk-profile", response_model=RiskProfileOut)
def get_risk_profile(
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    """Get current user's risk profile"""
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(RiskProfile).filter(RiskProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Risk profile not found")

    return profile


# ---------------------------------------------------------
#  ⭐ NEW: USER PREFERENCES UPDATE API ⭐
# ---------------------------------------------------------

@router.patch("/preferences")
def update_user_preferences(
    prefs: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    """
    Update user preferences:
    - income
    - budget
    - preferred_policy_type
    These preferences will be used in the recommendation engine.
    """
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Apply updates
    if prefs.income is not None:
        user.income = prefs.income

    if prefs.budget is not None:
        user.budget = prefs.budget

    if prefs.preferred_policy_type is not None:
        user.preferred_policy_type = prefs.preferred_policy_type

    db.commit()
    db.refresh(user)

    return {"message": "User preferences updated successfully"}
