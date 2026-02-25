"""
Script to seed the database with 50+ real-world insurance policies.
"""

import sys
import os
import random

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Policy, PolicyType, Provider

def seed_policies():
    """Seed database with diverse insurance policies"""
    db = SessionLocal()
    try:
        # 1. Ensure Providers exist
        providers_data = [
            {"name": "SecureLife Insurance", "country": "India"},
            {"name": "Global Shield", "country": "USA"},
            {"name": "RapidVerify Assurance", "country": "UK"},
            {"name": "Family First", "country": "India"},
            {"name": "AutoGuard Pro", "country": "Germany"}
        ]
        
        providers = []
        for p_data in providers_data:
            provider = db.query(Provider).filter(Provider.name == p_data["name"]).first()
            if not provider:
                provider = Provider(name=p_data["name"], country=p_data["country"])
                db.add(provider)
                db.commit()
                db.refresh(provider)
                print(f"Created provider: {provider.name}")
            providers.append(provider)
            
        # 2. Define Policies
        
        # Procedural Generation for 50+ Unique Policies per Type
        
        adjectives = ["Premium", "Basic", "Gold", "Silver", "Platinum", "Secure", "Smart", "Easy", "Rapid", "Family", "Total", "Ultra", "Max", "Flexi", "Super", "Elite", "Prime", "Choice", "Select", "Value"]
        nouns_health = ["Health", "Wellness", "Care", "Medic", "Hospital", "Sanjeevani", "Arogya", "Life", "Vitality", "Cure"]
        nouns_life = ["Life", "Future", "Term", "Legacy", "Protection", "Retirement", "Pension", "Income", "Family", "Secure"]
        nouns_auto = ["Car", "Bike", "Auto", "Drive", "Ride", "Motor", "Vehicle", "Wheels", "Road", "Transit"]
        nouns_travel = ["Travel", "Trip", "Journey", "Voyage", "Flight", "Tour", "Vacation", "Holiday", "Explorer", "Globetrotter"]
        nouns_home = ["Home", "House", "Villa", "Property", "Estate", "Living", "Abode", "Shelter", "Nesting", "Habitat"]
        suffixes = ["Shield", "Guard", "Protect", "Cover", "Assurance", "Plan", "Policy", "Care", "Secure", "Defense", "Keeper", "Saver", "Plus", "Pro", "Max", "Prime"]
        
        def generate_unique_policies(policy_type, nouns, base_premium, base_deductible):
            generated = []
            seen_titles = set()
            
            # Target 60 policies per type to be safe
            while len(generated) < 60:
                adj = random.choice(adjectives)
                noun = random.choice(nouns)
                suffix = random.choice(suffixes)
                title = f"{adj} {noun} {suffix}"
                
                if title in seen_titles:
                    continue
                seen_titles.add(title)
                
                # Randomize params
                premium_mult = random.uniform(0.5, 2.5)
                deductible_mult = random.uniform(0.0, 2.0)
                term = random.choice([12, 24, 36, 60, 120])
                if policy_type == PolicyType.LIFE:
                    term = random.choice([120, 240, 300, 360, 480])
                
                # Coverage features based on premium (higher premium = better features)
                coverage = {}
                limit_amount = 0
                
                if premium_mult > 1.5:
                    coverage["Tier"] = "Platinum"
                    coverage["Support"] = "24/7 Priority"
                    coverage["Bonus"] = "Included"
                    limit_amount = base_premium * 1000 # High limit
                elif premium_mult > 1.0:
                    coverage["Tier"] = "Gold"
                    coverage["Support"] = "Standard"
                    limit_amount = base_premium * 500 # Medium limit
                else:
                    coverage["Tier"] = "Economy"
                    coverage["Value"] = "Best Price"
                    limit_amount = base_premium * 200 # Low limit
                
                # Round limit
                limit_amount = round(limit_amount, -3)
                coverage["limit"] = limit_amount
                
                # Add type specific coverage
                if policy_type == PolicyType.HEALTH:
                    coverage["Room Rent"] = "No Capping" if premium_mult > 1.5 else "1% SI"
                    coverage["OPD"] = "Covered" if premium_mult > 1.8 else "Not Covered"
                    coverage["Sum Insured"] = f"₹{limit_amount:,.0f}"
                elif policy_type == PolicyType.AUTO:
                    coverage["Zero Dep"] = "Yes" if premium_mult > 1.2 else "Add-on"
                    coverage["Roadside Assist"] = "Free"
                    coverage["IDV"] = f"₹{limit_amount:,.0f}"
                elif policy_type == PolicyType.LIFE:
                     coverage["Death Benefit"] = f"₹{limit_amount:,.0f}"
                elif policy_type == PolicyType.HOME:
                     coverage["Structure Cover"] = f"₹{limit_amount:,.0f}"
                
                generated.append({
                    "title": title,
                    "premium": round(base_premium * premium_mult, -1), # Round to nearest 10
                    "deductible": round(base_deductible * deductible_mult, -1),
                    "term_months": term,
                    "coverage": coverage
                })
            return generated

        all_categories = [
            (generate_unique_policies(PolicyType.HEALTH, nouns_health, 800, 2000), PolicyType.HEALTH),
            (generate_unique_policies(PolicyType.LIFE, nouns_life, 2000, 0), PolicyType.LIFE),
            (generate_unique_policies(PolicyType.AUTO, nouns_auto, 1200, 2000), PolicyType.AUTO),
            (generate_unique_policies(PolicyType.TRAVEL, nouns_travel, 1500, 100), PolicyType.TRAVEL),
            (generate_unique_policies(PolicyType.HOME, nouns_home, 2500, 5000), PolicyType.HOME)
        ]

        count = 0
        for policy_list, p_type in all_categories:
            for p_data in policy_list:
                # Check for existing by title
                existing = db.query(Policy).filter(Policy.title == p_data["title"]).first()
                if not existing:
                    # Randomly assign a provider
                    provider = random.choice(providers)
                    
                    policy = Policy(
                        provider_id=provider.id,
                        policy_type=p_type,
                        title=p_data["title"],
                        coverage=p_data["coverage"],
                        premium=p_data["premium"],
                        term_months=p_data["term_months"],
                        deductible=p_data["deductible"],
                        tnc_url="https://example.com/tnc"
                    )
                    db.add(policy)
                    count += 1
                    # print(f"Added {p_type}: {p_data['title']}")
        
        db.commit()
        print(f"\n✅ Automatically seeded {count} new unique policies!")
        print(f"Total target: 300+ unique policies")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding policies: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_policies()
