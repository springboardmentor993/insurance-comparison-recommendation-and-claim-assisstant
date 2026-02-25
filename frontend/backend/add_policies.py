"""
Script to add vehicle and life insurance policies to the database
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Policy, PolicyType, Provider

def add_vehicle_and_life_policies():
    """Add vehicle and life insurance policies"""
    db = SessionLocal()
    try:
        # Get a provider (or create one)
        provider = db.query(Provider).first()
        if not provider:
            provider = Provider(name="SecureLife Insurance", rating=4.5)
            db.add(provider)
            db.commit()
            db.refresh(provider)
        
        # Add AUTO/VEHICLE policies
        auto_policies = [
            {
                "title": "Comprehensive Auto Coverage",
                "policy_type": PolicyType.AUTO,
                "provider_id": provider.id,
                "premium": 800,
                "deductible": 5000,
                "term_months": 12,
                "coverage_limit": 500000,
                "coverage": {
                    "Collision Coverage": "Up to ₹500,000",
                    "Third-Party Liability": "Unlimited",
                    "Personal Accident": "₹100,000",
                    "Theft Protection": "Full value coverage",
                    "Zero Depreciation": "Included",
                    "Roadside Assistance": "24/7 support"
                },
                "description": "Complete protection for your vehicle with zero depreciation and comprehensive coverage"
            },
            {
                "title": "Basic Vehicle Insurance",
                "policy_type": PolicyType.AUTO,
                "provider_id": provider.id,
                "premium": 450,
                "deductible": 10000,
                "term_months": 12,
                "coverage_limit": 300000,
                "coverage": {
                    "Third-Party Liability": "As per law",
                    "Own Damage": "₹300,000",
                    "Personal Accident": "₹15 lakhs"
                },
                "description": "Affordable vehicle insurance covering third-party liabilities and own damage"
            },
            {
                "title": "Premium Auto Shield",
                "policy_type": PolicyType.AUTO,
                "provider_id": provider.id,
                "premium": 1200,
                "deductible": 3000,
                "term_months": 12,
                "coverage_limit": 1000000,
                "coverage": {
                    "Collision Coverage": "Up to ₹10 lakhs",
                    "Comprehensive Damage": "Fire, theft, natural disasters",
                    "Engine Protection": "Covered",
                    "Return to Invoice": "Get full car value",
                    "Consumables Cover": "Included",
                    "Key Replacement": "Covered"
                },
                "description": "Premium auto insurance with engine protection and return to invoice benefit"
            },
            {
                "title": "Two Wheeler Protection Plan",
                "policy_type": PolicyType.AUTO,
                "provider_id": provider.id,
                "premium": 280,
                "deductible": 2000,
                "term_months": 12,
                "coverage_limit": 150000,
                "coverage": {
                    "Own Damage": "₹150,000",
                    "Third-Party Liability": "Unlimited",
                    "Personal Accident": "₹15 lakhs",
                    "Theft Cover": "Included"
                },
                "description": "Affordable two-wheeler insurance with comprehensive protection"
            }
        ]
        
        # Add LIFE policies
        life_policies = [
            {
                "title": "Term Life Protection",
                "policy_type": PolicyType.LIFE,
                "provider_id": provider.id,
                "premium": 600,
                "deductible": 0,
                "term_months": 240,  # 20 years
                "coverage_limit": 5000000,
                "coverage": {
                    "Death Benefit": "₹50 lakhs",
                    "Accidental Death": "Additional ₹50 lakhs",
                    "Terminal Illness": "₹25 lakhs advance payout",
                    "Premium Waiver": "On critical illness"
                },
                "description": "Comprehensive term life insurance with high coverage and affordable premiums"
            },
            {
                "title": "Family Shield Life Plan",
                "policy_type": PolicyType.LIFE,
                "provider_id": provider.id,
                "premium": 950,
                "deductible": 0,
                "term_months": 300,  # 25 years
                "coverage_limit": 10000000,
                "coverage": {
                    "Life Cover": "₹1 crore",
                    "Critical Illness": "₹25 lakhs",
                    "Income Benefit": "Monthly payout option",
                    "Maturity Benefit": "Return of premiums",
                    "Tax Benefits": "Under section 80C"
                },
                "description": "Complete family protection with life cover, critical illness, and maturity benefits"
            },
            {
                "title": "Savings Plus Life Insurance",
                "policy_type": PolicyType.LIFE,
                "provider_id": provider.id,
                "premium": 1200,
                "deductible": 0,
                "term_months": 180,  # 15 years
                "coverage_limit": 3000000,
                "coverage": {
                    "Life Cover": "₹30 lakhs",
                    "Maturity Benefit": "Guaranteed returns",
                    "Loyalty Additions": "Bonus every 5 years",
                    "Loan Facility": "Against policy value"
                },
                "description": "Combine life insurance with savings and guaranteed returns"
            },
            {
                "title": "Retirement Life Plan",
                "policy_type": PolicyType.LIFE,
                "provider_id": provider.id,
                "premium": 850,
                "deductible": 0,
                "term_months": 360,  # 30 years
                "coverage_limit": 2000000,
                "coverage": {
                    "Life Cover": "₹20 lakhs",
                    "Pension Benefit": "Regular income post retirement",
                    "Annuity Options": "Flexible payout plans",
                    "Spouse Cover": "Additional ₹10 lakhs"
                },
                "description": "Secure your retirement with life cover and pension benefits"
            }
        ]
        
        policies_added = 0
        
        # Add auto policies
        for policy_data in auto_policies:
            # Check if exists
            existing = db.query(Policy).filter(
                Policy.title == policy_data["title"]
            ).first()
            if not existing:
                policy = Policy(**policy_data)
                db.add(policy)
                policies_added += 1
                print(f"✅ Added: {policy_data['title']}")
        
        # Add life policies
        for policy_data in life_policies:
            # Check if exists
            existing = db.query(Policy).filter(
                Policy.title == policy_data["title"]
            ).first()
            if not existing:
                policy = Policy(**policy_data)
                db.add(policy)
                policies_added += 1
                print(f"✅ Added: {policy_data['title']}")
        
        db.commit()
        print(f"\n🎉 Added {policies_added} new policies!")
        print("✅ Vehicle insurance policies: 4")
        print("✅ Life insurance policies: 4")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("Adding vehicle and life insurance policies...\n")
    add_vehicle_and_life_policies()
