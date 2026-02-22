"""
Two-stage recommendation engine.

Stage 1 (strict): Filter by user-selected policy types.
Stage 2 (soft): Score remaining policies across weighted factors.
"""

from typing import Any, Dict, List, Set, Tuple


WEIGHTS = {
    "coverage": 35.0,
    "premium": 25.0,
    "health": 25.0,
    "type_fit": 10.0,
    "provider": 5.0,
}


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except Exception:
        return default


def _normalize_policy_type(value: Any) -> str:
    if value is None:
        return ""
    if hasattr(value, "value"):
        value = value.value
    return str(value).strip().lower()


def _normalize_risk_profile(value: Any) -> str:
    if value is None:
        return "moderate"
    normalized = str(value).strip().lower()
    mapping = {
        "low": "conservative",
        "medium": "moderate",
        "high": "aggressive",
        "conservative": "conservative",
        "moderate": "moderate",
        "aggressive": "aggressive",
    }
    return mapping.get(normalized, "moderate")


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def _extract_preferred_policy_types(preferences: Dict[str, Any], user_data: Dict[str, Any]) -> Set[str]:
    raw_types: Any = preferences.get("preferred_policy_types")
    if raw_types is None:
        raw_types = preferences.get("preferred_types")
    if raw_types is None:
        raw_types = preferences.get("preferredPolicyType")
    if raw_types is None and isinstance(user_data.get("preferences"), dict):
        nested = user_data.get("preferences")
        raw_types = nested.get("preferred_policy_types", nested.get("preferred_types"))
    if raw_types is None:
        raw_types = user_data.get("preferred_policy_types", user_data.get("preferred_types"))

    if raw_types is None:
        return set()

    if isinstance(raw_types, str):
        raw_types = [raw_types]

    return {_normalize_policy_type(policy_type) for policy_type in raw_types if str(policy_type).strip()}


def _extract_user_age(user_data: Dict[str, Any]) -> int:
    demographics = user_data.get("demographics") if isinstance(user_data.get("demographics"), dict) else {}
    health = user_data.get("health") if isinstance(user_data.get("health"), dict) else {}
    age_value = demographics.get("age", health.get("age", user_data.get("age")))
    try:
        return int(float(age_value)) if age_value is not None else 0
    except Exception:
        return 0


def _extract_user_income(user_data: Dict[str, Any]) -> float:
    demographics = user_data.get("demographics") if isinstance(user_data.get("demographics"), dict) else {}
    income_value = demographics.get("income", user_data.get("income"))
    return max(0.0, _to_float(income_value, 0.0))


def _extract_user_bmi(user_data: Dict[str, Any]) -> float:
    demographics = user_data.get("demographics") if isinstance(user_data.get("demographics"), dict) else {}
    health = user_data.get("health") if isinstance(user_data.get("health"), dict) else {}
    return max(0.0, _to_float(health.get("bmi", demographics.get("bmi", user_data.get("bmi"))), 0.0))


def _extract_user_diseases(user_data: Dict[str, Any]) -> List[Any]:
    if isinstance(user_data.get("diseases"), list):
        return user_data.get("diseases")

    health = user_data.get("health")
    if isinstance(health, dict) and isinstance(health.get("diseases"), list):
        return health.get("diseases")

    demographics = user_data.get("demographics")
    if isinstance(demographics, dict) and isinstance(demographics.get("diseases"), list):
        return demographics.get("diseases")

    return []


def _extract_budget_threshold(preferences: Dict[str, Any], user_data: Dict[str, Any]) -> float:
    budget = preferences.get("max_premium")
    if budget is None:
        budget = preferences.get("maxPremium")
    if budget is None and isinstance(user_data.get("preferences"), dict):
        nested = user_data.get("preferences")
        budget = nested.get("max_premium", nested.get("maxPremium"))
    if budget is None:
        budget = user_data.get("max_premium", user_data.get("maxPremium"))

    budget_value = max(0.0, _to_float(budget, 0.0))
    if budget_value > 0:
        return budget_value

    income_value = _extract_user_income(user_data)
    if income_value > 0:
        return (income_value * 0.05) / 12.0

    return 0.0


