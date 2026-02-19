"""
Policy repository for policy data access.

Single Responsibility: Only handles Policy and related entity data operations.
"""
from typing import Optional, List
from sqlalchemy.orm import Session

from .base import BaseRepository
from models.models import Policy, Provider, UserPolicy


class PolicyRepository(BaseRepository[Policy]):
    """
    Repository for Policy entity operations.
    
    Provides specialized queries for policies, providers, and user policies.
    """
    
    def __init__(self, db: Session):
        super().__init__(db, Policy)
    
    def get_by_type(self, policy_type: str) -> List[Policy]:
        """
        Get all policies of a specific type.
        
        Args:
            policy_type: Type of policy (health, life, auto)
            
        Returns:
            List of matching policies
        """
        return self._db.query(Policy).filter(Policy.policy_type == policy_type).all()
    
    def get_by_types(self, policy_types: List[str]) -> List[Policy]:
        """
        Get policies matching any of the given types.
        
        Args:
            policy_types: List of policy types to match
            
        Returns:
            List of matching policies
        """
        return self._db.query(Policy).filter(Policy.policy_type.in_(policy_types)).all()
    
    def get_with_provider(self, policy_id: int) -> Optional[Policy]:
        """
        Get policy with eagerly loaded provider.
        
        Args:
            policy_id: ID of the policy
            
        Returns:
            Policy with provider loaded, or None
        """
        policy = self._db.query(Policy).filter(Policy.id == policy_id).first()
        if policy:
            # Access provider to ensure it's loaded
            _ = policy.provider
        return policy
    
    def get_provider(self, provider_id: int) -> Optional[Provider]:
        """
        Get provider by ID.
        
        Args:
            provider_id: ID of the provider
            
        Returns:
            Provider if found, None otherwise
        """
        return self._db.query(Provider).filter(Provider.id == provider_id).first()
    
    def get_user_policies(self, user_id: int, status: str = "active") -> List[UserPolicy]:
        """
        Get all policies owned by a user.
        
        Args:
            user_id: ID of the user
            status: Policy status filter (default: active)
            
        Returns:
            List of user's policies
        """
        return self._db.query(UserPolicy).filter(
            UserPolicy.user_id == user_id,
            UserPolicy.status == status
        ).all()
    
    def get_user_policy(self, user_id: int, policy_id: int) -> Optional[UserPolicy]:
        """
        Get specific user policy.
        
        Args:
            user_id: ID of the user
            policy_id: ID of the policy
            
        Returns:
            UserPolicy if found and active, None otherwise
        """
        return self._db.query(UserPolicy).filter(
            UserPolicy.user_id == user_id,
            UserPolicy.policy_id == policy_id,
            UserPolicy.status == "active"
        ).first()
    
    def create_user_policy(self, user_id: int, policy_id: int) -> UserPolicy:
        """
        Create a new user policy (purchase).
        
        Args:
            user_id: ID of the user
            policy_id: ID of the policy
            
        Returns:
            Created UserPolicy
        """
        user_policy = UserPolicy(
            user_id=user_id,
            policy_id=policy_id,
            status="active"
        )
        self._db.add(user_policy)
        self._db.commit()
        self._db.refresh(user_policy)
        return user_policy
