from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Date, Text, Boolean, TIMESTAMP
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    dob = Column(Date, nullable=False)
    risk_profile = Column(JSONB, nullable=True)


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"))
    policy_type = Column(String)
    title = Column(String)
    coverage = Column(JSONB)
    premium = Column(Numeric)
    term_months = Column(Integer)
    deductible = Column(Numeric)
    tnc_url = Column(String)
    created_at = Column(DateTime)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    policy_id = Column(Integer, ForeignKey("policies.id"))
    score = Column(Integer)
    reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserPolicies(Base):
    __tablename__ = "userpolicies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False)
    policy_number = Column(String(50), unique=True, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    premium = Column(Numeric(12, 2), nullable=False)
    status = Column(String(20), default="active")
    auto_renew = Column(Boolean, default=False)


class Claims(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    user_policy_id = Column(Integer, ForeignKey("userpolicies.id", ondelete="CASCADE"), nullable=False)
    claim_number = Column(String(50), unique=True, nullable=False)
    claim_type = Column(String(100), nullable=False)
    incident_date = Column(Date, nullable=False)
    amount_claimed = Column(Numeric(12, 2), nullable=False)
    status = Column(String(20), default="draft")

    created_at = Column(TIMESTAMP, server_default=func.now())

    user_policy = relationship("UserPolicies")


class ClaimDocuments(Base):
    __tablename__ = "claimdocuments"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    file_url = Column(String, nullable=False)
    doc_type = Column(String(100))

    uploaded_at = Column(TIMESTAMP, server_default=func.now())

    claim = relationship("Claims")


# ✅ NEW FRAUD FLAGS MODEL
class FraudFlags(Base):
    __tablename__ = "fraudflags"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    rule_code = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    details = Column(Text)

    created_at = Column(TIMESTAMP, server_default=func.now())

    claim = relationship("Claims")

class AdminLogs(Base):
    __tablename__ = "adminlogs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    action = Column(Text)
    target_type = Column(String)
    target_id = Column(Integer)
    timestamp = Column(TIMESTAMP, server_default=func.now())