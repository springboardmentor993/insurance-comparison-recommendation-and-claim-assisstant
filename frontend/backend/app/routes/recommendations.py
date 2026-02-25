from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from app.database import get_db
from app.models import User, Policy, Recommendation, PolicyType
from app.schemas.schemas import RecommendationResponse
from app.auth import get_current_user
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


def calculate_policy_score(user: User, policy: Policy) -> tuple[float, str]:
    """Calculate recommendation score for a policy based on user preferences"""
    try:
        score = 0.0
        reasons = []
        
        risk_profile = user.risk_profile or {}
        
        # 1. Budget Match (35 points)
        budget_pref = risk_profile.get("budget", "medium")
        try:
            premium = float(policy.premium) if policy.premium is not None else 0.0
        except (ValueError, TypeError):
            premium = 0.0
            
        budget_ranges = {
            "low": (0, 500),
            "medium": (500, 1500),
            "high": (1500, 10000)
        }
        
        min_budget, max_budget = budget_ranges.get(budget_pref, (0, 10000))
        
        if min_budget <= premium <= max_budget:
            score += 35
            reasons.append(f"✓ Fits your {budget_pref} budget (₹{premium}/mo)")
        elif premium < min_budget:
            score += 20
            reasons.append(f"Below budget - great value (₹{premium}/mo)")
        else:
            score += 5
            reasons.append(f"Above budget range")
        
        # 2. Priority Match (35 points)
        priority = risk_profile.get("priority", "balanced")
        
        if priority == "cheap":
            if premium < 500:
                score += 35
                reasons.append("✓ Low premium as you prioritize cost")
            elif premium < 1000:
                score += 20
            else:
                score += 10
        elif priority == "coverage":
            coverage_score = len(policy.coverage or {}) if policy.coverage else 0
            if coverage_score >= 5:
                score += 35
                reasons.append("✓ Strong coverage as you prioritize protection")
            elif coverage_score >= 3:
                score += 20
            else:
                score += 10
        else:  # balanced
            coverage_score = len(policy.coverage or {}) if policy.coverage else 0
            if 500 <= premium <= 1500 and coverage_score >= 3:
                score += 35
                reasons.append("✓ Balanced premium and coverage")
            else:
                score += 15
        
        # 3. Age-Based Recommendations (15 points)
        user_age = risk_profile.get("age")
        if user_age:
            try:
                age = int(user_age)
                # Handle PolicyType enum or string
                p_type = policy.policy_type
                p_type_val = ""
                if isinstance(p_type, PolicyType):
                    p_type_val = p_type.value
                elif p_type:
                    p_type_val = str(p_type).lower()

                if p_type_val == "health":
                    if age > 40:
                        score += 15
                        reasons.append(f"✓ Health coverage important at age {age}")
                    elif age > 30:
                        score += 10
                elif p_type_val == "life":
                    if 25 <= age <= 45:
                        score += 15
                        reasons.append(f"✓ Ideal age {age} for life insurance")
                    else:
                        score += 5
                elif p_type_val == "auto":
                    if age >= 25:
                        score += 10
                        reasons.append("✓ Good rates for your age")
                elif p_type_val == "travel":
                    if age < 60:
                        score += 15
                    else:
                        score += 10
                elif p_type_val == "home":
                    if age > 25:
                        score += 15
            except (ValueError, TypeError):
                pass
        
        # 4. Coverage Amount Match (15 points)
        desired_coverage = risk_profile.get("coverage_amount")
        
        # Try to get limit from attribute or coverage JSON
        policy_limit = getattr(policy, "coverage_limit", None)
        if policy_limit is None and policy.coverage:
             policy_limit = policy.coverage.get("limit")

        if desired_coverage and policy_limit:
            try:
                desired = float(desired_coverage)
                limit = float(policy_limit)
                
                if limit >= desired:
                    score += 15
                    reasons.append(f"✓ Coverage limit meets your needs (₹{limit:,.0f})")
                elif limit >= desired * 0.7:
                    score += 10
                else:
                    score += 5
            except (ValueError, TypeError):
                pass
        elif desired_coverage and policy.coverage:
            # Try to infer from coverage JSON if specific key exists (e.g., "Sum Insured")
            # For now, just give a partial score if it looks like a high-tier policy
            if "Platinum" in str(policy.coverage) or "Gold" in str(policy.coverage):
                 # Assume high coverage for premium plans
                 score += 10
        
        reason_text = " | ".join(reasons) if reasons else "General match"
        return min(100.0, max(0.0, score)), reason_text
        
    except Exception as e:
        logger.error(f"Error scoring policy {policy.id}: {str(e)}")
        # Return a safe fallback
        return 0.0, "Error calculating score"


@router.get("/", response_model=List[RecommendationResponse])
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 100
):
    """Get personalized policy recommendations for current user"""
    # Check for existing recommendations
    existing = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).order_by(desc(Recommendation.created_at)).first()
    
    # Regenerate if no recommendations or older than 7 days
    should_regenerate = True
    if existing:
        from datetime import datetime, timedelta
        if datetime.now() - existing.created_at < timedelta(days=7):
            should_regenerate = False
    
    if should_regenerate:
        # Clear old recommendations
        db.query(Recommendation).filter(
            Recommendation.user_id == current_user.id
        ).delete()
        
        # Get all policies to generate comprehensive recommendations
        policies = db.query(Policy).all()
        
        # Calculate scores for filtered policies
        for policy in policies:
            score, reason = calculate_policy_score(current_user, policy)
            
            recommendation = Recommendation(
                user_id=current_user.id,
                policy_id=policy.id,
                score=score,
                reason=reason
            )
            db.add(recommendation)
        
        db.commit()
    
    
    # Return top recommendations (increased limit to ensure all categories are covered)
    recommendations = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).order_by(desc(Recommendation.score)).limit(1000).all()
    
    return recommendations


@router.post("/regenerate", response_model=List[RecommendationResponse])
def regenerate_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Force regenerate recommendations"""
    # Clear existing recommendations
    db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).delete()
    
    # Get all policies to generate comprehensive recommendations
    policies = db.query(Policy).all()
    
    for policy in policies:
        score, reason = calculate_policy_score(current_user, policy)
        
        recommendation = Recommendation(
            user_id=current_user.id,
            policy_id=policy.id,
            score=score,
            reason=reason
        )
        db.add(recommendation)
    
    db.commit()
    
    # Return top 1000
    recommendations = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).order_by(desc(Recommendation.score)).limit(1000).all()
    
    return recommendations
