from pydantic import BaseModel
from typing import List, Optional


# ---------------- AUTH ----------------
class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str


# ---------------- PROVIDER ----------------
class ProviderBase(BaseModel):
    id: int
    name: str
    country: Optional[str]

    class Config:
        orm_mode = True


# ---------------- CATEGORY ----------------
class CategoryBase(BaseModel):
    id: int
    name: str
    description: Optional[str]
    icon: Optional[str]

    class Config:
        orm_mode = True


# ---------------- POLICY ----------------
class PolicyBase(BaseModel):
    id: int
    title: str
    premium: float
    term_months: Optional[int]

    provider: ProviderBase
    category: CategoryBase

    class Config:
        orm_mode = True
