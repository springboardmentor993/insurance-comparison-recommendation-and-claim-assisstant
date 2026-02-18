from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User, Policy, UserPolicy, Provider, Base
from passlib.context import CryptContext
import datetime
import random
import sys

# Setup password hashing
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_test_data():
    print("Starting test data creation...")
    
    # Create tables if they don't exist (just in case)
    # Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Check providers
        if db.query(Provider).count() == 0:
            print("Seeding providers...")
            provider1 = Provider(name="SecureLife Insurance", country="IN")
            provider2 = Provider(name="HealthPlus Corp", country="IN")
            db.add_all([provider1, provider2])
            db.flush()
            
            print("Seeding policies...")
            policies = [
                Policy(
                    provider_id=provider1.id,
                    policy_type="health",
                    title="SecureLife Health Basic",
                    coverage='{"hospitalization": 500000, "opd": 20000}',
                    premium=8000,
                    term_months=12,
                    deductible=5000,
                ),
                Policy(
                    provider_id=provider1.id,
                    policy_type="life",
                    title="SecureLife Term Shield",
                    coverage='{"sum_assured": 5000000, "accidental": 1000000}',
                    premium=12000,
                    term_months=12,
                    deductible=0,
                ),
                Policy(
                    provider_id=provider2.id,
                    policy_type="health",
                    title="HealthPlus Family Care",
                    coverage='{"hospitalization": 1000000, "maternity": 50000}',
                    premium=15000,
                    term_months=12,
                    deductible=10000,
                ),
                 Policy(
                    provider_id=provider1.id,
                    policy_type="auto",
                    title="SecureLife Auto Protect",
                    coverage='{"third_party": 1000000, "own_damage": 500000}',
                    premium=5000,
                    term_months=12,
                    deductible=2500,
                ),
                Policy(
                    provider_id=provider2.id,
                    policy_type="home",
                    title="HealthPlus Home Guard",
                    coverage='{"structure": 2000000, "contents": 500000}',
                    premium=6000,
                    term_months=12,
                    deductible=10000,
                ),
            ]
            db.add_all(policies)
            db.commit()
        else:
            print("Providers and policies already exist.")

        # Create User
        email = "test_claim@example.com"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Creating user {email}")
            user = User(
                email=email,
                name="Test Claim User",
                password=get_password_hash("password123"),
                # is_active=True # User model doesn't have is_active in the file I read?
                # Let's check models.py content again if needed.
                # models.py: 
                # name = Column(String, nullable=False)
                # email = Column(String, unique=True, index=True, nullable=False)
                # password = Column(String, nullable=False)
                # dob = Column(Date, nullable=True)
                # risk_profile = Column(JSONB, nullable=True)
                # created_at = ...
                # It does NOT have is_active.
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            print(f"User {email} already exists")

        # Get a policy
        policy = db.query(Policy).first()
        if not policy:
            print("No policies found! Seed failed?")
            return

        # Check if user has this policy
        user_policy = db.query(UserPolicy).filter(
            UserPolicy.user_id == user.id,
            UserPolicy.policy_id == policy.id
        ).first()

        if not user_policy:
            print(f"Assigning policy '{policy.title}' to user")
            user_policy = UserPolicy(
                user_id=user.id,
                policy_id=policy.id,
                start_date=datetime.date.today(),
                end_date=datetime.date.today() + datetime.timedelta(days=365),
                status="active",
                policy_number=f"POL-{user.id}-{policy.id}-{random.randint(1000,9999)}",
                premium=policy.premium,
                auto_renew=False
            )
            db.add(user_policy)
            db.commit()
            print("Policy assigned.")
        else:
            print("User already has a policy")
        
        print("Test data setup complete.")
        print(f"User: {email}")
        print("Password: password123")
        
    except Exception as e:
        print(f"Error creating test data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data()
