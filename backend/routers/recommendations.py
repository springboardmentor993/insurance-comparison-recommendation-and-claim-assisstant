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

    # 1️⃣ Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2️⃣ Auth check
    if user.email != current_user:
        raise HTTPException(status_code=403, detail="Not authorized")

    # 3️⃣ Risk profile check
    if not user.risk_profile:
        raise HTTPException(status_code=400, detail="Risk profile not set")

    risk = user.risk_profile

    annual_income = risk.get("annual_income", 0)
    dependents = risk.get("dependents", 0)
    risk_level = risk.get("risk_level", "medium")

    # 4️⃣ Fetch all policies
    policies = db.query(Policy).all()

    recommendations = []

    for policy in policies:
        score = 0
        reasons = []

        # 🔹 1. Affordability (25 points)
        if policy.premium <= annual_income * 0.05:
            score += 25
            reasons.append("Affordable based on your income")

        # 🔹 2. Risk level logic (20 points)
        if risk_level == "high" and policy.deductible < 5000:
            score += 20
            reasons.append("Low deductible suits high risk profile")

        if risk_level == "low" and policy.deductible >= 5000:
            score += 15
            reasons.append("Higher deductible suits low risk profile")

        # 🔹 3. Dependents logic (10 points)
        if dependents >= 2:
            score += 10
            reasons.append("Suitable for family coverage")

        # 🔹 4. Low deductible bonus (5 points)
        if policy.deductible < 3000:
            score += 5
            reasons.append("Low deductible bonus")

        # 🔹 5. Premium ranking bonus (up to 40 points)
        premium_score = max(0, 40 - int(policy.premium / 1000))
        score += premium_score

        reason_text = ", ".join(reasons) if reasons else "Basic eligibility match"

        recommendations.append({
            "id": policy.id,
            "title": policy.title,
            "policy_type": policy.policy_type,
            "premium": policy.premium,
            "deductible": policy.deductible,
            "score": score,
            "reason": reason_text
        })

    # 6️⃣ Sort by score (highest first)
    recommendations.sort(key=lambda x: x["score"], reverse=True)

    # 7️⃣ Return top 5
    return {
        "annual_income": annual_income,
        "top_recommendations": recommendations[:5]
    }
