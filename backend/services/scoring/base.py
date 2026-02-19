"""
Base risk scorer interface and registry.

Follows:
- Interface Segregation: Small, focused interface
- Open/Closed: New scorers extend without modifying existing code
- Dependency Inversion: High-level recommendation service depends on abstraction
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class RiskScorer(ABC):
    """
    Abstract base class for risk scoring strategies.
    
    Each insurance type (health, life, auto) implements this interface
    with its own scoring logic.
    
    This follows the Strategy Pattern - allowing the recommendation
    engine to use different scoring algorithms interchangeably.
    """
    
    @abstractmethod
    def calculate_score(
        self,
        policy: Any,
        risk_factors: Dict[str, Any],
        user_age: Optional[int]
    ) -> float:
        """
        Calculate risk factor score for a policy.
        
        Args:
            policy: Policy entity with coverage, premium, etc.
            risk_factors: User's risk factors for this insurance type
            user_age: User's age (calculated from DOB)
            
        Returns:
            Score between 0 and 25 (max points for risk matching)
        """
        pass
    
    @property
    @abstractmethod
    def insurance_type(self) -> str:
        """Return the insurance type this scorer handles."""
        pass


class ScorerRegistry:
    """
    Registry for risk scorers.
    
    Central registry that maps insurance types to their scorers.
    Allows adding new insurance types without modifying the recommendation service.
    
    Usage:
        ScorerRegistry.register("health", HealthRiskScorer())
        scorer = ScorerRegistry.get("health")
        score = scorer.calculate_score(policy, risk_factors, age)
    """
    
    _scorers: Dict[str, RiskScorer] = {}
    
    @classmethod
    def register(cls, insurance_type: str, scorer: RiskScorer) -> None:
        """
        Register a scorer for an insurance type.
        
        Args:
            insurance_type: Insurance type key (health, life, auto)
            scorer: Scorer instance implementing RiskScorer
        """
        cls._scorers[insurance_type.lower()] = scorer
    
    @classmethod
    def get(cls, insurance_type: str) -> Optional[RiskScorer]:
        """
        Get scorer for an insurance type.
        
        Args:
            insurance_type: Insurance type key
            
        Returns:
            Scorer instance or None if not registered
        """
        return cls._scorers.get(insurance_type.lower())
    
    @classmethod
    def get_default_score(cls) -> float:
        """
        Get default score when no scorer is available.
        
        Returns:
            Default middle-range score
        """
        return 15.0
    
    @classmethod
    def list_types(cls) -> list:
        """
        List all registered insurance types.
        
        Returns:
            List of registered type keys
        """
        return list(cls._scorers.keys())
