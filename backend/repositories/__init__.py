"""
Repository layer module.

Provides abstract base repository and implementations for data access.
Follows Repository Pattern for Dependency Inversion Principle.
"""
from .base import BaseRepository
from .claim_repository import ClaimRepository
from .policy_repository import PolicyRepository
from .user_repository import UserRepository

__all__ = [
    "BaseRepository",
    "ClaimRepository",
    "PolicyRepository",
    "UserRepository",
]
