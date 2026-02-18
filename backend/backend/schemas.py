from pydantic import BaseModel, EmailStr
from typing import Any, Dict, Optional, List
from datetime import date, datetime

# ---------------- AUTH SCHEMAS ----------------
class UserCreate(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    password: str
    dob: Optional[date] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ---------------- PROFILE SCHEMAS ----------------
class PreferencesOut(BaseModel):
    preferred_policy_types: Optional[List[str]] = None
    max_premium: Optional[float] = None

class ProfileOut(BaseModel):
    id: int
    name: str
    email: str
    dob: Optional[date] = None
    age: Optional[int] = None
    preferences: Optional[PreferencesOut] = None
    created_at: datetime

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    dob: Optional[date] = None
    preferences: Optional[PreferencesOut] = None

# ---------------- POLICY SCHEMAS ----------------
class PolicyOut(BaseModel):
    id: int
    title: str
    provider: Optional[str] = None  # Will map from Policy.provider.name
    provider_name: Optional[str] = None  # Alternative field name
    premium: float | int
    coverage: Dict[str, Any]   # ✅ FIX: coverage is dict, not string
    policy_type: Optional[str] = None  # Policy type (auto, health, life, etc.)
    term_months: Optional[int] = None
    deductible: Optional[float] = None
    
    class Config:
        from_attributes = True

class UserPolicyOut(BaseModel):
    id: int
    user_id: int
    policy_id: int
    policy_number: str
    start_date: date
    end_date: date
    premium: float
    status: str
    auto_renew: bool
    policy: Optional[PolicyOut] = None

    class Config:
        from_attributes = True

class RecommendationOut(BaseModel):
    policy: PolicyOut
    score: float
    reasons: List[str] = []
    
    class Config:
        from_attributes = True

# ---------------- CLAIM SCHEMAS ----------------
class ClaimDocumentOut(BaseModel):
    id: int
    file_name: str
    file_type: str
    file_size: int
    s3_url: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class ClaimHistoryOut(BaseModel):
    id: int
    status: str
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class FraudFlagOut(BaseModel):
    id: int
    flag_reason: str
    flag_details: Optional[str] = None
    is_resolved: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ClaimCreate(BaseModel):
    user_policy_id: int
    claim_type: str
    incident_date: date
    description: str
    claim_amount: float

class ClaimOut(BaseModel):
    id: int
    claim_number: str
    user_policy_id: int
    claim_type: str
    incident_date: date
    description: str
    claim_amount: float
    status: str
    status_notes: Optional[str] = None
    approved_amount: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    documents: List[ClaimDocumentOut] = []
    history: List[ClaimHistoryOut] = []
    fraud_flags: List[FraudFlagOut] = []
    
    class Config:
        from_attributes = True

class ClaimStatusUpdate(BaseModel):
    status: str
    status_notes: Optional[str] = None
    approved_amount: Optional[float] = None
