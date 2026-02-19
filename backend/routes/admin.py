"""Admin panel API endpoints for claims management."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime

from config.database import get_db
from models.models import User, Claim, ClaimDocument, UserPolicy, Policy, Provider, AdminLog, FraudFlag
from schemas.claim_schemas import (
    ClaimDetailOut,
    AdminClaimUpdate,
    FraudFlagCreate,
    AdminLogOut,
    ClaimStats
)
from services.claim_service import log_admin_action, get_claim_with_details
from routes.auth import get_current_user

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Middleware to ensure user is an admin."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return current_user


@router.get("/claims", response_model=List[ClaimDetailOut])
def get_all_claims(
    status: Optional[str] = None,
    flagged: bool = False,
    limit: int = 50,
    offset: int = 0,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all claims across all users (admin only).
    
    Filter by status and/or flagged status.
    """
    query = db.query(Claim)
    
    if status:
        query = query.filter(Claim.status == status)
    
    if flagged:
        # Only show claims with fraud flags
        fraud_claim_ids = [f.claim_id for f in db.query(FraudFlag.claim_id).all()]
        query = query.filter(Claim.id.in_(fraud_claim_ids))
    
    claims = query.order_by(Claim.created_at.desc()).limit(limit).offset(offset).all()
    
    # Return detailed information
    return [get_claim_with_details(claim.id, db) for claim in claims]


@router.put("/claims/{claim_id}/status", response_model=ClaimDetailOut)
def update_claim_status(
    claim_id: int,
    status_update: AdminClaimUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update the status of a claim (admin only).
    
    Valid statuses: under_review, approved, rejected, paid
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Validate status
    valid_statuses = ["under_review", "approved", "rejected", "paid"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Update claim
    claim.status = status_update.status
    
    # Log admin action
    action_map = {
        "approved": "approve",
        "rejected": "reject",
        "under_review": "review",
        "paid": "mark_paid"
    }
    
    log_admin_action(
        admin_id=admin.id,
        action=action_map.get(status_update.status, "update_status"),
        target_type="claim",
        target_id=claim_id,
        db=db
    )
    
    db.commit()
    db.refresh(claim)
    
    return get_claim_with_details(claim_id, db)


@router.post("/claims/{claim_id}/fraud", response_model=ClaimDetailOut)
def flag_fraud(
    claim_id: int,
    fraud_data: FraudFlagCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Flag a claim as fraudulent (admin only).
    
    This will also automatically reject the claim.
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Create fraud flag
    fraud_flag = FraudFlag(
        claim_id=claim_id,
        reason=fraud_data.reason,
        flagged_by=admin.id
    )
    
    db.add(fraud_flag)
    
    # Update claim status to rejected
    claim.status = "rejected"
    
    # Log admin action
    log_admin_action(
        admin_id=admin.id,
        action="flag_fraud",
        target_type="claim",
        target_id=claim_id,
        db=db
    )
    
    db.commit()
    
    return get_claim_with_details(claim_id, db)


@router.get("/logs", response_model=List[AdminLogOut])
def get_admin_logs(
    limit: int = 100,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get recent admin action logs (admin only).
    
    Returns audit trail of all admin actions.
    """
    logs = db.query(AdminLog).order_by(
        AdminLog.timestamp.desc()
    ).limit(limit).all()
    
    result = []
    for log in logs:
        admin_user = db.query(User).filter(User.id == log.admin_id).first()
        result.append({
            "id": log.id,
            "admin_id": log.admin_id,
            "action": log.action,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "timestamp": log.timestamp,
            "admin_name": admin_user.name if admin_user else "Unknown"
        })
    
    return result


@router.get("/stats", response_model=ClaimStats)
def get_claim_statistics(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get overall claims statistics (admin only).
    
    Returns totals and summaries for dashboard.
    """
    # Total claims
    total_claims = db.query(func.count(Claim.id)).scalar()
    
    # Counts by status
    pending_claims = db.query(func.count(Claim.id)).filter(
        Claim.status == "submitted"
    ).scalar()
    
    approved_claims = db.query(func.count(Claim.id)).filter(
        Claim.status == "approved"
    ).scalar()
    
    rejected_claims = db.query(func.count(Claim.id)).filter(
        Claim.status == "rejected"
    ).scalar()
    
    # Sum of amounts
    total_amount_claimed = db.query(func.sum(Claim.amount_claimed)).scalar() or 0
    
    total_amount_approved = db.query(func.sum(Claim.amount_claimed)).filter(
        Claim.status.in_(["approved", "paid"])
    ).scalar() or 0
    
    return {
        "total_claims": total_claims,
        "pending_claims": pending_claims,
        "approved_claims": approved_claims,
        "rejected_claims": rejected_claims,
        "total_amount_claimed": float(total_amount_claimed),
        "total_amount_approved": float(total_amount_approved)
    }


@router.get("/claims/{claim_id}/documents")
def get_claim_documents(
    claim_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all documents for a claim with presigned S3 download URLs (admin only).
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    documents = db.query(ClaimDocument).filter(
        ClaimDocument.claim_id == claim_id
    ).all()
    
    result = []
    for doc in documents:
        doc_info = {
            "id": doc.id,
            "claim_id": doc.claim_id,
            "file_url": doc.file_url,
            "doc_type": doc.doc_type,
            "uploaded_at": str(doc.uploaded_at),
            "download_url": None,
        }
        
        # Generate presigned S3 URL if s3_key exists
        if doc.s3_key:
            try:
                from services.s3_service import S3Service
                s3_service = S3Service()
                doc_info["download_url"] = s3_service.generate_presigned_url(
                    doc.s3_key, expiration=3600
                )
            except Exception:
                doc_info["download_url"] = doc.file_url
        else:
            doc_info["download_url"] = doc.file_url
        
        result.append(doc_info)
    
    return result
