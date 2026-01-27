from sqlalchemy.orm import Session

from database import SessionLocal
from models import Provider, Policy


def seed_data() -> None:
    """Seed initial providers and policies if database is empty.

    This is idempotent: it only runs when there are no providers.
    """
    db: Session = SessionLocal()
    try:
        if db.query(Provider).count() > 0:
            return

        provider1 = Provider(name="SecureLife Insurance", country="IN")
        provider2 = Provider(name="HealthPlus Corp", country="IN")

        db.add_all([provider1, provider2])
        db.flush()  # assign IDs

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
        ]

        db.add_all(policies)
        db.commit()
    finally:
        db.close()
