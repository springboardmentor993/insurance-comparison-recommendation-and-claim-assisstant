"""
Health insurance risk scoring strategy.

Single Responsibility: Only handles health insurance risk scoring.
"""
from typing import Any, Dict, Optional

from .base import RiskScorer


class HealthRiskScorer(RiskScorer):
    """
    Risk scorer for health insurance policies.
    
    Considers:
    - Medical history
    - Smoking/alcohol status
    - Age factors
    - Coverage adequacy
    """
    
    @property
    def insurance_type(self) -> str:
        return "health"
    
    def calculate_score(
        self,
        policy: Any,
        risk_factors: Dict[str, Any],
        user_age: Optional[int]
    ) -> float:
        """
        Calculate health insurance risk score.
        
        Higher scores indicate better policy match for user's health profile.
        """
        score = 25.0
        
        # Medical history check
        medical_history = risk_factors.get("medical_history", [])
        if medical_history and len(medical_history) > 0:
            # Higher deductible might not be suitable for people with conditions
            policy_deductible = getattr(policy, "deductible", None)
            if policy_deductible and float(policy_deductible) > 10000:
                score -= 5.0
            
            # Need good coverage
            coverage = getattr(policy, "coverage", {})
            if not coverage or not isinstance(coverage, dict):
                score -= 5.0
        
        # Smoking/alcohol check
        smoking = risk_factors.get("smoking_status", "non_smoker")
        if smoking in ["regular", "occasional"]:
            # Smokers need better coverage, premium might be higher
            score -= 2.0
        
        # Age factor
        if user_age:
            premium = float(getattr(policy, "premium", 0))
            if user_age > 50:
                # Older people need comprehensive coverage
                if premium < 5000:  # Too cheap might mean poor coverage
                    score -= 3.0
            elif user_age < 30:
                # Younger people can opt for basic coverage
                if premium > 15000:  # Might be too expensive
                    score -= 2.0
        
        return max(0.0, score)
