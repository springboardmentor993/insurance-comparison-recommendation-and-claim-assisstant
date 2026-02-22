from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base


# ---------------- USERS ----------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="user")
    purchased_policies = relationship("UserPolicies", back_populates="user")


# ---------------- CATEGORIES ----------------
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    icon = Column(String)

    policies = relationship("Policy", back_populates="category")


# ---------------- PROVIDERS ----------------
class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    country = Column(String)

    policies = relationship("Policy", back_populates="provider")


# ---------------- POLICIES ----------------
class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)

    provider_id = Column(Integer, ForeignKey("providers.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))

    policy_type = Column(String)
    title = Column(String)
    coverage = Column(Float)
    premium = Column(Float)
    term_months = Column(Integer)
    deductible = Column(Float)
    tnc_url = Column(String)
    created_at = Column(DateTime)

    claim_ratio = Column(Float)
    network_hospitals = Column(Float)
    waiting_period = Column(Integer)
    customer_rating = Column(Float)
    popularity_score = Column(Float)

    provider = relationship("Provider", back_populates="policies")
    category = relationship("Category", back_populates="policies")

    user_purchases = relationship("UserPolicies", back_populates="policy")


# ---------------- USER PURCHASED POLICIES ----------------
class UserPolicies(Base):
    __tablename__ = "userpolicies"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    policy_id = Column(Integer, ForeignKey("policies.id"))

    policy_number = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)

    premium = Column(Float)
    status = Column(String)  # active, expired, cancelled
    auto_renew = Column(String)

    user = relationship("User", back_populates="purchased_policies")
    policy = relationship("Policy", back_populates="user_purchases")

    claims = relationship("Claims", back_populates="user_policy")


# ---------------- CLAIMS ----------------
class Claims(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)

    user_policy_id = Column(Integer, ForeignKey("userpolicies.id"))

    claim_number = Column(String)
    claim_type = Column(String)
    incident_date = Column(DateTime)
    amount_claimed = Column(Float)
    status = Column(String)  # submitted, approved, rejected
    created_at = Column(DateTime)

    user_policy = relationship("UserPolicies", back_populates="claims")