def filter_by_policy_type(
    policies: List[Dict[str, Any]],
    preferred_types: Set[str],
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Stage 1: strict policy-type filtering.

    If preferred types are provided, only those policy types are retained.
    If none are provided, all policies are retained.
    """
    metadata = {
        "stage": "policy_type_filtering",
        "initial_count": len(policies),
        "selected_types": sorted(preferred_types) if preferred_types else "ANY",
        "final_count": 0,
        "eliminated_count": 0,
    }

    if not preferred_types:
        metadata["final_count"] = len(policies)
        return policies, metadata

    filtered = [
        policy
        for policy in policies
        if _normalize_policy_type(policy.get("policy_type", policy.get("type"))) in preferred_types
    ]

    metadata["final_count"] = len(filtered)
    metadata["eliminated_count"] = len(policies) - len(filtered)
    return filtered, metadata


def _coverage_detail_score(policy_type: str) -> float:
    if policy_type == "health":
        return 0.95
    if policy_type == "life":
        return 0.85
    if policy_type == "auto":
        return 0.75
    if policy_type == "home":
        return 0.80
    if policy_type == "travel":
        return 0.80
    return 0.80


def calculate_coverage_match(policy: Dict[str, Any], preferred_types: Set[str]) -> float:
    """
    Coverage matching score in [0,1].

    Composite:
    - type match: 30%
    - coverage detail by policy type: 70%
    """
    policy_type = _normalize_policy_type(policy.get("policy_type", policy.get("type")))

    if preferred_types:
        type_match = 1.0 if policy_type in preferred_types else 0.4
    else:
        type_match = 0.6

    coverage_detail = _coverage_detail_score(policy_type)
    combined = (type_match * 0.30) + (coverage_detail * 0.70)
    return _clamp(combined)


def calculate_premium_score(policy: Dict[str, Any], threshold: float) -> float:
    """
    Premium affordability score in [0,1].
    """
    premium = max(0.0, _to_float(policy.get("premium"), 0.0))
    if threshold <= 0:
        return 0.5

    if premium <= threshold:
        ratio = premium / threshold
        score = 0.60 + ((1.0 - ratio) * 0.40)
    else:
        overage_ratio = (premium - threshold) / threshold
        score = 0.40 - (overage_ratio * 0.35)
        score = max(score, 0.05)

    return _clamp(score, 0.05, 1.0)


def calculate_health_risk_alignment(policy: Dict[str, Any], user_data: Dict[str, Any], risk_profile: str) -> float:
    """
    Health and risk alignment score in [0,1].
    """
    policy_type = _normalize_policy_type(policy.get("policy_type", policy.get("type")))
    age = _extract_user_age(user_data)
    bmi = _extract_user_bmi(user_data)
    diseases = _extract_user_diseases(user_data)
    normalized_risk = _normalize_risk_profile(risk_profile)

    if policy_type == "health":
        base = 0.90
        if bmi > 25:
            base += 0.05
        if diseases:
            base += 0.03 * len(diseases)
        base = min(base, 1.0)
    elif policy_type == "life":
        base = 0.85 if age < 50 else 0.75
    elif policy_type == "auto":
        base = 0.70
    elif policy_type == "home":
        base = 0.75
    elif policy_type == "travel":
        base = 0.80 if age < 40 else 0.60
    else:
        base = 0.70

    if normalized_risk == "conservative":
        adjustment = 1.10 if policy_type in {"health", "life"} else 0.95
    elif normalized_risk == "aggressive":
        adjustment = 1.15
    else:
        adjustment = 1.00

    return _clamp(base * adjustment)


def calculate_policy_type_fit(policy: Dict[str, Any], preferred_types: Set[str], user_data: Dict[str, Any]) -> float:
    """
    Policy type fit score in [0,1].
    """
    policy_type = _normalize_policy_type(policy.get("policy_type", policy.get("type")))
    diseases = _extract_user_diseases(user_data)

    if preferred_types and policy_type in preferred_types:
        return 1.0
    if policy_type == "health" and diseases:
        return 0.95
    if not preferred_types:
        return 0.60
    return 0.40


def calculate_provider_score(policy: Dict[str, Any]) -> float:
    """
    Provider score in [0,1].
    Prefer real provider rating, fallback to 0.85.
    """
    provider_rating = policy.get("provider_rating")
    if provider_rating is None:
        provider = policy.get("provider") if isinstance(policy.get("provider"), dict) else {}
        provider_rating = provider.get("rating")

    rating_value = _to_float(provider_rating, 0.0)
    if rating_value <= 0:
        return 0.85
    return _clamp(rating_value / 5.0)


def calculate_policy_score(policy: Dict[str, Any], user_data: Dict[str, Any], risk_profile: str) -> float:
    """
    Stage 2 composite score on 0-100.
    """
    preferences = user_data.get("preferences") if isinstance(user_data.get("preferences"), dict) else {}
    preferred_types = _extract_preferred_policy_types(preferences, user_data)
    threshold = _extract_budget_threshold(preferences, user_data)

    coverage_score = calculate_coverage_match(policy, preferred_types)
    premium_score = calculate_premium_score(policy, threshold)
    health_score = calculate_health_risk_alignment(policy, user_data, risk_profile)
    type_fit_score = calculate_policy_type_fit(policy, preferred_types, user_data)
    provider_score = calculate_provider_score(policy)

    total_score = (
        coverage_score * WEIGHTS["coverage"]
        + premium_score * WEIGHTS["premium"]
        + health_score * WEIGHTS["health"]
        + type_fit_score * WEIGHTS["type_fit"]
        + provider_score * WEIGHTS["provider"]
    )

    return round(_clamp(total_score, 0.0, 100.0), 2)


def generate_recommendation_reason(policy: Dict[str, Any], score: float, user_data: Dict[str, Any]) -> str:
    reasons: List[str] = []

    preferences = user_data.get("preferences") if isinstance(user_data.get("preferences"), dict) else {}
    preferred_types = _extract_preferred_policy_types(preferences, user_data)
    policy_type = _normalize_policy_type(policy.get("policy_type", policy.get("type")))

    if preferred_types and policy_type in preferred_types:
        reasons.append("Matches your preferred policy type")

    threshold = _extract_budget_threshold(preferences, user_data)
    premium = max(0.0, _to_float(policy.get("premium"), 0.0))
    if threshold > 0 and premium <= threshold:
        reasons.append(f"Within your budget ({premium:.0f})")

    diseases = _extract_user_diseases(user_data)
    if policy_type == "health" and diseases:
        reasons.append("Ideal for managing your health conditions")

    if not reasons:
        reasons.append("Ranked by multi-factor scoring")

    return " • ".join(reasons)


def rank_policies(
    policies: List[Dict[str, Any]],
    preferences: Dict[str, Any],
    risk_profile: str,
    user_data: Dict[str, Any],
    top_n: int | None = 10,
) -> List[Tuple[Dict[str, Any], float, str]]:
    """
    Two-stage recommendation process.

    Stage 1: Strict type filtering.
    Stage 2: Soft scoring/ranking.
    """
    if not policies:
        return []

    if not isinstance(preferences, dict):
        preferences = {}

    scoring_user_data = dict(user_data) if isinstance(user_data, dict) else {}
    scoring_user_data["preferences"] = preferences

    preferred_types = _extract_preferred_policy_types(preferences, scoring_user_data)

    filtered, metadata = filter_by_policy_type(policies, preferred_types)

    print("Policy types in DB:", [_normalize_policy_type(p.get("policy_type", p.get("type"))) for p in policies])
    print("Filter stage metadata:", metadata)
    print("Filtered count:", len(filtered))

    if not filtered:
        return []

    scored: List[Tuple[Dict[str, Any], float, str]] = []
    for policy in filtered:
        score = calculate_policy_score(policy, scoring_user_data, risk_profile)
        reason = generate_recommendation_reason(policy, score, scoring_user_data)

        policy_title = (
            policy.get("title")
            or policy.get("name")
            or policy.get("policy_name")
            or f"policy_{policy.get('id', 'unknown')}"
        )
        print("DEBUG:", policy_title, policy.get("premium"), score)

        scored.append((policy, score, reason))

    scored.sort(
        key=lambda item: (
            item[1],
            -max(0.0, _to_float(item[0].get("premium"), 0.0)),
            -max(0.0, _to_float(item[0].get("id"), 0.0)),
        ),
        reverse=True,
    )

    if top_n is None:
        return scored
    if not isinstance(top_n, int) or top_n <= 0:
        return scored
    return scored[:top_n]
