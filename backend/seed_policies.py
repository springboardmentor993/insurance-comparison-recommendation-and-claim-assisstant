from database import SessionLocal
import models

db = SessionLocal()

# get all providers + categories from DB
providers = db.query(models.Provider).all()
categories = db.query(models.Category).all()

if not providers or not categories:
    print("❌ Providers or Categories missing in DB")
    db.close()
    exit()

policy_count = 0

for category in categories:
    for i in range(25):   # 25 policies per category
        provider = providers[i % len(providers)]

        policy = models.Policy(
            title=f"{category.name} Plan {i+1}",
            premium=5000 + i * 500,
            term_months=12,
            provider_id=provider.id,
            category_id=category.id
        )

        db.add(policy)
        policy_count += 1

db.commit()
db.close()

print(f"✅ {policy_count} policies seeded successfully!")
