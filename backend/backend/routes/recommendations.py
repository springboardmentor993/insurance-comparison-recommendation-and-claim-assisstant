from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
from datetime import date

from schemas import RecommendationOut, PolicyOut
from models import Policy, User, Recommendation
from deps import get_db
from auth_deps import get_current_user

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


def calculate_age(dob: Optional[date]) -> Optional[int]:
    """Calculate age from date of birth"""
    if not dob:
        return None
    today = date.today()
    age = today.year - dob.year
    if (today.month, today.day) < (dob.month, dob.day):
        age -= 1
    return age


def score_policy(
    policy: Policy,
    user: User,
    user_preferences: Dict[str, Any]
) -> tuple[float, List[str]]:
    """
    Score a policy based on user preferences and profile.
    Returns (score, reasons) where score is 0-1.
    """
    score = 0.0
    reasons = []
    max_score = 0.0
    
    # Extract user preferences
    preferred_types = user_preferences.get("preferred_policy_types", [])
    max_premium = user_preferences.get("max_premium")
    user_age = calculate_age(user.dob)
    
    # 1. Policy Type Match (40% weight)
    max_score += 0.4
    if preferred_types and policy.policy_type in preferred_types:
        score += 0.4
        reasons.append(f"Matches your preferred policy type: {policy.policy_type}")
    elif not preferred_types:
        # If no preference set, give partial credit
        score += 0.2
    
    # 2. Premium Affordability (30% weight)
    max_score += 0.3
    policy_premium = float(policy.premium)
    if max_premium:
        if policy_premium <= max_premium:
            # Score based on how much below max premium
            premium_score = 0.3 * (1 - (policy_premium / max_premium) * 0.5)
            score += premium_score
            if policy_premium <= max_premium * 0.7:
                reasons.append(f"Well within your budget (₹{policy_premium:,.0f} vs ₹{max_premium:,.0f} max)")
            else:
                reasons.append(f"Fits your budget (₹{policy_premium:,.0f})")
        else:
            # Penalty for exceeding max premium
            score += 0.05
    else:
        # No budget set, give partial credit
        score += 0.15
    
    # 3. Coverage Value (15% weight)
    max_score += 0.15
    try:
        coverage = {}
        if policy.coverage:
            coverage = json.loads(policy.coverage) if isinstance(policy.coverage, str) else policy.coverage
        
        # Check for comprehensive coverage indicators
        coverage_indicators = len(coverage.keys()) if coverage else 0
        if coverage_indicators >= 3:
            score += 0.15
            reasons.append("Comprehensive coverage with multiple benefits")
        elif coverage_indicators >= 1:
            score += 0.1
            reasons.append("Good coverage options")
        else:
            score += 0.05
    except:
        score += 0.05
    
    # 4. Age Appropriateness (15% weight)
    max_score += 0.15
    if user_age:
        age_appropriate = False
        
        if policy.policy_type == "health":
            if user_age >= 25:
                score += 0.15
                age_appropriate = True
                if user_age >= 40:
                    reasons.append("Highly recommended for your age group")
                else:
                    reasons.append("Good fit for your age")
            else:
                score += 0.1
        
        elif policy.policy_type == "life":
            if 25 <= user_age <= 55:
                score += 0.15
                age_appropriate = True
                reasons.append("Ideal age for life insurance")
            else:
                score += 0.08
        
        elif policy.policy_type == "auto":
            if user_age >= 21:
                score += 0.15
                age_appropriate = True
            else:
                score += 0.05
        
        elif policy.policy_type in ["home", "travel"]:
            if user_age >= 18:
                score += 0.15
                age_appropriate = True
            else:
                score += 0.05
        
        if not age_appropriate:
            score += 0.08
    else:
        # No age info, give partial credit
        score += 0.08
    
    # Normalize score to 0-1 range
    final_score = min(score / max_score, 1.0) if max_score > 0 else 0.0
    
    # Add general reasons if score is high
    if final_score >= 0.8:
        reasons.insert(0, "⭐ Excellent match for your profile")
    elif final_score >= 0.6:
        reasons.insert(0, "Strong recommendation based on your preferences")
    
    return round(final_score, 2), reasons


@router.get("/", response_model=List[RecommendationOut])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 10,
):
    """
    Get personalized policy recommendations for the current user.
    Scores are calculated based on:
    - Preferred policy types
    - Maximum premium budget
    - Age appropriateness
    - Coverage quality
    """
    # Get user preferences from risk_profile
    user_preferences = current_user.risk_profile or {}
    
    # If user has no preferences, return empty list with helpful message
    if not user_preferences or not user_preferences.get("preferred_policy_types"):
        return []
    
    # Get policies matching user preferences
    preferred_types = user_preferences.get("preferred_policy_types", [])
    max_premium = user_preferences.get("max_premium")
    
    # Build query
    query = db.query(Policy)
    
    # Filter by preferred types if set
    if preferred_types:
        query = query.filter(Policy.policy_type.in_(preferred_types))
    
    # Filter by max premium if set (with some buffer for good matches)
    if max_premium:
        query = query.filter(Policy.premium <= max_premium * 1.2)  # 20% buffer
    
    policies = query.all()
    
    # Score each policy
    scored_policies = []
    for policy in policies:
        score, reasons = score_policy(policy, current_user, user_preferences)
        
        # Only include policies with reasonable scores
        if score >= 0.3:
            # Parse coverage
            coverage = {}
            if policy.coverage:
                try:
                    coverage = json.loads(policy.coverage) if isinstance(policy.coverage, str) else policy.coverage
                except:
                    coverage = {"description": policy.coverage}
            
            policy_out = PolicyOut(
                id=policy.id,
                title=policy.title,
                provider=policy.provider.name if policy.provider else None,
                provider_name=policy.provider.name if policy.provider else None,
                premium=float(policy.premium),
                coverage=coverage,
                policy_type=policy.policy_type,
                term_months=policy.term_months,
                deductible=float(policy.deductible) if policy.deductible else None,
            )
            
            scored_policies.append({
                "policy": policy_out,
                "score": score,
                "reasons": reasons,
            })
    
    # Sort by score (highest first)
    scored_policies.sort(key=lambda x: x["score"], reverse=True)
    
    # Limit results
    scored_policies = scored_policies[:limit]
    
    # Optionally save recommendations to database
    # Clear old recommendations for this user
    db.query(Recommendation).filter(Recommendation.user_id == current_user.id).delete()
    
    # Save new recommendations
    for rec in scored_policies:
        db_rec = Recommendation(
            user_id=current_user.id,
            policy_id=rec["policy"].id,
            score=rec["score"],
            reasons=rec["reasons"],
        )
        db.add(db_rec)
    
    db.commit()
    
    return [RecommendationOut(**rec) for rec in scored_policies]
