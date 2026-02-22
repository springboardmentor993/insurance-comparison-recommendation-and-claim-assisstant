"""
Admin Authorization Middleware
Provides role-based access control for admin endpoints
"""
from fastapi import HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import Optional
from .deps import get_db
from .auth import SECRET_KEY, ALGORITHM
from . import models
from jose import jwt, JWTError

class AdminMiddleware:
    """Middleware for checking admin authorization"""
    
    @staticmethod
    def require_admin(
        token: str,
        db: Session = Depends(get_db)
    ) -> models.User:
        """
        Dependency to verify admin access
        
        Usage:
            @app.post("/admin/claim/{claim_id}/approve")
            def approve_claim(claim_id: int, admin: User = Depends(AdminMiddleware.require_admin)):
                ...
        """
        if not token:
            raise HTTPException(status_code=401, detail="Token required")
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: int = payload.get("user_id")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(models.User).filter(models.User.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check admin status
        if not getattr(user, "is_admin", False) and user.role != models.UserRoleEnum.admin:
            raise HTTPException(
                status_code=403,
                detail="Admin access required. User must have admin role."
            )
        
        return user
    
    @staticmethod
    def require_admin_or_user(
        token: str,
        db: Session = Depends(get_db)
    ) -> models.User:
        """Dependency to verify user is authenticated (admin or regular user)"""
        if not token:
            raise HTTPException(status_code=401, detail="Token required")
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: int = payload.get("user_id")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(models.User).filter(models.User.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user

# Export functions for use as dependencies
def get_admin_user(token: str, db: Session = Depends(get_db)) -> models.User:
    """Get current admin user - use as dependency"""
    return AdminMiddleware.require_admin(token, db)

def get_current_user(token: str, db: Session = Depends(get_db)) -> models.User:
    """Get current user (authenticated, any role) - use as dependency"""
    return AdminMiddleware.require_admin_or_user(token, db)
