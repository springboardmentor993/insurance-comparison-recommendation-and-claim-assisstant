"""
Admin authentication middleware and utilities.
Protects admin-only endpoints with JWT token and role verification.
"""

from fastapi import HTTPException, Depends, status
from sqlalchemy.orm import Session
from backend.deps import get_db, get_current_user
from backend import models
from typing import Dict, Any

async def require_admin(
    token: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """
    Middleware to ensure user is an admin.
    Can be used as a dependency in FastAPI routes.
    
    Usage:
        @app.get("/admin/users")
        def get_users(admin_user: models.User = Depends(require_admin)):
            ...
    
    Raises:
        HTTPException(403): If user is not an admin
        HTTPException(401): If user is not authenticated
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Check if user has admin role
    if current_user.role != 'admin' and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required to access this resource"
        )
    
    return current_user

def is_admin_user(user: models.User) -> bool:
    """Check if a user has admin privileges"""
    return user.role == 'admin' or user.is_admin

def get_admin_stats(db: Session) -> Dict[str, Any]:
    """
    Get admin dashboard statistics.
    
    Returns:
        Dictionary with:
        - total_users: Total number of registered users
        - total_admins: Number of admin users  
        - total_policies: Total policies in system
        - total_claims: Total claims submitted
        - total_documents: Total documents uploaded
        - active_claims: Claims in under_review or approved status
    """
    try:
        total_users = db.query(models.User).count()
        total_admins = db.query(models.User).filter(models.User.role == 'admin').count()
        total_policies = db.query(models.Policy).count()
        total_claims = db.query(models.Claim).count()
        total_documents = db.query(models.ClaimDocument).count()
        
        active_claims = db.query(models.Claim).filter(
            models.Claim.status.in_(['submitted', 'under_review', 'approved'])
        ).count()
        
        return {
            "total_users": total_users,
            "total_admins": total_admins,
            "total_policies": total_policies,
            "total_claims": total_claims,
            "total_documents": total_documents,
            "active_claims": active_claims,
            "timestamp": models.datetime.utcnow().isoformat()
        }
    except Exception as e:
        print(f"Error getting admin stats: {e}")
        return {
            "total_users": 0,
            "total_admins": 0,
            "total_policies": 0,
            "total_claims": 0,
            "total_documents": 0,
            "active_claims": 0,
            "error": str(e)
        }

def get_user_list(db: Session, skip: int = 0, limit: int = 100) -> Dict[str, Any]:
    """
    Get list of all registered users (admin only).
    
    Args:
        db: Database session
        skip: Number of records to skip (pagination)
        limit: Maximum records to return
    
    Returns:
        Dictionary with user list and metadata
    """
    try:
        total_count = db.query(models.User).count()
        users = db.query(models.User).offset(skip).limit(limit).all()
        
        user_list = [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "is_admin": u.is_admin,
                "has_policies": len(u.user_policies),
                "created_at": str(u.created_at)
            }
            for u in users
        ]
        
        return {
            "total_count": total_count,
            "skip": skip,
            "limit": limit,
            "users": user_list
        }
    except Exception as e:
        print(f"Error getting user list: {e}")
        return {
            "total_count": 0,
            "users": [],
            "error": str(e)
        }

def get_documents_list(db: Session, skip: int = 0, limit: int = 100, claim_number: str = None) -> Dict[str, Any]:
    """
    Get list of all uploaded documents (admin only).
    Includes claim information and approval status.
    
    Args:
        db: Database session
        skip: Number of records to skip (pagination)
        limit: Maximum records to return
        claim_number: Optional claim number to filter by
    
    Returns:
        Dictionary with documents list and metadata
    """
    try:
        from backend import models as models_module
        
        # Build base query with joins
        base_query = db.query(
            models_module.ClaimDocument,
            models_module.Claim,
            models_module.DocumentApproval
        ).join(
            models_module.Claim,
            models_module.ClaimDocument.claim_id == models_module.Claim.id
        ).outerjoin(
            models_module.DocumentApproval,
            models_module.ClaimDocument.id == models_module.DocumentApproval.document_id
        )
        
        # Apply claim number filter if provided
        if claim_number:
            search_term = claim_number.replace('#', '').lower().strip()
            base_query = base_query.filter(models_module.Claim.claim_number.ilike(f'%{search_term}%'))
        
        # Get total count with filter applied
        total_count = base_query.count()
        
        # Apply pagination
        query = base_query.offset(skip).limit(limit).all()
        
        doc_list = []
        for doc, claim, approval in query:
            approval_status = approval.status if approval else 'pending'
            
            doc_list.append({
                "id": doc.id,
                "claim_id": doc.claim_id,
                "claim_number": claim.claim_number,  # Formatted claim number (e.g., CLM-852DBED6)
                "claim_status": claim.status,  # Claim's status
                "claim_type": claim.claim_type,
                "file_name": doc.file_name,
                "file_type": doc.file_type,
                "doc_type": doc.doc_type,
                "file_size_bytes": len(doc.file_data) if doc.file_data else 0,
                "approval_status": approval_status,  # pending, approved, or rejected
                "uploaded_at": str(doc.uploaded_at)
            })
        
        return {
            "total_count": total_count,
            "skip": skip,
            "limit": limit,
            "documents": doc_list
        }
    except Exception as e:
        print(f"Error getting documents list: {e}")
        import traceback
        traceback.print_exc()
        return {
            "total_count": 0,
            "documents": [],
            "error": str(e)
        }
