from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    dob = Column(Date, nullable=True)
    risk_profile = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    country = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, nullable=False)
    policy_type = Column(String, nullable=False)  # auto, health, life, home, travel
    title = Column(String, nullable=False)
    coverage = Column(JSONB, nullable=True)
    premium = Column(Integer, nullable=False)
    term_months = Column(Integer, nullable=True)
    deductible = Column(Integer, nullable=True)
    tnc_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String)
    policy_id = Column(Integer)
    description = Column(String)
    documents = Column(String)  # can store file name or link
    status = Column(String, default="Reported")