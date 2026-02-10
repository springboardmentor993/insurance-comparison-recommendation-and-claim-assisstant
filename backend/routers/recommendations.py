from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, Policy
from oauth2 import get_current_user

router = APIRouter()

@router.get("/users/{user_id}/recommendations")
def get_recommendations(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    # 1. Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Auth check
    if user.email != current_user:
        raise HTTPException(status_code=403, detail="Not authorized")

    # 3. Read budget from risk_profile
    if not user.risk_profile or "annual_income" not in user.risk_profile:
        raise HTTPException(status_code=400, detail="Risk profile not set")

    budget = user.risk_profile["annual_income"]

    # 4. Fetch policies within budget
    policies = (
        db.query(Policy)
        .filter(Policy.premium <= budget)
        .all()
    )

    # 5. Return policies
    return {
    "budget": budget,
    "recommended_policies": [
        {
            "id": p.id,
            "title": p.title,
            "policy_type": p.policy_type,
            "premium": p.premium,
            "deductible": p.deductible
        }
        for p in policies
    ]
}

