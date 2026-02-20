from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, Numeric, Boolean, Text, Enum as SQLEnum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class PolicyType(str, enum.Enum):
    AUTO = "auto"
    HEALTH = "health"
    LIFE = "life"
    HOME = "home"
    TRAVEL = "travel"


class PolicyStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class ClaimStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    PAID = "paid"


class FraudSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    dob = Column(Date)
    risk_profile = Column(JSON)
    is_admin = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    user_policies = relationship("UserPolicy", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")
    admin_logs = relationship("AdminLog", back_populates="admin")


class Provider(Base):
    __tablename__ = "providers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    country = Column(String(100))
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    policies = relationship("Policy", back_populates="provider")


class Policy(Base):
    __tablename__ = "policies"
    
    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    policy_type = Column(SQLEnum(PolicyType), nullable=False)
    title = Column(String(500), nullable=False)
    coverage = Column(JSON)
    premium = Column(Numeric(10, 2), nullable=False)
    term_months = Column(Integer)
    deductible = Column(Numeric(10, 2))
    tnc_url = Column(String(1000))
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    provider = relationship("Provider", back_populates="policies")
    user_policies = relationship("UserPolicy", back_populates="policy")
    recommendations = relationship("Recommendation", back_populates="policy")


class UserPolicy(Base):
    __tablename__ = "user_policies"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    policy_number = Column(String(100), unique=True, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    premium = Column(Numeric(10, 2), nullable=False)
    status = Column(SQLEnum(PolicyStatus), default=PolicyStatus.ACTIVE)
    auto_renew = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="user_policies")
    policy = relationship("Policy", back_populates="user_policies")
    claims = relationship("Claim", back_populates="user_policy")


class Claim(Base):
    __tablename__ = "claims"
    
    id = Column(Integer, primary_key=True, index=True)
    user_policy_id = Column(Integer, ForeignKey("user_policies.id"), nullable=False)
    claim_number = Column(String(100), unique=True, nullable=False)
    claim_type = Column(String(100), nullable=False)
    incident_date = Column(Date, nullable=False)
    amount_claimed = Column(Numeric(10, 2), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(ClaimStatus), default=ClaimStatus.DRAFT)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    user_policy = relationship("UserPolicy", back_populates="claims")
    documents = relationship("ClaimDocument", back_populates="claim")
    fraud_flags = relationship("FraudFlag", back_populates="claim")


class ClaimDocument(Base):
    __tablename__ = "claim_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    file_url = Column(String(1000), nullable=False)
    doc_type = Column(String(100), nullable=False)
    uploaded_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    claim = relationship("Claim", back_populates="documents")


class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    score = Column(Numeric(5, 2), nullable=False)
    reason = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="recommendations")
    policy = relationship("Policy", back_populates="recommendations")


class FraudFlag(Base):
    __tablename__ = "fraud_flags"
    
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    rule_code = Column(String(50), nullable=False)
    severity = Column(SQLEnum(FraudSeverity), nullable=False)
    details = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    claim = relationship("Claim", back_populates="fraud_flags")


class AdminLog(Base):
    __tablename__ = "admin_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(Text, nullable=False)
    target_type = Column(String(50))
    target_id = Column(Integer)
    timestamp = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    admin = relationship("User", back_populates="admin_logs")
