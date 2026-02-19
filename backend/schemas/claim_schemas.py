"""Schemas for Claims module."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============= User Policy Schemas =============
class UserPolicyOut(BaseModel):
    id: int
    user_id: int
    policy_id: int
    purchased_at: datetime
    status: str
    policy_title: Optional[str] = None
    provider_name: Optional[str] = None

    class Config:
        from_attributes = True


# ============= Claim Schemas =============
class ClaimCreate(BaseModel):
    """Schema for creating a new claim"""
    policy_id: int  # Will be converted to user_policy_id
    claim_type: str
    incident_date: datetime
    amount_claimed: float
    incident_description: Optional[str] = ""  # Not stored in DB but used for initial notes


class ClaimOut(BaseModel):
    """Basic claim output"""
    id: int
    user_policy_id: int
    claim_number: str
    claim_type: str
    incident_date: datetime
    amount_claimed: float
    status: str
    created_at: datetime
    
    # Joined fields
    policy_title: Optional[str] = None
    provider_name: Optional[str] = None
    documents_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ============= Fraud Detection Schemas =============
class FraudFlagOut(BaseModel):
    """Individual fraud flag output"""
    id: int
    rule_code: str
    severity: str
    details: Optional[dict] = None
    created_at: Optional[str] = None


class FraudSummary(BaseModel):
    """Fraud detection summary for a claim"""
    has_fraud_flags: bool
    flag_count: int
    highest_severity: Optional[str] = None
    flags: List[FraudFlagOut] = []


class ClaimDetailOut(ClaimOut):
    """Detailed claim output with documents and fraud flags"""
    documents: List[dict] = []
    fraud_flags: Optional[list] = []
    user_name: Optional[str] = None
    user_email: Optional[str] = None


# ============= Document Schemas =============
class DocumentOut(BaseModel):
    """Claim document output"""
    id: int
    claim_id: int
    file_url: str
    doc_type: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ============= Admin Schemas =============
class AdminClaimUpdate(BaseModel):
    """Schema for admin to update claim status"""
    status: str  # under_review, approved, rejected, paid
    admin_notes: Optional[str] = None


class FraudFlagCreate(BaseModel):
    """Schema for flagging fraud"""
    reason: str


class AdminLogOut(BaseModel):
    """Admin action log output"""
    id: int
    admin_id: int
    action: str
    target_type: str
    target_id: int
    timestamp: datetime
    admin_name: Optional[str] = None

    class Config:
        from_attributes = True


# ============= Admin Dashboard Schemas =============
class ClaimStats(BaseModel):
    """Statistics for admin dashboard"""
    total_claims: int
    pending_claims: int
    approved_claims: int
    rejected_claims: int
    total_amount_claimed: float
    total_amount_approved: float
