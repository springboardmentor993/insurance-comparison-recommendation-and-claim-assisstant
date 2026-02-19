from sqlalchemy.orm import Session

from config.database import SessionLocal
from models.models import Provider, Policy


def seed_data() -> None:
    """Seed initial providers and policies with enhanced attributes.

    This is idempotent: it only runs when there are no providers.
    """
    db: Session = SessionLocal()
    try:
        if db.query(Provider).count() > 0:
            return

        # Create providers with reliability scores
        provider1 = Provider(
            name="SecureLife Insurance",
            country="IN",
            reliability_score=4.5
        )
        provider2 = Provider(
            name="HealthPlus Corp",
            country="IN",
            reliability_score=4.2
        )
        provider3 = Provider(
            name="AutoGuard Insurance",
            country="IN",
            reliability_score=4.7
        )

        db.add_all([provider1, provider2, provider3])
        db.flush()  # assign IDs

        # Create comprehensive policies with enhanced attributes
        policies = [
            # Health Insurance Policies
            Policy(
                provider_id=provider1.id,
                policy_type="health",
                title="SecureLife Health Basic",
                coverage={
                    "hospitalization": 500000,
                    "opd": 20000,
                    "ambulance": 5000,
                    "pre_existing_diseases": True
                },
                premium=8000,
                term_months=12,
                deductible=5000,
                claim_settlement_ratio=95.5,
                provider_rating=4.3,
            ),
            Policy(
                provider_id=provider2.id,
                policy_type="health",
                title="HealthPlus Family Care",
                coverage={
                    "hospitalization": 1000000,
                    "maternity": 50000,
                    "opd": 30000,
                    "ambulance": 10000,
                    "pre_existing_diseases": True,
                    "mental_health": 25000
                },
                premium=15000,
                term_months=12,
                deductible=10000,
                claim_settlement_ratio=97.2,
                provider_rating=4.6,
            ),
            Policy(
                provider_id=provider1.id,
                policy_type="health",
                title="SecureLife Senior Care",
                coverage={
                    "hospitalization": 750000,
                    "opd": 40000,
                    "ambulance": 8000,
                    "pre_existing_diseases": True,
                    "day_care_procedures": 50000
                },
                premium=12000,
                term_months=12,
                deductible=7500,
                claim_settlement_ratio=96.8,
                provider_rating=4.4,
            ),
            
            # Life Insurance Policies
            Policy(
                provider_id=provider1.id,
                policy_type="life",
                title="SecureLife Term Shield",
                coverage={
                    "sum_assured": 5000000,
                    "accidental_death": 1000000,
                    "terminal_illness": 500000
                },
                premium=12000,
                term_months=12,
                deductible=0,
                claim_settlement_ratio=98.5,
                provider_rating=4.7,
            ),
            Policy(
                provider_id=provider2.id,
                policy_type="life",
                title="HealthPlus Life Secure",
                coverage={
                    "sum_assured": 10000000,
                    "accidental_death": 2000000,
                    "critical_illness": 1000000,
                    "terminal_illness": 1000000
                },
                premium=18000,
                term_months=12,
                deductible=0,
                claim_settlement_ratio=97.8,
                provider_rating=4.5,
            ),
            Policy(
                provider_id=provider1.id,
                policy_type="life",
                title="SecureLife Family Protection",
                coverage={
                    "sum_assured": 7500000,
                    "accidental_death": 1500000,
                    "critical_illness": 750000
                },
                premium=15000,
                term_months=12,
                deductible=0,
                claim_settlement_ratio=96.5,
                provider_rating=4.4,
            ),
            
            # Auto Insurance Policies
            Policy(
                provider_id=provider3.id,
                policy_type="auto",
                title="AutoGuard Comprehensive",
                coverage={
                    "own_damage": 500000,
                    "third_party_liability": 1000000,
                    "theft": 500000,
                    "accident_coverage": 200000,
                    "roadside_assistance": True
                },
                premium=10000,
                term_months=12,
                deductible=3000,
                claim_settlement_ratio=94.5,
                provider_rating=4.5,
            ),
            Policy(
                provider_id=provider3.id,
                policy_type="auto",
                title="AutoGuard Third Party",
                coverage={
                    "third_party_liability": 1000000
                },
                premium=3000,
                term_months=12,
                deductible=0,
                claim_settlement_ratio=96.0,
                provider_rating=4.3,
            ),
            Policy(
                provider_id=provider3.id,
                policy_type="auto",
                title="AutoGuard Premium Plus",
                coverage={
                    "own_damage": 1000000,
                    "third_party_liability": 2000000,
                    "theft": 1000000,
                    "accident_coverage": 500000,
                    "roadside_assistance": True,
                    "zero_depreciation": True,
                    "engine_protection": True
                },
                premium=18000,
                term_months=12,
                deductible=5000,
                claim_settlement_ratio=95.8,
                provider_rating=4.8,
            ),
        ]

        db.add_all(policies)
        db.commit()
        
        print(f"✅ Seeded {len(policies)} policies from 3 providers with enhanced attributes")
        
    finally:
        db.close()
