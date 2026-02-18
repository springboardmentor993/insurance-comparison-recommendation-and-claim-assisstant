from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    ForeignKey,
    DateTime,
    Date,
    Boolean,
    Enum,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


# SQLite-compatible ENUM types
PolicyTypeEnum = Enum(
    "auto", "health", "life", "home", "travel",
    name="policy_type_enum",
    create_type=True,
)

UserPolicyStatusEnum = Enum(
    "active", "expired", "cancelled",
    name="user_policy_status_enum",
    create_type=True,
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    dob = Column(Date, nullable=True)
    role = Column(String, default="user", nullable=False) # 'user' or 'admin'
    risk_profile = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_policies = relationship("UserPolicy", back_populates="user")


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

    # match your DB enum (not plain String)
    policy_type = Column(PolicyTypeEnum, nullable=False)

    title = Column(String, nullable=False)
    coverage = Column(String, nullable=True)
    premium = Column(Numeric, nullable=False)
    term_months = Column(Integer, nullable=False)
    deductible = Column(Numeric, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    provider = relationship("Provider", back_populates="policies")
    user_policies = relationship("UserPolicy", back_populates="policy")


class UserPolicy(Base):
    __tablename__ = "user_policies"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)

    policy_number = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    premium = Column(Numeric, nullable=False)

    # match your DB enum
    status = Column(UserPolicyStatusEnum, nullable=False)

    auto_renew = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="user_policies")
    policy = relationship("Policy", back_populates="user_policies")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    
    score = Column(Numeric, nullable=False)  # Recommendation score (0-1)
    reasons = Column(JSON, nullable=True)  # List of reasons for recommendation
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")
    policy = relationship("Policy")


ClaimStatusEnum = Enum(
    "pending", "under_review", "approved", "rejected", "completed",
    name="claim_status_enum",
    create_type=True,
)


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_policy_id = Column(Integer, ForeignKey("user_policies.id"), nullable=False)
    
    claim_number = Column(String, unique=True, nullable=False, index=True)
    claim_type = Column(String, nullable=False)  # e.g., "medical", "accident", "property_damage"
    incident_date = Column(Date, nullable=False)
    description = Column(String, nullable=False)
    claim_amount = Column(Numeric, nullable=False)
    
    status = Column(ClaimStatusEnum, nullable=False, default="pending")
    status_notes = Column(String, nullable=True)
    approved_amount = Column(Numeric, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User")
    user_policy = relationship("UserPolicy")
    documents = relationship("ClaimDocument", back_populates="claim", cascade="all, delete-orphan")


class ClaimDocument(Base):
    __tablename__ = "claim_documents"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # e.g., "pdf", "jpg", "png"
    file_size = Column(Integer, nullable=False)  # Size in bytes
    s3_key = Column(String, nullable=False)  # S3 object key
    s3_url = Column(String, nullable=False)  # S3 presigned/public URL
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    claim = relationship("Claim", back_populates="documents")


class ClaimHistory(Base):
    __tablename__ = "claim_history"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    
    status = Column(ClaimStatusEnum, nullable=False)
    notes = Column(String, nullable=True)
    
    # Who made the change? For now, we assume system or user/admin. 
    # Can add user_id later if needed.
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    claim = relationship("Claim", back_populates="history")

# Update Claim relationship
Claim.history = relationship("ClaimHistory", back_populates="claim", cascade="all, delete-orphan")


class FraudFlag(Base):
    __tablename__ = "fraud_flags"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    
    flag_reason = Column(String, nullable=False)
    flag_details = Column(String, nullable=True)
    is_resolved = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    claim = relationship("Claim", back_populates="fraud_flags")


# Update Claim relationship for fraud flags
Claim.fraud_flags = relationship("FraudFlag", back_populates="claim", cascade="all, delete-orphan")
