from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import date, datetime


# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    dob: Optional[date] = None
    risk_profile: Optional[Dict[str, Any]] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    dob: Optional[date] = None
    risk_profile: Optional[Dict[str, Any]] = None


class UserResponse(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


# Auth Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Provider Schemas
class ProviderBase(BaseModel):
    name: str
    country: Optional[str] = None


class ProviderCreate(ProviderBase):
    pass


class ProviderResponse(ProviderBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Policy Schemas
class PolicyBase(BaseModel):
    provider_id: int
    policy_type: str
    title: str
    coverage: Optional[Dict[str, Any]] = None
    premium: float
    term_months: Optional[int] = None
    deductible: Optional[float] = None
    tnc_url: Optional[str] = None


class PolicyCreate(PolicyBase):
    pass


class PolicyResponse(PolicyBase):
    id: int
    created_at: datetime
    provider: Optional[ProviderResponse] = None
    
    class Config:
        from_attributes = True


# UserPolicy Schemas
class UserPolicyBase(BaseModel):
    policy_id: int
    policy_number: str
    start_date: date
    end_date: date
    premium: float
    status: str = "active"
    auto_renew: bool = False


class UserPolicyCreate(UserPolicyBase):
    pass


class UserPolicyResponse(UserPolicyBase):
    id: int
    user_id: int
    user: Optional[UserBase] = None
    policy: Optional[PolicyResponse] = None
    
    class Config:
        from_attributes = True


# Claim Schemas
class ClaimBase(BaseModel):
    user_policy_id: int
    claim_type: str
    incident_date: date
    amount_claimed: float
    description: Optional[str] = None


class ClaimCreate(ClaimBase):
    pass


class ClaimUpdate(BaseModel):
    claim_type: Optional[str] = None
    incident_date: Optional[date] = None
    amount_claimed: Optional[float] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ClaimDocumentResponse(BaseModel):
    id: int
    claim_id: int
    file_url: str
    doc_type: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


class FraudFlagResponse(BaseModel):
    id: int
    claim_id: int
    rule_code: str
    severity: str
    details: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ClaimResponse(ClaimBase):
    id: int
    claim_number: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    documents: list[ClaimDocumentResponse] = []
    fraud_flags: list[FraudFlagResponse] = []
    user_policy: Optional[UserPolicyResponse] = None
    
    class Config:
        from_attributes = True


# Recommendation Schemas
class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    policy_id: int
    score: float
    reason: Optional[str] = None
    created_at: datetime
    policy: Optional[PolicyResponse] = None
    
    class Config:
        from_attributes = True


# Admin Schemas
class AdminLogResponse(BaseModel):
    id: int
    admin_id: int
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True


# Analytics Schemas
class ClaimStatistics(BaseModel):
    total_claims: int
    pending_claims: int
    approved_claims: int
    rejected_claims: int
    total_amount_claimed: float
    total_amount_approved: float
    fraud_flags_count: int
    trends: Optional[list[dict[str, Any]]] = None


class PolicyStatistics(BaseModel):
    total_policies: int
    active_policies: int
    policies_by_type: Dict[str, int]
    total_premium_revenue: float
