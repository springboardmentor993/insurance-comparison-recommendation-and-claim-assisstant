"""
Life insurance risk scoring strategy.

Single Responsibility: Only handles life insurance risk scoring.
"""
from typing import Any, Dict, Optional

from .base import RiskScorer


class LifeRiskScorer(RiskScorer):
    """
    Risk scorer for life insurance policies.
    
    Considers:
    - Income to premium ratio
    - Number of dependents
    - Risk appetite
    - Sum assured adequacy
    """
    
    @property
    def insurance_type(self) -> str:
        return "life"
    
    def calculate_score(
        self,
        policy: Any,
        risk_factors: Dict[str, Any],
        user_age: Optional[int]
    ) -> float:
        """
        Calculate life insurance risk score.
        
        Higher scores indicate better policy match for user's life situation.
        """
        score = 25.0
        
        income = risk_factors.get("income")
        dependents = risk_factors.get("dependents", 0)
        risk_appetite = risk_factors.get("risk_appetite", "medium")
        
        premium = float(getattr(policy, "premium", 0))
        
        # Income to premium ratio check
        if income:
            income = float(income)
            if income > 0:
                premium_to_income = (premium / income) * 100
                
                if premium_to_income > 5:  # Premium > 5% of income is high
                    score -= 5.0
                elif premium_to_income < 1:  # Premium < 1% might mean low coverage
                    if dependents > 2:
                        score -= 3.0
        
        # Dependents check - more dependents need higher coverage
        if dependents > 2:
            coverage = getattr(policy, "coverage", {})
            if isinstance(coverage, dict):
                sum_assured = coverage.get("sum_assured", 0)
                if sum_assured < 5000000:
                    score -= 4.0
        
        # Risk appetite alignment
        if risk_appetite == "low":
            # Conservative users prefer established providers
            if not hasattr(policy, "claim_settlement_ratio"):
                score -= 2.0
        
        return max(0.0, score)
