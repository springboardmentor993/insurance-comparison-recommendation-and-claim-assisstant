"""Service layer for Claims module."""
import json
from sqlalchemy.orm import Session
from datetime import datetime
from models.models import Claim, UserPolicy, AdminLog, FraudFlag
from typing import Optional


def generate_claim_number(db: Session) -> str:
    """
    Generate unique claim number in format: CLM-YYYY-NNNNNN
    Example: CLM-2026-000001
    """
    year = datetime.now().year
    count = db.query(Claim).filter(
        Claim.claim_number.like(f"CLM-{year}-%")
    ).count()
    return f"CLM-{year}-{count + 1:06d}"


def verify_user_owns_policy(user_id: int, policy_id: int, db: Session) -> Optional[int]:
    """
    Verify that a user owns/has purchased a specific policy.
    Returns user_policy_id if found and active, None otherwise.
    """
    user_policy = db.query(UserPolicy).filter(
        UserPolicy.user_id == user_id,
        UserPolicy.policy_id == policy_id,
        UserPolicy.status == "active"
    ).first()
    
    return user_policy.id if user_policy else None


def log_admin_action(
    admin_id: int,
    action: str,
    target_type: str,
    target_id: int,
    db: Session
) -> AdminLog:
    """
    Log an admin action for audit trail.
    
    Args:
        admin_id: ID of admin performing action
        action: Action type (approve, reject, flag_fraud, review)
        target_type: Type of target (claim, document)
        target_id: ID of the target
        db: Database session
    
    Returns:
        Created AdminLog instance
    """
    log = AdminLog(
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=target_id
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_claim_with_details(claim_id: int, db: Session) -> Optional[dict]:
    """
    Get claim with joined policy, provider, user, and document information.
    
    Returns dict with all claim details or None if not found.
    """
    from models.models import Policy, Provider, User
    
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        return None
    
    # Get user policy with joins
    user_policy = db.query(UserPolicy).filter(
        UserPolicy.id == claim.user_policy_id
    ).first()
    
    if not user_policy:
        return None
    
    # Get policy and provider
    policy = db.query(Policy).filter(Policy.id == user_policy.policy_id).first()
    provider = db.query(Provider).filter(Provider.id == policy.provider_id).first() if policy else None
    user = db.query(User).filter(User.id == user_policy.user_id).first()
    
    # Get documents and fraud flags
    documents = [
        {
            "id": doc.id,
            "file_url": doc.file_url,
            "s3_key": doc.s3_key,
            "doc_type": doc.doc_type,
            "uploaded_at": doc.uploaded_at.isoformat()
        }
        for doc in claim.documents
    ]
    
    
    # Enhanced fraud flags with both automated and manual flags
    fraud_flags_list = []
    for flag in claim.fraud_flags:
        flag_data = {
            "id": flag.id,
            "claim_id": flag.claim_id,
        }
        
        # Check if this is an automated or manual flag
        if flag.rule_code:
            # Automated fraud detection
            flag_data.update({
                "type": "automated",
                "rule_code": flag.rule_code,
                "severity": flag.severity,
                "details": json.loads(flag.details) if flag.details else None,
                "created_at": flag.created_at.isoformat() if flag.created_at else None
            })
        else:
            # Manual flag by admin
            flag_data.update({
                "type": "manual",
                "reason": flag.reason,
                "flagged_by": flag.flagged_by,
                "flagged_at": flag.flagged_at.isoformat() if flag.flagged_at else None
            })
        
        fraud_flags_list.append(flag_data)

    
    return {
        "id": claim.id,
        "user_policy_id": claim.user_policy_id,
        "claim_number": claim.claim_number,
        "claim_type": claim.claim_type,
        "incident_date": claim.incident_date,
        "amount_claimed": float(claim.amount_claimed),
        "status": claim.status,
        "created_at": claim.created_at,
        "policy_title": policy.title if policy else None,
        "provider_name": provider.name if provider else None,
        "user_name": user.name if user else None,
        "user_email": user.email if user else None,
        "documents": documents,
        "fraud_flags": fraud_flags_list,
        "documents_count": len(documents)
    }
