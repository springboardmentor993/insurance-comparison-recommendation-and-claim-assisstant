from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models import (
    User, Claim, FraudFlag, AdminLog, Policy, UserPolicy,
    ClaimStatus, FraudSeverity, PolicyStatus
)
from app.schemas.schemas import (
    ClaimResponse,
    FraudFlagResponse,
    AdminLogResponse,
    ClaimStatistics,
    PolicyStatistics,
    ClaimUpdate
)
from app.auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users")
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all users with stats (admin only)"""
    users = db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for u in users:
        policy_count = db.query(UserPolicy).filter(UserPolicy.user_id == u.id).count()
        claim_count = db.query(Claim).join(UserPolicy).filter(UserPolicy.user_id == u.id).count()
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "is_admin": u.is_admin,
            "created_at": u.created_at,
            "policy_count": policy_count,
            "claim_count": claim_count,
        })
    return result


@router.get("/claims/all", response_model=List[ClaimResponse])
def get_all_claims(
    status: str = None,
    has_fraud_flags: bool = None,
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all claims (admin only)"""
    query = db.query(Claim)
    
    if status:
        query = query.filter(Claim.status == status)
    
    if has_fraud_flags is not None:
        if has_fraud_flags:
            query = query.join(FraudFlag).filter(FraudFlag.claim_id == Claim.id)
        else:
            query = query.outerjoin(FraudFlag).filter(FraudFlag.id == None)
    
    claims = query.order_by(Claim.created_at.desc()).offset(skip).limit(limit).all()
    return claims


@router.put("/claims/{claim_id}/status")
def update_claim_status(
    claim_id: int,
    status: str,
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update claim status (admin only)"""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    old_status = claim.status
    
    # Extract data for background task BEFORE commit expires the session objects
    try:
        user_name = claim.user_policy.user.name
        user_email = claim.user_policy.user.email
        claim_number = claim.claim_number
    except Exception as e:
        print(f"Error extracting claim data for email: {e}")
        user_name = "User"
        user_email = None
        claim_number = claim.claim_number or "N/A"

    # Update status
    claim.status = status
    db.commit()
    
    # Log admin action
    log = AdminLog(
        admin_id=current_admin.id,
        action=f"Updated claim status from {old_status} to {status}",
        target_type="claim",
        target_id=claim_id
    )
    db.add(log)
    db.commit()
    
    # Send notification in background if we have an email
    if user_email:
        background_tasks.add_task(
            send_claim_notification,
            claim_number=claim_number,
            user_name=user_name,
            user_email=user_email,
            status=status
        )

    return {"message": "Claim status updated successfully"}

def send_claim_notification(claim_number: str, user_name: str, user_email: str, status: str):
    """Helper to send email in background to prevent UI block"""
    try:
        from app.utils.email import send_email, get_claim_status_email
        
        subject = f"Update on your Claim #{claim_number}"
        html_content, text_content = get_claim_status_email(
            user_name=user_name,
            claim_number=claim_number,
            status=status
        )
        
        send_email(
            subject=subject,
            to_email=user_email,
            html_content=html_content,
            text_content=text_content
        )
    except Exception as e:
        print(f"Background email failed: {e}")


@router.get("/fraud-flags", response_model=List[FraudFlagResponse])
def get_fraud_flags(
    severity: str = None,
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all fraud flags (admin only)"""
    query = db.query(FraudFlag)
    
    if severity:
        query = query.filter(FraudFlag.severity == severity)
    
    flags = query.order_by(FraudFlag.created_at.desc()).offset(skip).limit(limit).all()
    return flags


@router.get("/statistics/claims", response_model=ClaimStatistics)
def get_claim_statistics(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get claim statistics (admin only)"""
    total_claims = db.query(Claim).count()
    
    pending_claims = db.query(Claim).filter(
        Claim.status.in_([ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW])
    ).count()
    
    approved_claims = db.query(Claim).filter(
        Claim.status == ClaimStatus.APPROVED
    ).count()
    
    rejected_claims = db.query(Claim).filter(
        Claim.status == ClaimStatus.REJECTED
    ).count()
    
    total_amount_result = db.query(func.sum(Claim.amount_claimed)).scalar()
    total_amount_claimed = float(total_amount_result) if total_amount_result else 0.0
    
    approved_amount_result = db.query(func.sum(Claim.amount_claimed)).filter(
        Claim.status.in_([ClaimStatus.APPROVED, ClaimStatus.PAID])
    ).scalar()
    total_amount_approved = float(approved_amount_result) if approved_amount_result else 0.0
    
    fraud_flags_count = db.query(FraudFlag).count()

    # Time-series data: Claims per day for the last 7 days
    trends = []
    for i in range(6, -1, -1):
        date = (datetime.now() - timedelta(days=i)).date()
        count = db.query(Claim).filter(func.date(Claim.created_at) == date).count()
        trends.append({"date": date.strftime("%d %b"), "count": count})
    
    return {
        "total_claims": total_claims,
        "pending_claims": pending_claims,
        "approved_claims": approved_claims,
        "rejected_claims": rejected_claims,
        "total_amount_claimed": total_amount_claimed,
        "total_amount_approved": total_amount_approved,
        "fraud_flags_count": fraud_flags_count,
        "trends": trends
    }


@router.get("/statistics/policies", response_model=PolicyStatistics)
def get_policy_statistics(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get policy statistics (admin only)"""
    total_policies = db.query(UserPolicy).count()
    
    active_policies = db.query(UserPolicy).filter(
        UserPolicy.status == PolicyStatus.ACTIVE
    ).count()
    
    # Count policies by type
    policy_counts = db.query(
        Policy.policy_type,
        func.count(UserPolicy.id)
    ).join(
        UserPolicy, UserPolicy.policy_id == Policy.id
    ).group_by(Policy.policy_type).all()
    
    policies_by_type = {str(ptype): count for ptype, count in policy_counts}
    
    # Total premium revenue
    revenue_result = db.query(func.sum(UserPolicy.premium)).filter(
        UserPolicy.status == PolicyStatus.ACTIVE
    ).scalar()
    total_premium_revenue = float(revenue_result) if revenue_result else 0.0
    
    return PolicyStatistics(
        total_policies=total_policies,
        active_policies=active_policies,
        policies_by_type=policies_by_type,
        total_premium_revenue=total_premium_revenue
    )


@router.get("/logs", response_model=List[AdminLogResponse])
def get_admin_logs(
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get admin action logs (admin only)"""
    logs = db.query(AdminLog).order_by(
        AdminLog.timestamp.desc()
    ).offset(skip).limit(limit).all()
    
    return logs

@router.get("/claims/{claim_id}/documents")
def get_claim_documents(
    claim_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all documents for a claim (admin only) with pre-signed S3 URLs"""
    from app.models import ClaimDocument
    from app.routes.claims import generate_presigned_url

    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    documents = db.query(ClaimDocument).filter(ClaimDocument.claim_id == claim_id).all()
    return [
        {
            "id": doc.id,
            "doc_type": doc.doc_type,
            # Generate a fresh pre-signed URL valid for 1 hour
            "file_url": generate_presigned_url(doc.file_url) if doc.file_url and not doc.file_url.startswith("http") else doc.file_url,
            "uploaded_at": doc.uploaded_at
        }
        for doc in documents
    ]

