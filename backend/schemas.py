from pydantic import BaseModel
from datetime import date 

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
    risk_level: str


class LoginRequest(BaseModel):
    email: str
    password: str
    