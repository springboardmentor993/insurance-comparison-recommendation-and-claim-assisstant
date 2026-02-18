from datetime import date
from typing import Optional, Any, Dict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from deps import get_db
from models import User
from schemas import ProfileOut, ProfileUpdate, PreferencesOut

from auth_deps import get_current_user

router = APIRouter()


def _age_from_dob(dob: Optional[date]) -> Optional[int]:
    if not dob:
        return None
    today = date.today()
    age = today.year - dob.year
    if (today.month, today.day) < (dob.month, dob.day):
        age -= 1
    return age


def _prefs_from_db(raw: Any) -> Optional[PreferencesOut]:
    if not raw or not isinstance(raw, dict):
        return None
    pt = raw.get("preferred_policy_types")
    if pt is not None and not isinstance(pt, list):
        pt = None
    mp = raw.get("max_premium")
    max_premium = float(mp) if mp is not None else None
    return PreferencesOut(preferred_policy_types=pt, max_premium=max_premium)


def _prefs_to_db(p: Optional[PreferencesOut]) -> Optional[Dict[str, Any]]:
    if not p:
        return None
    out: Dict[str, Any] = {}
    out["preferred_policy_types"] = p.preferred_policy_types if p.preferred_policy_types is not None else []
    out["max_premium"] = p.max_premium
    return out


@router.get("/", response_model=ProfileOut)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    age = _age_from_dob(current_user.dob)
    prefs = _prefs_from_db(current_user.risk_profile)
    return ProfileOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        dob=current_user.dob,
        age=age,
        preferences=prefs,
        created_at=current_user.created_at,
    )


@router.put("/", response_model=ProfileOut)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.dob is not None:
        current_user.dob = payload.dob
    if payload.preferences is not None:
        current_user.risk_profile = _prefs_to_db(payload.preferences)

    db.commit()
    db.refresh(current_user)

    age = _age_from_dob(current_user.dob)
    prefs = _prefs_from_db(current_user.risk_profile)
    return ProfileOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        dob=current_user.dob,
        age=age,
        preferences=prefs,
        created_at=current_user.created_at,
    )
