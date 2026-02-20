from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal


# -----------------------------
# SIGNUP
# -----------------------------
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    dob: date


# -----------------------------
# LOGIN
# -----------------------------
class LoginRequest(BaseModel):
    email: str
    password: str


# -----------------------------
# RISK PROFILE
# -----------------------------
class RiskProfileRequest(BaseModel):
    age: int
    annual_income: int
    dependents: int
    health_condition: str


# -----------------------------
# CLAIM CREATE
# -----------------------------
class ClaimCreate(BaseModel):
    user_policy_id: int
    claim_type: str
    incident_date: date
    amount_claimed: Decimal


# -----------------------------
# CLAIM RESPONSE
# -----------------------------
class ClaimResponse(BaseModel):
    id: int
    claim_number: str
    claim_type: str
    incident_date: date
    amount_claimed: Decimal
    status: str

    class Config:
        from_attributes = True


# -----------------------------
# ADMIN LOG RESPONSE
# -----------------------------
class AdminLogResponse(BaseModel):
    id: int
    admin_id: int
    action: str
    target_type: str
    target_id: int
    timestamp: datetime

    class Config:
        from_attributes = True