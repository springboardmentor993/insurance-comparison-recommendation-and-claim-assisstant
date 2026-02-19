"""
Enhanced policy recommendation engine with comprehensive scoring.

Scoring Components (Total 100 points):
1. Budget Match (20 points) - Premium within user's budget range
2. Coverage Match (25 points) - Matches required coverages
3. Risk Factor Match (25 points) - Policy suits user's risk profile
4. Provider Trust (15 points) - Claim settlement ratio + provider reliability
5. Term Match (10 points) - Term duration preference
6. Deductible Match (5 points) - Deductible within tolerance
"""
from datetime import date
from typing import Dict, List, Optional, Any, Tuple


# ============================================================================
# SCORING FUNCTIONS
# ============================================================================

def budget_match_score(premium: float, budget_min: Optional[float], budget_max: Optional[float]) -> float:
    """
    Score based on how well premium fits within budget range (0-20 points).
    - Premium within range: 20 points
    - Premium slightly outside: Linear decay
    - Premium way outside: 0 points
    """
    if budget_min is None and budget_max is None:
        return 20.0  # No budget specified, full score
    
    premium = float(premium)
    
    # Handle only min or only max
    if budget_min is None:
        budget_min = 0
    if budget_max is None:
        budget_max = budget_min * 3  # Assume 3x min if no max
    
    budget_min = float(budget_min)
    budget_max = float(budget_max)
    
    # Premium within range
    if budget_min <= premium <= budget_max:
        return 20.0
    
    # Premium below minimum (good for user, but they might not trust it)
    if premium < budget_min:
        diff_ratio = (budget_min - premium) / budget_min
        return max(15.0, 20.0 - (diff_ratio * 10.0))
    
    # Premium above maximum (bad)
    if premium > budget_max:
        diff_ratio = (premium - budget_max) / budget_max
        score = 20.0 - (diff_ratio * 40.0)  # Decays faster for over-budget
        return max(0.0, score)
    
    return 10.0


def coverage_match_score(
    policy_coverage: Optional[Dict[str, Any]],
    preferred_coverages: Optional[List[str]]
) -> float:
    """
    Score based on coverage match (0-25 points).
    Percentage of preferred coverages that the policy provides.
    """
    if not preferred_coverages:
        return 25.0  # No specific coverage requirements, full score
    
    if not policy_coverage or not isinstance(policy_coverage, dict):
        return 0.0
    
    policy_keys = set(str(k).lower() for k in policy_coverage.keys())
    preferred = [str(c).lower() for c in preferred_coverages]
    
    matched = sum(1 for c in preferred if c in policy_keys)
    match_ratio = matched / len(preferred)
    
    return match_ratio * 25.0


def risk_factor_score(
    policy_type: str,
    policy: Any,
    user_risk_factors: Optional[Dict[str, Any]],
    user_age: Optional[int]
) -> float:
    """
    Score based on risk factor compatibility (0-25 points).
    
    Uses Strategy Pattern via ScorerRegistry for extensibility.
    New insurance types can be added without modifying this function.
    """
    if not user_risk_factors:
        return 15.0  # Default score if no risk factors
    
    policy_type = policy_type.lower().strip()
    
    # Import here to avoid circular imports
    from services.scoring import ScorerRegistry
    
    # Use Strategy Pattern - get the appropriate scorer
    scorer = ScorerRegistry.get(policy_type)
    
    if scorer:
        # Get risk factors for this specific insurance type
        type_risk_factors = user_risk_factors.get(policy_type, {})
        if isinstance(type_risk_factors, dict):
            return scorer.calculate_score(policy, type_risk_factors, user_age)
    
    # Fallback to legacy functions for backward compatibility
    if policy_type == "health":
        return _health_risk_score(policy, user_risk_factors.get("health", {}), user_age)
    elif policy_type == "life":
        return _life_risk_score(policy, user_risk_factors.get("life", {}), user_age)
    elif policy_type == "auto":
        return _auto_risk_score(policy, user_risk_factors.get("auto", {}))
    
    return ScorerRegistry.get_default_score()


def _health_risk_score(policy: Any, health_factors: Dict[str, Any], age: Optional[int]) -> float:
    """Health insurance risk scoring."""
    score = 25.0
    
    # Medical history check
    medical_history = health_factors.get("medical_history", [])
    if medical_history and len(medical_history) > 0:
        # Higher deductible might not be suitable
        policy_deductible = getattr(policy, "deductible", None)
        if policy_deductible and float(policy_deductible) > 10000:
            score -= 5.0
        
        # Need good coverage
        coverage = getattr(policy, "coverage", {})
        if not coverage or not isinstance(coverage, dict):
            score -= 5.0
    
    # Smoking/alcohol check
    smoking = health_factors.get("smoking_status", "non_smoker")
    if smoking in ["regular", "occasional"]:
        # Smokers need better coverage, premium might be higher
        score -= 2.0
    
    # Age factor
    if age:
        if age > 50:
            # Older people need comprehensive coverage
            premium = float(getattr(policy, "premium", 0))
            if premium < 5000:  # Too cheap might mean poor coverage
                score -= 3.0
        elif age < 30:
            # Younger people can opt for basic coverage
            premium = float(getattr(policy, "premium", 0))
            if premium > 15000:  # Might be too expensive
                score -= 2.0
    
    return max(0.0, score)


