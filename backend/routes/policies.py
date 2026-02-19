from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from models.models import Policy, User, UserPolicy
from core.deps import get_db
from schemas.schemas import PolicyOut
from pydantic import BaseModel
from auth.auth_deps import get_current_user_email

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


class PurchasePolicyInput(BaseModel):
    policy_id: int
    term_months: int = 12  # Default 1 year
    auto_renew: bool = False


class PurchasePolicyOutput(BaseModel):
    id: int
    policy_number: str
    policy_id: int
    start_date: str
    end_date: str
    premium: float
    status: str
    auto_renew: bool
    message: str


@router.post("/purchase", response_model=PurchasePolicyOutput)
def purchase_policy(
    payload: PurchasePolicyInput,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Purchase a policy and create a UserPolicy record with all required fields.
    Generates a unique policy number and sets start/end dates.
    """
    # Get user
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get policy
    policy = db.query(Policy).filter(Policy.id == payload.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Check if user already has this policy active
    existing = db.query(UserPolicy).filter(
        UserPolicy.user_id == user.id,
        UserPolicy.policy_id == payload.policy_id,
        UserPolicy.status == "active"
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already have an active policy of this type. Please wait for it to expire or cancel it first."
        )
    
    # Generate unique policy number
    year = datetime.now().year
    count = db.query(UserPolicy).filter(
        UserPolicy.policy_number.like(f"POL-{year}-%")
    ).count()
    policy_number = f"POL-{year}-{str(count + 1).zfill(6)}"
    
    # Set dates
    start_date = datetime.now().date()
    end_date = start_date + timedelta(days=payload.term_months * 30)  # Approximate
    
    # Create UserPolicy
    user_policy = UserPolicy(
        user_id=user.id,
        policy_id=policy.id,
        policy_number=policy_number,
        start_date=start_date,
        end_date=end_date,
        premium=policy.premium,
        status="active",
        auto_renew=payload.auto_renew
    )
    
    db.add(user_policy)
    db.commit()
    db.refresh(user_policy)
    
    return PurchasePolicyOutput(
        id=user_policy.id,
        policy_number=policy_number,
        policy_id=policy.id,
        start_date=start_date.isoformat(),
        end_date=end_date.isoformat(),
        premium=float(policy.premium),
        status="active",
        auto_renew=payload.auto_renew,
        message=f"Successfully purchased {policy.title}! Your policy number is {policy_number}."
    )

