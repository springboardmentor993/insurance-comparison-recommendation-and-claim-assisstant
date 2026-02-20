from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

# ---------- USER ----------

class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    dob: Optional[date] = None

    # ⭐ NEW FIELDS ⭐
    income: Optional[int] = None
    budget: Optional[int] = None
    preferred_policy_type: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserPreferencesUpdate(BaseModel):
    # ⭐ Used in PATCH /profile/preferences ⭐
    income: Optional[int] = None
    budget: Optional[int] = None
    preferred_policy_type: Optional[str] = None


# ---------- PROVIDER ----------

class ProviderOut(BaseModel):
    id: int
    name: str
    country: Optional[str] = None

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
    provider: ProviderOut

    class Config:
        from_attributes = True


# ---------- RISK PROFILE ----------

class RiskProfileCreate(BaseModel):
    dependents: int = Field(ge=0, description="Number of dependents")
    risk_profile: str = Field(description="Risk level: high, medium, or low")


class RiskProfileOut(BaseModel):
    id: int
    dependents: int
    risk_profile: str

    class Config:
        from_attributes = True


# ---------- RECOMMENDATIONS ----------

class RecommendationOut(BaseModel):
    id: int
    policy_id: int
    title: str
    premium: float
    score: float
    reason: Optional[str] = None
    policy_type: str
    provider: ProviderOut

    class Config:
        from_attributes = True


class RecommendationRequest(BaseModel):
    # ⭐ Now optional — system can use user's preferred type ⭐
    policy_type: Optional[str] = None

    # ⭐ Recommendation engine can use user's own budget if not provided ⭐
    budget: Optional[float] = None
class UserPreferencesCreate(BaseModel):
    age: int | None = None
    occupation: str | None = None
    annual_income: int | None = None
    preferred_policy_type: str | None = None
    max_budget: int | None = None
