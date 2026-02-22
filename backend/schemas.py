from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import date, datetime
from decimal import Decimal

# ============ USER SCHEMAS ============ 

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    dob: date

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    dob: Optional[date] = None
    is_admin: bool
    role: Optional[str] = None
    risk_profile: Optional[Dict]
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    risk_profile: Optional[Dict] = None

# ============ PROVIDER SCHEMAS ============

class ProviderCreate(BaseModel):
    name: str
    country: str

class ProviderOut(BaseModel):
    id: int
    name: str
    country: str
    created_at: datetime

    class Config:
        from_attributes = True

# ============ POLICY SCHEMAS ============

class PolicyCreate(BaseModel):
    provider_id: int
    policy_type: str
    title: str
    coverage: Optional[Dict] = None
    premium: Decimal
    term_months: int
    deductible: Decimal
    tnc_url: Optional[str] = None

class PolicyOut(BaseModel):
    id: int
    provider_id: int
    policy_type: str
    title: str
    coverage: Optional[Dict]
    premium: Decimal
    term_months: int
    deductible: Decimal
    tnc_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class PolicyWithProvider(PolicyOut):
    provider: ProviderOut

# ============ USER POLICY SCHEMAS ============

class UserPolicyCreate(BaseModel):
    policy_id: int
    policy_number: Optional[str] = None
    start_date: date
    end_date: date
    premium: Decimal
    auto_renew: bool = False

class UserPolicyOut(BaseModel):
    id: int
    user_id: int
    policy_id: int
    policy_number: str
    start_date: date
    end_date: date
    premium: Decimal
    status: str
    auto_renew: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserPolicyWithPolicy(UserPolicyOut):
    policy: PolicyWithProvider

# ============ CLAIM SCHEMAS ============

class ClaimDocumentCreate(BaseModel):
    file_url: str
    doc_type: str

class ClaimCreate(BaseModel):
    user_policy_id: int
    claim_type: str
    incident_date: date
    amount_claimed: Decimal
    documents: Optional[List[ClaimDocumentCreate]] = None

class ClaimDocumentOut(BaseModel):
    id: int
    claim_id: int
    file_url: str
    doc_type: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class ClaimOut(BaseModel):
    id: int
    user_policy_id: int
    claim_number: str
    claim_type: str
    incident_date: date
    amount_claimed: Decimal
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ClaimDetailOut(ClaimOut):
    documents: List[ClaimDocumentOut]

class ClaimStatusUpdate(BaseModel):
    status: str

# ============ RECOMMENDATION SCHEMAS ============

class RecommendationOut(BaseModel):
    id: int
    user_id: int
    policy_id: int
    score: Decimal
    reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class RecommendationWithPolicy(RecommendationOut):
    policy: PolicyWithProvider

# ============ FRAUD FLAG SCHEMAS ============

class FraudFlagCreate(BaseModel):
    claim_id: int
    rule_code: str
    severity: str
    details: Optional[str] = None

class FraudFlagOut(BaseModel):
    id: int
    claim_id: int
    rule_code: str
    severity: str
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ============ ADMIN LOG SCHEMAS ============

class AdminLogOut(BaseModel):
    id: int
    admin_id: int
    action: str
    target_type: str
    target_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class UserPreferences(BaseModel):
    age: int
    income: int
    marital_status: str
    has_kids: bool
    bmi: float
    diseases: List[str] = []
    preferred_policy_types: List[str] = []
    max_premium: Optional[int] = None
