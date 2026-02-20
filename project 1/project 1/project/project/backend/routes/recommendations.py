from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from models import User, Policy, RiskProfile, Recommendation
from schemas import RecommendationOut, RecommendationRequest, ProviderOut
from deps import get_db
from auth_deps import get_current_user_email

router = APIRouter()


# ---------------------------------------------------------
# Create readable reason text for each recommendation
# ---------------------------------------------------------
def generate_reason(score_components: dict, policy: Policy, user: User) -> str:
    reasons = []

    if score_components.get("budget_match"):
        reasons.append("Fits within your budget")

    if score_components.get("age_match"):
        reasons.append("Suitable for your age group")

    if score_components.get("risk_match"):
        reasons.append("Matches your risk profile")

    if score_components.get("dependents_match"):
        reasons.append("Good coverage for family needs")

    if score_components.get("deductible_match"):
        reasons.append("Low deductible option")

    if score_components.get("preference_match"):
        reasons.append("Matches your preferred policy type")

    if score_components.get("income_match"):
        reasons.append("Recommended based on your income level")

    if not reasons:
        reasons.append("Standard coverage option")

    return "; ".join(reasons)



# ---------------------------------------------------------
# Generate personalized recommendations
# ---------------------------------------------------------
@router.post("/generate", response_model=List[RecommendationOut])
def generate_recommendations(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    # Get user details
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.risk_profile:
        raise HTTPException(status_code=400, detail="Please complete your risk profile first.")

    if not user.dob:
        raise HTTPException(status_code=400, detail="Please update your date of birth to continue.")


    # ---------- Calculate age from DOB ----------
    today = date.today()
    age = today.year - user.dob.year - (
        (today.month, today.day) < (user.dob.month, user.dob.day)
    )


    # ---------- If user didn't send policy_type, use saved preference ----------
    if not request.policy_type:
        if user.preferred_policy_type:
            request.policy_type = user.preferred_policy_type
        else:
            raise HTTPException(
                status_code=400, 
                detail="Please provide policy_type or set your preferred_policy_type in profile preferences"
            )


    # ---------- Get all policies of selected type ----------
    policies = db.query(Policy).filter(Policy.policy_type == request.policy_type).all()
    if not policies:
        raise HTTPException(status_code=404, detail=f"No policies found for type: {request.policy_type}")


    # ---------- Use request budget first, else use user's saved budget ----------
    effective_budget = request.budget or user.budget


    scored_policies = []

    # ---------------------------------------------------------
    # Score each policy
    # ---------------------------------------------------------
    for policy in policies:
        score = 0.0
        score_components = {}

        # ---------- Budget scoring ----------
        if effective_budget:
            if float(policy.premium) <= effective_budget:
                score += 25
                score_components["budget_match"] = True

        # ---------- Age scoring ----------
        if request.policy_type == "health" and age >= 45:
            score += 20
            score_components["age_match"] = True
        elif request.policy_type == "life" and 30 <= age <= 60:
            score += 20
            score_components["age_match"] = True

        # ---------- Risk profile scoring ----------
        risk = user.risk_profile.risk_profile.lower()

        if risk == "high" and policy.deductible is not None and float(policy.deductible) <= 10000:
            score += 15
            score_components["deductible_match"] = True
        elif risk == "medium" and policy.deductible is not None and float(policy.deductible) <= 15000:
            score += 15
            score_components["deductible_match"] = True
        elif risk == "low" and policy.deductible is not None and float(policy.deductible) >= 20000:
            score += 15
            score_components["deductible_match"] = True

        # ---------- Dependents scoring ----------
        if user.risk_profile.dependents >= 3:
            score += 10
            score_components["dependents_match"] = True
        elif user.risk_profile.dependents >= 1:
            score += 5
            score_components["dependents_match"] = True

        # ---------- Preferred policy type scoring ----------
        if user.preferred_policy_type and policy.policy_type == user.preferred_policy_type:
            score += 10
            score_components["preference_match"] = True

        # ---------- Income scoring ----------
        if user.income:
            if user.income < 300000 and float(policy.premium) <= 5000:
                score += 8
                score_components["income_match"] = True
            elif 300000 <= user.income < 500000 and float(policy.premium) <= 10000:
                score += 8
                score_components["income_match"] = True
            elif 500000 <= user.income < 1000000 and float(policy.premium) <= 20000:
                score += 8
                score_components["income_match"] = True
            elif user.income >= 1000000:
                score += 8
                score_components["income_match"] = True

        reason = generate_reason(score_components, policy, user)

        scored_policies.append({
            "policy": policy,
            "score": round(score, 2),
            "reason": reason
        })


    # ---------------------------------------------------------
    # Sort and save top 5 recommendations
    # ---------------------------------------------------------
    scored_policies.sort(key=lambda x: x["score"], reverse=True)
    top_policies = scored_policies[:5]

    # Remove old recommendations (same policy type)
    old = db.query(Recommendation).join(Policy).filter(
        Recommendation.user_id == user.id,
        Policy.policy_type == request.policy_type
    ).all()

    for r in old:
        db.delete(r)

    # Save new recommendations
    saved = []
    for item in top_policies:
        rec = Recommendation(
            user_id=user.id,
            policy_id=item["policy"].id,
            score=item["score"],
            reason=item["reason"]
        )
        saved.append(rec)

    db.add_all(saved)
    db.commit()

    # ---------- Return final formatted result ----------
    output = []
    for rec in saved:
        db.refresh(rec)
        policy = rec.policy
        output.append(RecommendationOut(
            id=rec.id,
            policy_id=policy.id,
            title=policy.title,
            premium=float(policy.premium),
            score=float(rec.score),
            reason=rec.reason,
            policy_type=policy.policy_type,
            provider=ProviderOut(
                id=policy.provider.id,
                name=policy.provider.name,
                country=policy.provider.country
            )
        ))

    return output
