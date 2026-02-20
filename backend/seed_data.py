"""
Seed database with sample data for testing
Run: python seed_data.py
"""
from app.database import SessionLocal, engine
from app.models import Base, User, Provider, Policy, PolicyType
from app.auth import get_password_hash
from datetime import datetime

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Create admin user
    admin = User(
        name="Admin User",
        email="admin@insurance.com",
        password=get_password_hash("admin123"),
        is_admin=True,
        risk_profile={}
    )
    db.add(admin)
    
    # Create test user
    test_user = User(
        name="John Doe",
        email="john@example.com",
        password=get_password_hash("password123"),
        dob=datetime.strptime("1985-05-15", "%Y-%m-%d").date(),
        risk_profile={
            "preferred_types": ["health", "auto"],
            "max_budget": 500,
            "coverage_needs": ["medical", "accident", "liability"],
            "deductible_preference": "medium"
        }
    )
    db.add(test_user)
    
    # Create providers
    providers_data = [
        {"name": "HealthFirst Insurance", "country": "USA"},
        {"name": "AutoSafe Coverage", "country": "USA"},
        {"name": "LifeGuard Assurance", "country": "USA"},
        {"name": "HomeProtect Insurance", "country": "USA"},
        {"name": "TravelSecure", "country": "USA"},
    ]
    
    providers = []
    for prov_data in providers_data:
        provider = Provider(**prov_data)
        db.add(provider)
        providers.append(provider)
    
    db.commit()
    
    # Create sample policies
    policies_data = [
        # Health policies
        {
            "provider_id": 1,
            "policy_type": PolicyType.HEALTH,
            "title": "Comprehensive Health Plan",
            "coverage": {
                "medical": "Up to $1M",
                "prescription": "80% coverage",
                "preventive": "100% coverage",
                "emergency": "Included"
            },
            "premium": 350.00,
            "term_months": 12,
            "deductible": 1000.00,
            "tnc_url": "https://example.com/health-tnc"
        },
        {
            "provider_id": 1,
            "policy_type": PolicyType.HEALTH,
            "title": "Basic Health Plan",
            "coverage": {
                "medical": "Up to $500K",
                "prescription": "50% coverage",
                "preventive": "Included"
            },
            "premium": 180.00,
            "term_months": 12,
            "deductible": 2500.00,
            "tnc_url": "https://example.com/basic-health-tnc"
        },
        # Auto policies
        {
            "provider_id": 2,
            "policy_type": PolicyType.AUTO,
            "title": "Full Coverage Auto Insurance",
            "coverage": {
                "liability": "$500K",
                "collision": "Included",
                "comprehensive": "Included",
                "uninsured_motorist": "Included"
            },
            "premium": 120.00,
            "term_months": 6,
            "deductible": 500.00,
            "tnc_url": "https://example.com/auto-tnc"
        },
        {
            "provider_id": 2,
            "policy_type": PolicyType.AUTO,
            "title": "Liability Only Auto Insurance",
            "coverage": {
                "liability": "$250K"
            },
            "premium": 65.00,
            "term_months": 6,
            "deductible": 1000.00,
            "tnc_url": "https://example.com/auto-liability-tnc"
        },
        # Life policies
        {
            "provider_id": 3,
            "policy_type": PolicyType.LIFE,
            "title": "Term Life Insurance - 20 Year",
            "coverage": {
                "death_benefit": "$500K",
                "accidental_death": "Double benefit"
            },
            "premium": 45.00,
            "term_months": 240,
            "deductible": 0.00,
            "tnc_url": "https://example.com/life-tnc"
        },
        {
            "provider_id": 3,
            "policy_type": PolicyType.LIFE,
            "title": "Whole Life Insurance",
            "coverage": {
                "death_benefit": "$250K",
                "cash_value": "Accumulating"
            },
            "premium": 150.00,
            "term_months": 600,
            "deductible": 0.00,
            "tnc_url": "https://example.com/whole-life-tnc"
        },
        # Home policies
        {
            "provider_id": 4,
            "policy_type": PolicyType.HOME,
            "title": "Comprehensive Home Insurance",
            "coverage": {
                "dwelling": "$400K",
                "personal_property": "$200K",
                "liability": "$300K",
                "additional_living": "$80K"
            },
            "premium": 100.00,
            "term_months": 12,
            "deductible": 1500.00,
            "tnc_url": "https://example.com/home-tnc"
        },
        # Travel policies
        {
            "provider_id": 5,
            "policy_type": PolicyType.TRAVEL,
            "title": "International Travel Insurance",
            "coverage": {
                "medical": "$100K",
                "trip_cancellation": "Up to $10K",
                "baggage": "Up to $2K",
                "emergency_evacuation": "Included"
            },
            "premium": 85.00,
            "term_months": 1,
            "deductible": 100.00,
            "tnc_url": "https://example.com/travel-tnc"
        },
    ]
    
    for policy_data in policies_data:
        policy = Policy(**policy_data)
        db.add(policy)
    
    db.commit()
    
    print("✅ Database seeded successfully!")
    print(f"   - Created {len(providers)} providers")
    print(f"   - Created {len(policies_data)} policies")
    print(f"   - Created 2 users (admin and test user)")
    print("\nTest Credentials:")
    print("   Admin: admin@insurance.com / admin123")
    print("   User:  john@example.com / password123")
    
except Exception as e:
    print(f"❌ Error seeding database: {e}")
    db.rollback()
finally:
    db.close()