def _life_risk_score(policy: Any, life_factors: Dict[str, Any], age: Optional[int]) -> float:
    """Life insurance risk scoring."""
    score = 25.0
    
    income = life_factors.get("income")
    dependents = life_factors.get("dependents", 0)
    risk_appetite = life_factors.get("risk_appetite", "medium")
    
    premium = float(getattr(policy, "premium", 0))
    
    # Income to premium ratio check
    if income:
        income = float(income)
        premium_to_income = (premium / income) * 100
        
        if premium_to_income > 5:  # Premium > 5% of income is high
            score -= 5.0
        elif premium_to_income < 1:  # Premium < 1% might mean low coverage
            if dependents > 2:
                score -= 3.0
    
    # Dependents check
    if dependents > 2:
        # Need higher coverage
        coverage = getattr(policy, "coverage", {})
        if isinstance(coverage, dict):
            sum_assured = coverage.get("sum_assured", 0)
            if sum_assured < 5000000:
                score -= 4.0
    
    # Risk appetite
    if risk_appetite == "low":
        # Conservative users prefer established providers
        if not hasattr(policy, "claim_settlement_ratio"):
            score -= 2.0
    
    return max(0.0, score)


def _auto_risk_score(policy: Any, auto_factors: Dict[str, Any]) -> float:
    """Auto insurance risk scoring."""
    score = 25.0
    
    car_age = auto_factors.get("car_age_years", 0)
    driving_history = auto_factors.get("driving_history", "clean")
    location_risk = auto_factors.get("location_risk", "urban")
    
    # Car age affects coverage needs
    if car_age:
        if car_age > 5:
            # Older cars might not need comprehensive coverage
            premium = float(getattr(policy, "premium", 0))
            if premium > 20000:
                score -= 4.0
        else:
            # New cars need good coverage
            coverage = getattr(policy, "coverage", {})
            if not coverage or not isinstance(coverage, dict):
                score -= 5.0
    
    # Driving history
    if driving_history in ["major_violations", "minor_violations"]:
        # Bad driving history might mean higher premiums
        score -= 3.0
    
    # Location risk
    if location_risk == "metro":
        # Metro areas need comprehensive coverage (theft, accidents)
        coverage = getattr(policy, "coverage", {})
        if isinstance(coverage, dict):
            if "theft" not in str(coverage).lower():
                score -= 3.0
    
    return max(0.0, score)


def provider_trust_score(
    claim_settlement_ratio: Optional[float],
    provider_rating: Optional[float],
    provider_reliability: Optional[float]
) -> float:
    """
    Score based on provider trustworthiness (0-15 points).
    - Claim settlement ratio: 0-8 points
    - Provider rating: 0-4 points
    - Provider reliability: 0-3 points
    """
    score = 0.0
    
    # Claim settlement ratio (0-8 points)
    if claim_settlement_ratio is not None:
        ratio = float(claim_settlement_ratio)
        if ratio >= 95:
            score += 8.0
        elif ratio >= 90:
            score += 6.0
        elif ratio >= 85:
            score += 4.0
        elif ratio >= 80:
            score += 2.0
    else:
        score += 4.0  # Default if not available
    
    # Provider rating (0-4 points)
    if provider_rating is not None:
        rating = float(provider_rating)
        score += (rating / 5.0) * 4.0
    else:
        score += 2.0  # Default
    
    # Provider reliability score (0-3 points)
    if provider_reliability is not None:
        reliability = float(provider_reliability)
        score += (reliability / 5.0) * 3.0
    else:
        score += 1.5  # Default
    
    return min(15.0, score)


def term_match_score(policy_term_months: int, preferred_term_months: Optional[int]) -> float:
    """
    Score based on term duration match (0-10 points).
    """
    if preferred_term_months is None:
        return 10.0  # No preference, full score
    
    policy_term = int(policy_term_months)
    preferred_term = int(preferred_term_months)
    
    # Exact match
    if policy_term == preferred_term:
        return 10.0
    
    # Close match (within 3 months)
    diff = abs(policy_term - preferred_term)
    if diff <= 3:
        return 8.0
    
    # Within 6 months
    if diff <= 6:
        return 5.0
    
    # Far off
    return 2.0


