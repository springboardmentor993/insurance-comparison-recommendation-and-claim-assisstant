# from sqlalchemy.orm import Session

# from database import SessionLocal
# from models import Provider, Policy


# def seed_data() -> None:
#     """Seed initial providers and policies if database is empty.

#     This is idempotent: it only runs when there are no providers.
#     """
#     db: Session = SessionLocal()
#     try:
#         if db.query(Provider).count() > 0:
#             return

#         provider1 = Provider(name="SecureLife Insurance", country="IN")
#         provider2 = Provider(name="HealthPlus Corp", country="IN")

#         db.add_all([provider1, provider2])
#         db.flush()  # assign IDs

#         policies = [
#             Policy(
#                 provider_id=provider1.id,
#                 policy_type="health",
#                 title="SecureLife Health Basic",
#                 coverage='{"hospitalization": 500000, "opd": 20000}',
#                 premium=8000,
#                 term_months=12,
#                 deductible=5000,
#             ),
#             Policy(
#                 provider_id=provider1.id,
#                 policy_type="life",
#                 title="SecureLife Term Shield",
#                 coverage='{"sum_assured": 5000000, "accidental": 1000000}',
#                 premium=12000,
#                 term_months=12,
#                 deductible=0,
#             ),
#             Policy(
#                 provider_id=provider2.id,
#                 policy_type="health",
#                 title="HealthPlus Family Care",
#                 coverage='{"hospitalization": 1000000, "maternity": 50000}',
#                 premium=15000,
#                 term_months=12,
#                 deductible=10000,
#             ),
#         ]

#         db.add_all(policies)
#         db.commit()
#     finally:
#         db.close()
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Provider, Policy


def seed_data() -> None:
    """
    Seed providers and policies.
    Safe to run multiple times (no duplicates).
    """
    db: Session = SessionLocal()
    try:
        # ---------- PROVIDERS ----------
        providers_data = [
            ("SecureLife Insurance", "IN"),
            ("HealthPlus Corp", "IN"),
            ("HDFC Ergo", "IN"),
            ("ICICI Lombard", "IN"),
            ("Star Health", "IN"),
            ("Bajaj Allianz", "IN"),
            ("Tata AIG", "IN"),
            ("LIC India", "IN"),
        ]

        provider_map = {}

        for name, country in providers_data:
            provider = db.query(Provider).filter_by(name=name).first()
            if not provider:
                provider = Provider(name=name, country=country)
                db.add(provider)
                db.flush()
            provider_map[name] = provider.id

        # ---------- POLICIES ----------
        policies = [

            # ================= HEALTH =================
            Policy(provider_id=provider_map["HDFC Ergo"], policy_type="health",
                   title="HDFC Health Suraksha Plus",
                   coverage="₹10 Lakhs hospitalization",
                   premium=12000, term_months=12, deductible=5000),

            Policy(provider_id=provider_map["Star Health"], policy_type="health",
                   title="Star Comprehensive Health",
                   coverage="₹15 Lakhs + maternity",
                   premium=15000, term_months=12, deductible=3000),

            Policy(provider_id=provider_map["ICICI Lombard"], policy_type="health",
                   title="ICICI Complete Health",
                   coverage="₹20 Lakhs + wellness benefits",
                   premium=18000, term_months=12, deductible=4000),

            Policy(provider_id=provider_map["HealthPlus Corp"], policy_type="health",
                   title="HealthPlus Family Care",
                   coverage="₹10 Lakhs family floater",
                   premium=14000, term_months=12, deductible=6000),

            Policy(provider_id=provider_map["Bajaj Allianz"], policy_type="health",
                   title="Bajaj Allianz Health Guard",
                   coverage="₹25 Lakhs + global cover",
                   premium=22000, term_months=12, deductible=5000),

            # ================= LIFE =================
            Policy(provider_id=provider_map["LIC India"], policy_type="life",
                   title="LIC Jeevan Anand",
                   coverage="₹50 Lakhs life cover",
                   premium=18000, term_months=300, deductible=0),

            Policy(provider_id=provider_map["HDFC Ergo"], policy_type="life",
                   title="HDFC Click 2 Protect",
                   coverage="₹1 Crore term insurance",
                   premium=15000, term_months=360, deductible=0),

            Policy(provider_id=provider_map["ICICI Lombard"], policy_type="life",
                   title="ICICI iProtect Smart",
                   coverage="₹1.2 Crore + accidental cover",
                   premium=17000, term_months=360, deductible=0),

            Policy(provider_id=provider_map["SecureLife Insurance"], policy_type="life",
                   title="SecureLife Family Shield",
                   coverage="₹75 Lakhs + child education rider",
                   premium=16000, term_months=300, deductible=0),

            # ================= AUTO =================
            Policy(provider_id=provider_map["Bajaj Allianz"], policy_type="auto",
                   title="Bajaj Allianz Motor Secure",
                   coverage="Comprehensive + zero depreciation",
                   premium=8000, term_months=12, deductible=2000),

            Policy(provider_id=provider_map["ICICI Lombard"], policy_type="auto",
                   title="ICICI Lombard Motor Shield",
                   coverage="Engine protect + roadside assist",
                   premium=9000, term_months=12, deductible=1500),

            Policy(provider_id=provider_map["Tata AIG"], policy_type="auto",
                   title="Tata AIG Auto Secure",
                   coverage="Key replacement + consumables",
                   premium=8500, term_months=12, deductible=1500),

            Policy(provider_id=provider_map["HDFC Ergo"], policy_type="auto",
                   title="HDFC ERGO Car Insurance",
                   coverage="Unlimited claims + towing",
                   premium=7500, term_months=12, deductible=2000),

            # ================= HOME =================
            Policy(provider_id=provider_map["HDFC Ergo"], policy_type="home",
                   title="HDFC Home Secure",
                   coverage="₹1 Crore structure + contents",
                   premium=9000, term_months=12, deductible=5000),

            Policy(provider_id=provider_map["ICICI Lombard"], policy_type="home",
                   title="ICICI Lombard Home Shield",
                   coverage="₹75 Lakhs fire + burglary",
                   premium=7500, term_months=12, deductible=4000),

            Policy(provider_id=provider_map["Bajaj Allianz"], policy_type="home",
                   title="Bajaj Allianz Home Guard",
                   coverage="₹50 Lakhs earthquake + flood",
                   premium=8000, term_months=12, deductible=3000),

            # ================= OTHER =================
            Policy(provider_id=provider_map["Tata AIG"], policy_type="other",
                   title="Tata AIG Travel Guard",
                   coverage="₹25 Lakhs international travel",
                   premium=5000, term_months=6, deductible=0),

            Policy(provider_id=provider_map["ICICI Lombard"], policy_type="other",
                   title="ICICI Student Travel Protect",
                   coverage="₹40 Lakhs overseas education",
                   premium=6500, term_months=12, deductible=0),

            Policy(provider_id=provider_map["HDFC Ergo"], policy_type="other",
                   title="HDFC Cyber Protect",
                   coverage="₹10 Lakhs cyber fraud",
                   premium=3000, term_months=12, deductible=0),
        ]

        # ---------- INSERT WITHOUT DUPLICATES ----------
        for policy in policies:
            exists = db.query(Policy).filter_by(
                title=policy.title,
                policy_type=policy.policy_type
            ).first()
            if not exists:
                db.add(policy)

        db.commit()

    finally:
        db.close()
