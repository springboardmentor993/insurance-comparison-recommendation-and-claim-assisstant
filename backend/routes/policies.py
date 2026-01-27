from typing import List, Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from models import Policy
from deps import get_db
from schemas import PolicyOut
from pydantic import BaseModel
from auth_deps import get_current_user_email

router = APIRouter()


@router.get("/", response_model=List[PolicyOut])
def get_policies(
    policy_type: Optional[str] = Query(default=None),
    min_premium: Optional[float] = Query(default=None),
    max_premium: Optional[float] = Query(default=None),
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    query = db.query(Policy)

    if policy_type:
        query = query.filter(Policy.policy_type == policy_type)
    if min_premium is not None:
        query = query.filter(Policy.premium >= min_premium)
    if max_premium is not None:
        query = query.filter(Policy.premium <= max_premium)

    return query.all()


class PremiumCalcInput(BaseModel):
    policy_id: int
    age: int
    coverage_amount: float
    term_years: int


class PremiumCalcOutput(BaseModel):
    base_premium: float
    loading_factor: float
    final_premium: float


@router.post("/calculate", response_model=PremiumCalcOutput)
def calculate_premium(payload: PremiumCalcInput, db: Session = Depends(get_db)):
    # Validate input
    if payload.age < 0 or payload.age > 120:
        raise HTTPException(status_code=400, detail="Age must be between 0 and 120")
    if payload.coverage_amount < 0:
        raise HTTPException(status_code=400, detail="Coverage amount must be positive")
    if payload.term_years < 1 or payload.term_years > 50:
        raise HTTPException(status_code=400, detail="Term must be between 1 and 50 years")
    
    policy = db.query(Policy).filter(Policy.id == payload.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    try:
        base = float(policy.premium)

        # Simple illustrative factors: age, coverage amount, and term influence price
        age_factor = 1.0 + max(0, (payload.age - 30)) * 0.01  # +1% per year above 30
        coverage_factor = payload.coverage_amount / 500000 if payload.coverage_amount else 1.0
        term_factor = payload.term_years / 10.0 if payload.term_years else 1.0

        loading = age_factor * coverage_factor * term_factor
        final_premium = base * loading

        return PremiumCalcOutput(
            base_premium=base,
            loading_factor=loading,
            final_premium=round(final_premium, 2),
        )
    except (ValueError, TypeError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid calculation input: {str(e)}")