def deductible_match_score(
    policy_deductible: Optional[float],
    deductible_tolerance: Optional[str]
) -> float:
    """
    Score based on deductible matching user tolerance (0-5 points).
    Tolerance: "low", "medium", "high"
    """
    if deductible_tolerance is None:
        return 5.0  # No preference, full score
    
    if policy_deductible is None:
        return 5.0  # No deductible is always good
    
    deductible = float(policy_deductible)
    tolerance = deductible_tolerance.lower()
    
    if tolerance == "low":
        # User wants low deductible
        if deductible < 3000:
            return 5.0
        elif deductible < 5000:
            return 3.0
        else:
            return 1.0
    elif tolerance == "medium":
        # User accepts moderate deductible
        if 3000 <= deductible <= 10000:
            return 5.0
        elif deductible < 3000 or deductible <= 15000:
            return 3.0
        else:
            return 1.0
    elif tolerance == "high":
        # User is okay with high deductible (lower premium)
        if deductible > 10000:
            return 5.0
        elif deductible > 5000:
            return 3.0
        else:
            return 2.0
    
    return 3.0


# ============================================================================
# MAIN SCORING FUNCTION
# ============================================================================

def score_policy(
    policy: Any,
    user: Any,
    preferences: Dict[str, Any]
) -> Tuple[float, str, Dict[str, float]]:
    """
    Score a single policy against user preferences and risk factors.
    
    Returns:
        (final_score, reason, score_breakdown)
    """
    # Extract policy attributes
    policy_premium = float(getattr(policy, "premium", 0) or 0)
    policy_coverage = getattr(policy, "coverage", None)
    policy_type = str(getattr(policy, "policy_type", "")).lower()
    policy_term = int(getattr(policy, "term_months", 12))
    policy_deductible = getattr(policy, "deductible", None)
    policy_claim_ratio = getattr(policy, "claim_settlement_ratio", None)
    policy_provider_rating = getattr(policy, "provider_rating", None)
    
    # Get provider reliability if available
    provider = getattr(policy, "provider", None)
    provider_reliability = getattr(provider, "reliability_score", None) if provider else None
    
    # Extract user preferences
    prefs = preferences.get("preferences", {}) if isinstance(preferences.get("preferences"), dict) else {}
    risk_factors = preferences.get("risk_factors", {}) if isinstance(preferences.get("risk_factors"), dict) else {}
    
    budget_min = prefs.get("budget_min")
    budget_max = prefs.get("budget_max")
    preferred_coverages = prefs.get("preferred_coverages", [])
    term_pref = prefs.get("term_duration_months")
    deductible_tol = prefs.get("deductible_tolerance")
    
    # Calculate user age from DOB
    user_age = None
    user_dob = getattr(user, "dob", None)
    if user_dob:
        today = date.today()
        user_age = today.year - user_dob.year - ((today.month, today.day) < (user_dob.month, user_dob.day))
    
    # Calculate scores
    budget_score = budget_match_score(policy_premium, budget_min, budget_max)
    coverage_score = coverage_match_score(policy_coverage, preferred_coverages)
    risk_score = risk_factor_score(policy_type, policy, risk_factors, user_age)
    trust_score = provider_trust_score(policy_claim_ratio, policy_provider_rating, provider_reliability)
    term_score = term_match_score(policy_term, term_pref)
    deduct_score = deductible_match_score(policy_deductible if policy_deductible else None, deductible_tol)
    
    # Total score
    total_score = budget_score + coverage_score + risk_score + trust_score + term_score + deduct_score
    
    # Generate reason
    reason = _generate_reason(
        budget_score, coverage_score, risk_score, trust_score,
        term_score, deduct_score, policy_type, policy_claim_ratio
    )
    
    # Score breakdown
    breakdown = {
        "budget_match": round(budget_score, 2),
        "coverage_match": round(coverage_score, 2),
        "risk_factor_match": round(risk_score, 2),
        "provider_trust": round(trust_score, 2),
        "term_match": round(term_score, 2),
        "deductible_match": round(deduct_score, 2),
        "total_score": round(total_score, 2)
    }
    
    return (round(total_score, 2), reason, breakdown)


def _generate_reason(
    budget_score: float,
    coverage_score: float,
    risk_score: float,
    trust_score: float,
    term_score: float,
    deduct_score: float,
    policy_type: str,
    claim_ratio: Optional[float]
) -> str:
    """Generate human-readable recommendation reason."""
    reasons = []
    
    if budget_score >= 18:
        reasons.append("Perfect budget fit")
    elif budget_score >= 15:
        reasons.append("Within budget range")
    
    if coverage_score >= 20:
        reasons.append("Excellent coverage match")
    elif coverage_score >= 15:
        reasons.append("Good coverage")
    
    if risk_score >= 20:
        reasons.append("Ideal for your risk profile")
    elif risk_score >= 15:
        reasons.append("Suitable for your needs")
    
    if trust_score >= 12:
        reasons.append("Highly trusted provider")
    elif trust_score >= 9:
        reasons.append("Reliable provider")
    
    if claim_ratio and claim_ratio >= 95:
        reasons.append(f"{claim_ratio}% claim settlement")
    
    if term_score >= 8:
        reasons.append("Perfect term duration")
    
    if not reasons:
        reasons.append(f"Standard {policy_type} policy option")
    
    return "; ".join(reasons)
