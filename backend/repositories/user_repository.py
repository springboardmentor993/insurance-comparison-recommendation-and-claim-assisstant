"""
User repository for user data access.

Single Responsibility: Only handles User entity data operations.
"""
from typing import Optional, List
from sqlalchemy.orm import Session

from .base import BaseRepository
from models.models import User


class UserRepository(BaseRepository[User]):
    """
    Repository for User entity operations.
    
    Provides specialized queries beyond basic CRUD.
    """
    
    def __init__(self, db: Session):
        super().__init__(db, User)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email address.
        
        Args:
            email: User's email address
            
        Returns:
            User if found, None otherwise
        """
        return self._db.query(User).filter(User.email == email).first()
    
    def get_admins(self) -> List[User]:
        """
        Get all admin users.
        
        Returns:
            List of users with admin role
        """
        return self._db.query(User).filter(User.role == "admin").all()
    
    def email_exists(self, email: str) -> bool:
        """
        Check if email already exists.
        
        Args:
            email: Email to check
            
        Returns:
            True if email exists, False otherwise
        """
        return self.get_by_email(email) is not None
