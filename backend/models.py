from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    dob = Column(Date, nullable=True)

    # ⭐ NEW FIELDS ADDED ⭐
    income = Column(Integer, nullable=True)  # YEARLY income
    budget = Column(Integer, nullable=True)  # Preferred maximum premium
    preferred_policy_type = Column(String, nullable=True)  # health, life, motor, travel

    risk_profile = relationship("RiskProfile", back_populates="user", uselist=False)


class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    country = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    policies = relationship("Policy", back_populates="provider")


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    policy_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    coverage = Column(String, nullable=True)
    premium = Column(Numeric, nullable=False)
    term_months = Column(Integer, nullable=False)
    deductible = Column(Numeric, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    provider = relationship("Provider", back_populates="policies")


class RiskProfile(Base):
    __tablename__ = "risk_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    dependents = Column(Integer, nullable=False)
    risk_profile = Column(String, nullable=False)  # high, medium, low

    user = relationship("User", back_populates="risk_profile")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    score = Column(Numeric, nullable=False)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    policy = relationship("Policy")
