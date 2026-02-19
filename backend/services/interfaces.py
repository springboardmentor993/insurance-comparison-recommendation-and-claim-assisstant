"""
Service interfaces (Protocols) for dependency injection and testing.

Follows:
- Interface Segregation: Small, focused interfaces
- Dependency Inversion: High-level modules depend on abstractions
- Liskov Substitution: Any implementation can be swapped transparently
"""
from typing import Protocol, Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session


class ClaimServiceProtocol(Protocol):
    """
    Protocol for claim service operations.
    
    Defines the contract that any claim service implementation must follow.
    This enables easy mocking in tests and future implementation swapping.
    """
    
    def generate_claim_number(self, db: Session) -> str:
        """Generate a unique claim number."""
        ...
    
    def verify_user_owns_policy(self, user_id: int, policy_id: int, db: Session) -> Optional[int]:
        """Verify user owns a policy and return user_policy_id."""
        ...
    
    def get_claim_with_details(self, claim_id: int, db: Session) -> Optional[dict]:
        """Get claim with all related details."""
        ...
    
    def log_admin_action(
        self,
        admin_id: int,
        action: str,
        target_type: str,
        target_id: int,
        db: Session
    ) -> Any:
        """Log an admin action for audit trail."""
        ...


class RecommendationServiceProtocol(Protocol):
    """
    Protocol for recommendation service operations.
    
    Defines the contract for generating policy recommendations.
    """
    
    def score_policy(
        self,
        policy: Any,
        user: Any,
        preferences: Dict[str, Any]
    ) -> Tuple[float, str, Dict[str, float]]:
        """
        Score a single policy against user preferences.
        
        Returns:
            Tuple of (score, reason, score_breakdown)
        """
        ...
    
    def budget_match_score(
        self,
        premium: float,
        budget_min: Optional[float],
        budget_max: Optional[float]
    ) -> float:
        """Calculate budget match score."""
        ...
    
    def coverage_match_score(
        self,
        policy_coverage: Optional[Dict[str, Any]],
        preferred_coverages: Optional[List[str]]
    ) -> float:
        """Calculate coverage match score."""
        ...


class UserServiceProtocol(Protocol):
    """
    Protocol for user service operations.
    """
    
    def get_user_by_email(self, email: str, db: Session) -> Optional[Any]:
        """Get user by email address."""
        ...
    
    def create_user(
        self,
        email: str,
        password: str,
        name: Optional[str],
        db: Session
    ) -> Any:
        """Create a new user."""
        ...
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash."""
        ...


class PolicyServiceProtocol(Protocol):
    """
    Protocol for policy service operations.
    """
    
    def get_policies_by_types(
        self,
        policy_types: List[str],
        db: Session
    ) -> List[Any]:
        """Get policies matching the given types."""
        ...
    
    def get_user_policies(
        self,
        user_id: int,
        db: Session,
        status: str = "active"
    ) -> List[Any]:
        """Get all policies owned by a user."""
        ...
    
    def purchase_policy(
        self,
        user_id: int,
        policy_id: int,
        db: Session
    ) -> Any:
        """Create a user policy (purchase)."""
        ...
