from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from deps import get_db
from models import Policy

router = APIRouter(prefix="/policies", tags=["Policies"])


# ---------------------------
# Request / Response Schemas
# ---------------------------
class PremiumCalcRequest(BaseModel):
    policy_id: int
    age: int
    coverage_amount: float
    term_years: int


class PremiumCalcResponse(BaseModel):
    base_premium: float
    loading_factor: float
    final_premium: float


# ---------------------------
# Premium Calculator Endpoint
# URL: POST /policies/calculate
# ---------------------------
@router.post("/calculate", response_model=PremiumCalcResponse)
def calculate_premium(payload: PremiumCalcRequest, db: Session = Depends(get_db)):

    # -------- Input validation --------
    if payload.age <= 0 or payload.age > 120:
        raise HTTPException(status_code=400, detail="Invalid age")

    if payload.coverage_amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid coverage amount")

    if payload.term_years <= 0:
        raise HTTPException(status_code=400, detail="Invalid term years")

    # -------- Fetch policy --------
    policy = db.query(Policy).filter(Policy.id == payload.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    # -------- Base premium --------
    # Using policy.premium from DB as base annual premium
    base_premium = float(policy.premium)

    # -------- Loading factors --------
    # Age factor
    if payload.age < 25:
        age_factor = 0.95
    elif payload.age < 35:
        age_factor = 1.00
    elif payload.age < 45:
        age_factor = 1.15
    elif payload.age < 60:
        age_factor = 1.35
    else:
        age_factor = 1.60

    # Coverage factor (baseline 5,00,000)
    coverage_factor = payload.coverage_amount / 500000.0
    coverage_factor = min(max(coverage_factor, 0.80), 4.00)  # clamp 0.8 to 4

    # Term factor (baseline 10 years)
    term_factor = 10.0 / payload.term_years
    term_factor = min(max(term_factor, 0.80), 1.00)  # clamp 0.8 to 1

    # Policy type factor
    policy_type = (policy.policy_type or "").lower()
    if policy_type == "health":
        type_factor = 1.20
    elif policy_type == "life":
        type_factor = 1.10
    elif policy_type == "travel":
        type_factor = 0.90
    elif policy_type == "home":
        type_factor = 1.00
    else:
        type_factor = 1.00

    loading_factor = age_factor * coverage_factor * term_factor * type_factor
    final_premium = base_premium * loading_factor

    return {
        "base_premium": round(base_premium, 2),
        "loading_factor": round(loading_factor, 2),
        "final_premium": round(final_premium, 2),
    }
