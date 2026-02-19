"""
Profile routes for user preferences and risk factors.
GET /me - basic user info (name, email, dob)
GET /profile - complete profile (preferences + risk factors)
PUT /profile - update preferences and risk factors
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from models.models import User
from core.deps import get_db
from auth.auth_deps import get_current_user_email
from schemas.schemas import UserProfileUpdate, UserProfileOut

router = APIRouter()


class ProfileMeOut:
    """Basic user info response."""
    pass


@router.get("/me")
def get_me(
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    """Return current user's basic profile (name, email, dob)."""
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "name": user.name,
        "email": user.email,
        "dob": str(user.dob) if user.dob else None,
        "role": user.role or "user",
    }


@router.get("/profile", response_model=UserProfileOut)
def get_profile(
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    """Return current user's complete profile (preferences + risk factors)."""
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    risk_profile = user.risk_profile if user.risk_profile else {}
    
    return UserProfileOut(
        preferences=risk_profile.get("preferences"),
        risk_factors=risk_profile.get("risk_factors")
    )


@router.put("/profile", response_model=UserProfileOut)
def update_profile(
    profile_update: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    """Update current user's preferences and risk factors."""
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get existing risk_profile or create empty dict
    risk_profile = dict(user.risk_profile) if user.risk_profile else {}
    
    # Update preferences if provided
    if profile_update.preferences is not None:
        prefs_dict = profile_update.preferences.model_dump(exclude_none=True)
        
        # Get existing preferences or create empty dict
        existing_prefs = risk_profile.get("preferences", {})
        if not isinstance(existing_prefs, dict):
            existing_prefs = {}
        
        # Merge new preferences with existing ones
        existing_prefs.update(prefs_dict)
        risk_profile["preferences"] = existing_prefs
    
    # Update risk factors if provided
    if profile_update.risk_factors is not None:
        risk_factors_dict = profile_update.risk_factors.model_dump(exclude_none=True)
        
        # Get existing risk factors or create empty dict
        existing_factors = risk_profile.get("risk_factors", {})
        if not isinstance(existing_factors, dict):
            existing_factors = {}
        
        # Merge each insurance type separately
        for insurance_type, factors in risk_factors_dict.items():
            if factors is not None:
                existing_type_factors = existing_factors.get(insurance_type, {})
                if not isinstance(existing_type_factors, dict):
                    existing_type_factors = {}
                existing_type_factors.update(factors)
                existing_factors[insurance_type] = existing_type_factors
        
        risk_profile["risk_factors"] = existing_factors
    
    # Save to database
    user.risk_profile = risk_profile
    db.commit()
    db.refresh(user)
    
    return UserProfileOut(
        preferences=risk_profile.get("preferences"),
        risk_factors=risk_profile.get("risk_factors")
    )


# Legacy endpoints for backward compatibility
@router.get("/preferences")
def get_preferences(
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    """Legacy endpoint - return preferences only."""
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    risk_profile = user.risk_profile if user.risk_profile else {}
    return risk_profile.get("preferences", {})


@router.put("/preferences")
def update_preferences(
    preferences: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    """Legacy endpoint - update preferences only."""
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    risk_profile = dict(user.risk_profile) if user.risk_profile else {}
    risk_profile["preferences"] = preferences
    
    user.risk_profile = risk_profile
    db.commit()
    db.refresh(user)
    
    return risk_profile.get("preferences", {})
