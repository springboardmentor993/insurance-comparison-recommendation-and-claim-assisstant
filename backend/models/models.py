from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Date, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from config.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    dob = Column(Date, nullable=True)
    role = Column(String, nullable=False, default="user")  # user or admin

    # Preferences for recommendation engine: budget_min, budget_max, preferred_policy_types,
    # required_coverages, deductible_preference, risk_factors
    risk_profile = Column(JSONB, nullable=True)

    # Legacy columns (nullable) so INSERT works when DB still has them
    income = Column(Integer, nullable=True)
    budget = Column(Integer, nullable=True)
    preferred_policy_type = Column(String, nullable=True)


class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    country = Column(String, nullable=True)
    reliability_score = Column(Numeric(3, 2), nullable=True)  # 1.0 to 5.0 rating
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    policies = relationship("Policy", back_populates="provider")


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    policy_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    coverage = Column(JSONB, nullable=True)  # JSON object: e.g. {"hospitalization": 500000, "opd": 20000}
    premium = Column(Numeric, nullable=False)
    term_months = Column(Integer, nullable=False)
    deductible = Column(Numeric, nullable=True)
    claim_settlement_ratio = Column(Numeric(5, 2), nullable=True)  # e.g., 95.50%
    provider_rating = Column(Numeric(3, 2), nullable=True)  # e.g., 4.5 out of 5
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    provider = relationship("Provider", back_populates="policies")


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


class UserPolicy(Base):
    """User's purchased/active policies"""
    __tablename__ = "userpolicies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    policy_number = Column(String, unique=True, nullable=True, index=True)  # Unique policy number (e.g., POL-2026-000001)
    start_date = Column(Date, nullable=True)  # Policy start date
    end_date = Column(Date, nullable=True)  # Policy expiration date
    premium = Column(Numeric, nullable=True)  # Premium amount at purchase time
    status = Column(String, nullable=False, default="active")  # active, expired, cancelled
    auto_renew = Column(Boolean, nullable=False, default=False)  # Auto-renewal flag
    purchased_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="user_policies")
    policy = relationship("Policy", backref="user_policies")


class Claim(Base):
    """Insurance claims filed by users"""
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    user_policy_id = Column(Integer, ForeignKey("userpolicies.id"), nullable=False)
    claim_number = Column(String, unique=True, nullable=False, index=True)
    claim_type = Column(String, nullable=False)  # health, life, auto
    incident_date = Column(DateTime(timezone=True), nullable=False)
    amount_claimed = Column(Numeric, nullable=False)
    status = Column(String, nullable=False, default="submitted")  # submitted, under_review, approved, rejected, paid
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_policy = relationship("UserPolicy", backref="claims")


class ClaimDocument(Base):
    """Documents attached to claims"""
    __tablename__ = "claimdocuments"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    file_url = Column(String, nullable=False)
    s3_key = Column(String, nullable=True)  # S3 object key for presigned URL generation
    doc_type = Column(String, nullable=False)  # medical_report, invoice, photo, police_report, etc.
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    claim = relationship("Claim", backref="documents")


class AdminLog(Base):
    """Audit log of admin actions"""
    __tablename__ = "adminlogs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # approve, reject, flag_fraud, review
    target_type = Column(String, nullable=False)  # claim, document
    target_id = Column(Integer, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    admin = relationship("User", foreign_keys=[admin_id])


class FraudFlag(Base):
    """Fraud flags on suspicious claims"""
    __tablename__ = "fraudflags"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    rule_code = Column(String, nullable=True)  # e.g., DUPLICATE_DOC, AMOUNT_ANOMALY, SUSPICIOUS_TIMING
    severity = Column(String, nullable=True)  # low, medium, high
    details = Column(Text, nullable=True)  # JSON with detection details
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Legacy fields for manual flagging (nullable for backward compatibility)
    reason = Column(Text, nullable=True)
    flagged_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    flagged_at = Column(DateTime(timezone=True), nullable=True)

    claim = relationship("Claim", backref="fraud_flags", foreign_keys=[claim_id])
    admin = relationship("User", foreign_keys=[flagged_by])
