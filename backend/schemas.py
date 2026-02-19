from pydantic import BaseModel
from datetime import date 
from decimal import Decimal

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    dob: date

class RiskProfileRequest(BaseModel):
    age: int
    annual_income: int
    dependents: int
    health_condition: str
    # risk_level: str


class LoginRequest(BaseModel):
    email: str
    password: str
    
class ClaimCreate(BaseModel):
    user_policy_id: int
    claim_type: str
    incident_date: date
    amount_claimed: Decimal

class ClaimResponse(BaseModel):
    id: int
    claim_number: str
    claim_type: str
    incident_date: date
    amount_claimed: Decimal
    status: str

    class Config:
        from_attributes = True
