from pydantic import BaseModel
from datetime import date 

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    dob: date

class LoginRequest(BaseModel):
    email: str
    password: str
    