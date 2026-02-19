"""
Enhanced recommendations with comprehensive scoring.
POST /generate - Generate recommendations using enhanced algorithm
GET /my-recommendations - Get saved recommendations with details
"""
from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models.models import User, Policy, Recommendation
from schemas.schemas import (
    RecommendationRequest,
    GenerateRecommendationItem,
    RecommendationOut,
    ProviderOut,
    ScoreBreakdown,
)
from core.deps import get_db
from auth.auth_deps import get_current_user_email
from services.recommendation_service import score_policy

router = APIRouter()


@router.post("/generate", response_model=List[GenerateRecommendationItem])
def generate_recommendations(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    """
    Generate personalized policy recommendations using enhanced scoring algorithm.
    Uses user's saved preferences and risk factors, with optional overrides.
    """
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's risk profile (preferences + risk factors)
    user_risk_profile = dict(user.risk_profile) if user.risk_profile else {}
    
    # Merge request overrides with user profile
    preferences = _merge_preferences(user_risk_profile, request)
    
    # Get preferred policy types for filtering
    prefs = preferences.get("preferences", {})
    preferred_types = prefs.get("preferred_policy_types")
    
    # Query policies, optionally filtered by type
    query = db.query(Policy)
    if preferred_types and isinstance(preferred_types, list):
        types = [str(t).strip().lower() for t in preferred_types if t]
        if types:
            query = query.filter(Policy.policy_type.in_(types))
    
    policies = query.all()
    
    if not policies:
        raise HTTPException(
            status_code=404,
            detail="No policies found. Try setting preferred_policy_types in your profile."
        )
    
    # Score each policy using enhanced algorithm
    scored = []
    for policy in policies:
        score_val, reason, breakdown = score_policy(policy, user, preferences)
        scored.append((policy, score_val, reason, breakdown))
    
    # Sort by score descending, take top 5
    scored.sort(key=lambda x: x[1], reverse=True)
    top5 = scored[:5]
    
    # Delete existing recommendations for this user
    db.query(Recommendation).filter(Recommendation.user_id == user.id).delete()
    
    # Save new recommendations
    result: List[GenerateRecommendationItem] = []
    for policy, score_val, reason, breakdown in top5:
        rec = Recommendation(
            user_id=user.id,
            policy_id=policy.id,
            score=score_val,
            reason=reason,
        )
        db.add(rec)
        db.flush()
        
        result.append(
            GenerateRecommendationItem(
                policy_id=policy.id,
                score=score_val,
                reason=reason,
                score_breakdown=ScoreBreakdown(**breakdown)
            )
        )
    
    db.commit()
    return result


@router.get("/my-recommendations", response_model=List[RecommendationOut])
def get_my_recommendations(
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    """Return saved recommendations with full policy details."""
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    recs = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == user.id)
        .order_by(Recommendation.score.desc())
        .all()
    )
    
    out: List[RecommendationOut] = []
    for rec in recs:
        policy = rec.policy
        if not policy:
            continue
        provider = policy.provider
        
        out.append(
            RecommendationOut(
                id=rec.id,
                policy_id=policy.id,
                title=policy.title,
                premium=float(policy.premium),
                score=float(rec.score),
                reason=rec.reason,
                policy_type=policy.policy_type,
                term_months=policy.term_months,
                deductible=float(policy.deductible) if policy.deductible else None,
                claim_settlement_ratio=float(policy.claim_settlement_ratio) if policy.claim_settlement_ratio else None,
                provider_rating=float(policy.provider_rating) if policy.provider_rating else None,
                coverage=policy.coverage,
                provider=ProviderOut(
                    id=provider.id,
                    name=provider.name,
                    country=provider.country,
                    reliability_score=float(provider.reliability_score) if provider.reliability_score else None,
                ),
            )
        )
    
    return out


def _merge_preferences(user_profile: dict, overrides: RecommendationRequest) -> dict:
    """Merge user's saved profile with request overrides."""
    # Start with user's saved profile
    merged = dict(user_profile)
    
    # Ensure preferences and risk_factors dicts exist
    if "preferences" not in merged or not isinstance(merged["preferences"], dict):
        merged["preferences"] = {}
    if "risk_factors" not in merged or not isinstance(merged["risk_factors"], dict):
        merged["risk_factors"] = {}
    
    # Apply overrides from request
    if overrides.budget_min is not None:
        merged["preferences"]["budget_min"] = overrides.budget_min
    if overrides.budget_max is not None:
        merged["preferences"]["budget_max"] = overrides.budget_max
    if overrides.preferred_policy_types is not None:
        merged["preferences"]["preferred_policy_types"] = overrides.preferred_policy_types
    if overrides.required_coverages is not None:
        merged["preferences"]["preferred_coverages"] = overrides.required_coverages
    if overrides.risk_factors is not None:
        merged["risk_factors"] = overrides.risk_factors
    
    return merged
