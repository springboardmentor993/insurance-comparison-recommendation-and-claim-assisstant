from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import datetime

from database import get_db
from models import Claim, User, FraudFlag
from schemas import ClaimOut
from auth_deps import get_current_user

router = APIRouter()

# TODO: Add Admin Role Check dependency in future
# For now, any logged-in user can access (or we can restrict by hardcoded email)

@router.get("/claims/stats")
def get_claim_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), 
):
    """
    Get aggregated stats for the admin dashboard.
    """
    total_claims = db.query(func.count(Claim.id)).scalar()
    pending_claims = db.query(func.count(Claim.id)).filter(Claim.status == "pending").scalar()
    
    # Calculate sum of approved amounts
    total_payout = db.query(func.sum(Claim.approved_amount)).filter(Claim.approved_amount != None).scalar() or 0
    
    # Count unresolved fraud flags
    fraud_alerts = db.query(func.count(FraudFlag.id)).filter(FraudFlag.is_resolved == False).scalar()
    
    return {
        "total_claims": total_claims,
        "pending_claims": pending_claims,
        "total_payout": total_payout,
        "fraud_alerts": fraud_alerts
    }

@router.get("/claims/all", response_model=List[ClaimOut])
def get_all_claims(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = Query(None),
    fraud_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all claims with optional filtering.
    """
    query = db.query(Claim)
    
    if status:
        query = query.filter(Claim.status == status)
        
    if fraud_only:
        query = query.join(Claim.fraud_flags).filter(FraudFlag.is_resolved == False).distinct()
        
    claims = query.order_by(Claim.created_at.desc()).offset(skip).limit(limit).all()
    return claims
