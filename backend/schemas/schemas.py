from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any, Dict
from datetime import date

# ---------- USER ----------


class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    dob: Optional[date] = None

    @field_validator("dob", mode="before")
    @classmethod
    def empty_dob_to_none(cls, v: Any) -> Optional[date]:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return None
        return v

    @field_validator("name", mode="before")
    @classmethod
    def empty_name_to_none(cls, v: Any) -> Optional[str]:
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return v


class UserLogin(BaseModel):
    email: str
    password: str


# ---------- PROVIDER ----------


class ProviderOut(BaseModel):
    id: int
    name: str
    country: Optional[str] = None
    reliability_score: Optional[float] = None

    class Config:
        from_attributes = True


# ---------- POLICY ----------


class PolicyOut(BaseModel):
    id: int
    title: str
    policy_type: str
    premium: float
    term_months: int
    deductible: Optional[float] = None
    claim_settlement_ratio: Optional[float] = None
    provider_rating: Optional[float] = None
    coverage: Optional[Dict[str, Any]] = None
    provider: ProviderOut

    class Config:
        from_attributes = True


# ---------- USER PREFERENCES & RISK FACTORS ----------


class PreferencesInput(BaseModel):
    """User preferences for policy recommendations."""
    preferred_policy_types: Optional[List[str]] = None  # ["health", "life", "auto"]
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    preferred_coverages: Optional[List[str]] = None  # ["hospitalization", "accident"]
    term_duration_months: Optional[int] = None
    deductible_tolerance: Optional[str] = None  # "low"/"medium"/"high"


class HealthRiskFactors(BaseModel):
    """Health insurance specific risk factors."""
    medical_history: Optional[List[str]] = None  # ["diabetes", "hypertension"]
    smoking_status: Optional[str] = None  # "non_smoker"/"occasional"/"regular"
    alcohol_consumption: Optional[str] = None  # "none"/"moderate"/"high"
    family_history: Optional[List[str]] = None  # ["heart_disease", "cancer"]


class LifeRiskFactors(BaseModel):
    """Life insurance specific risk factors."""
    income: Optional[float] = None
    risk_appetite: Optional[str] = None  # "low"/"medium"/"high"
    dependents: Optional[int] = None
    occupation_risk: Optional[str] = None  # "low"/"medium"/"high"


class AutoRiskFactors(BaseModel):
    """Auto insurance specific risk factors."""
    car_model: Optional[str] = None
    car_age_years: Optional[int] = None
    driving_history: Optional[str] = None  # "clean"/"minor_violations"/"major_violations"
    location_risk: Optional[str] = None  # "rural"/"urban"/"metro"


class RiskFactorsInput(BaseModel):
    """Risk factors grouped by insurance type."""
    health: Optional[HealthRiskFactors] = None
    life: Optional[LifeRiskFactors] = None
    auto: Optional[AutoRiskFactors] = None


class UserProfileUpdate(BaseModel):
    """Complete user profile update including preferences and risk factors."""
    preferences: Optional[PreferencesInput] = None
    risk_factors: Optional[RiskFactorsInput] = None


class UserProfileOut(BaseModel):
    """User profile output showing preferences and risk factors."""
    preferences: Optional[Dict[str, Any]] = None
    risk_factors: Optional[Dict[str, Any]] = None


# ---------- RECOMMENDATIONS ----------


class RecommendationRequest(BaseModel):
    """Optional overrides merged with user.risk_profile for this request."""
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    preferred_policy_types: Optional[List[str]] = None
    required_coverages: Optional[List[str]] = None
    deductible_preference: Optional[float] = None
    risk_factors: Optional[dict] = None


class ScoreBreakdown(BaseModel):
    """Detailed breakdown of recommendation score components."""
    budget_match: float
    coverage_match: float
    risk_factor_match: float
    provider_trust: float
    term_match: float
    deductible_match: float
    total_score: float


class GenerateRecommendationItem(BaseModel):
    """Response item for POST /recommendations/generate."""
    policy_id: int
    score: float
    reason: Optional[str] = None
    score_breakdown: Optional[ScoreBreakdown] = None


class RecommendationOut(BaseModel):
    """Full recommendation with policy details (for GET my-recommendations)."""
    id: int
    policy_id: int
    title: str
    premium: float
    score: float
    reason: Optional[str] = None
    policy_type: str
    term_months: int
    deductible: Optional[float] = None
    claim_settlement_ratio: Optional[float] = None
    provider_rating: Optional[float] = None
    coverage: Optional[Dict[str, Any]] = None
    provider: ProviderOut

    class Config:
        from_attributes = True
