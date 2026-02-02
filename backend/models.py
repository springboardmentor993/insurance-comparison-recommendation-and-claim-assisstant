from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey,Date
from database import Base
from sqlalchemy.dialects.postgresql import JSONB


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

# class RecommendedPolicy(Base):
#     __tablename__ = "recommended_policies"

#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
#     score = Column(float, nullable=False)
#     reason = Column(String, nullable=False)
#     recommended_at = Column(DateTime, default=datetime.utcnow)
