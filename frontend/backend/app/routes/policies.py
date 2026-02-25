from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.models import Policy, Provider, PolicyType
from app.schemas.schemas import PolicyResponse, PolicyCreate, UserPolicyResponse
from app.auth import get_current_user, get_current_admin, User

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.get("/", response_model=List[PolicyResponse])
def get_policies(
    policy_type: Optional[str] = None,
    provider_id: Optional[int] = None,
    min_premium: Optional[float] = None,
    max_premium: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all policies with optional filters"""
    query = db.query(Policy)
    
    if policy_type:
        query = query.filter(Policy.policy_type == policy_type)
    if provider_id:
        query = query.filter(Policy.provider_id == provider_id)
    if min_premium:
        query = query.filter(Policy.premium >= min_premium)
    if max_premium:
        query = query.filter(Policy.premium <= max_premium)
    
    policies = query.offset(skip).limit(limit).all()
    return policies


@router.get("/me", response_model=List[UserPolicyResponse])
def get_my_policies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all policies purchased by the current user"""
    from app.models import UserPolicy
    user_policies = db.query(UserPolicy).filter(UserPolicy.user_id == current_user.id).all()
    return user_policies


@router.get("/compare/multiple", response_model=List[PolicyResponse])
def compare_policies(
    policy_ids: str = Query(..., description="Comma-separated policy IDs"),
    db: Session = Depends(get_db)
):
    """Compare multiple policies side-by-side"""
    ids = [int(id.strip()) for id in policy_ids.split(",")]
    policies = db.query(Policy).filter(Policy.id.in_(ids)).all()
    
    if len(policies) != len(ids):
        raise HTTPException(status_code=404, detail="One or more policies not found")
    
    return policies


@router.get("/calculate-premium/{policy_id}")
def calculate_premium(
    policy_id: int,
    age: int = Query(..., ge=18, le=100),
    coverage_multiplier: float = Query(1.0, ge=0.5, le=3.0),
    db: Session = Depends(get_db)
):
    """Calculate adjusted premium based on user parameters"""
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    base_premium = float(policy.premium)
    
    # Age-based adjustment
    age_factor = 1.0
    if age < 30:
        age_factor = 0.9
    elif age > 50:
        age_factor = 1.2
    elif age > 60:
        age_factor = 1.5
    
    adjusted_premium = base_premium * age_factor * coverage_multiplier
    
    return {
        "policy_id": policy_id,
        "base_premium": base_premium,
        "age_factor": age_factor,
        "coverage_multiplier": coverage_multiplier,
        "adjusted_premium": round(adjusted_premium, 2),
        "term_months": policy.term_months,
        "total_cost": round(adjusted_premium * (policy.term_months or 12) / 12, 2)
    }


@router.get("/{policy_id}", response_model=PolicyResponse)
def get_policy(policy_id: int, db: Session = Depends(get_db)):
    """Get a specific policy by ID"""
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.post("/", response_model=PolicyResponse)
def create_policy(
    policy_data: PolicyCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new policy (admin only)"""
    # Verify provider exists
    provider = db.query(Provider).filter(Provider.id == policy_data.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    db_policy = Policy(**policy_data.model_dump())
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    
    return db_policy


@router.post("/{policy_id}/enroll", response_model=UserPolicyResponse)
def enroll_in_policy(
    policy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Auto-enroll the current user into a policy so they can file a claim."""
    from app.models import UserPolicy
    from datetime import date, timedelta
    import uuid

    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    # Return existing enrollment if already enrolled
    existing = db.query(UserPolicy).filter(
        UserPolicy.user_id == current_user.id,
        UserPolicy.policy_id == policy_id
    ).first()
    if existing:
        return existing

    today = date.today()
    user_policy = UserPolicy(
        user_id=current_user.id,
        policy_id=policy_id,
        policy_number=f"POL-{uuid.uuid4().hex[:8].upper()}",
        start_date=today,
        end_date=today + timedelta(days=365),
        premium=policy.premium,
        status="active",
        auto_renew=False
    )
    db.add(user_policy)
    db.commit()
    db.refresh(user_policy)
    return user_policy

