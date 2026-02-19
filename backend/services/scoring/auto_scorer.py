"""
Auto insurance risk scoring strategy.

Single Responsibility: Only handles auto insurance risk scoring.
"""
from typing import Any, Dict, Optional

from .base import RiskScorer


class AutoRiskScorer(RiskScorer):
    """
    Risk scorer for auto insurance policies.
    
    Considers:
    - Car age
    - Driving history
    - Location risk (urban/metro/rural)
    - Coverage adequacy for vehicle type
    """
    
    @property
    def insurance_type(self) -> str:
        return "auto"
    
    def calculate_score(
        self,
        policy: Any,
        risk_factors: Dict[str, Any],
        user_age: Optional[int]
    ) -> float:
        """
        Calculate auto insurance risk score.
        
        Higher scores indicate better policy match for user's driving profile.
        """
        score = 25.0
        
        car_age = risk_factors.get("car_age_years", 0)
        driving_history = risk_factors.get("driving_history", "clean")
        location_risk = risk_factors.get("location_risk", "urban")
        
        premium = float(getattr(policy, "premium", 0))
        coverage = getattr(policy, "coverage", {})
        
        # Car age affects coverage needs
        if car_age:
            if car_age > 5:
                # Older cars might not need comprehensive coverage
                if premium > 20000:
                    score -= 4.0
            else:
                # New cars need good coverage
                if not coverage or not isinstance(coverage, dict):
                    score -= 5.0
        
        # Driving history impacts risk and premium
        if driving_history in ["major_violations", "minor_violations"]:
            # Bad driving history might mean higher premiums
            score -= 3.0
        
        # Location-based risk assessment
        if location_risk == "metro":
            # Metro areas need comprehensive coverage (theft, accidents)
            if isinstance(coverage, dict):
                coverage_str = str(coverage).lower()
                if "theft" not in coverage_str:
                    score -= 3.0
        
        return max(0.0, score)
