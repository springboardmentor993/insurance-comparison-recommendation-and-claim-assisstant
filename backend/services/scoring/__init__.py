"""
Scoring module for insurance policy recommendations.

Implements Strategy Pattern for Open/Closed Principle:
- New insurance types can be added without modifying existing scorers
- Each scorer is independent and testable
"""
from .base import RiskScorer, ScorerRegistry
from .health_scorer import HealthRiskScorer
from .life_scorer import LifeRiskScorer
from .auto_scorer import AutoRiskScorer

# Register all scorers
ScorerRegistry.register("health", HealthRiskScorer())
ScorerRegistry.register("life", LifeRiskScorer())
ScorerRegistry.register("auto", AutoRiskScorer())

__all__ = [
    "RiskScorer",
    "ScorerRegistry",
    "HealthRiskScorer",
    "LifeRiskScorer",
    "AutoRiskScorer",
]
