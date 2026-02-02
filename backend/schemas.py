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
    
# class RecommendationResponse(BaseModel):
#     policy_id: int
#     score: float
#     reason: str
#     recommended_at: datetime

#     class Config:
#         orm_mode = True 
        # “I am returning SQLAlchemy objects — convert them safely.”
# “I use Pydantic schemas to control API responses and avoid exposing database models directly