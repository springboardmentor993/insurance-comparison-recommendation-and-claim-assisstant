"""Verify that the migration worked and check user data"""
import psycopg2
from database import DATABASE_URL

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Check latest user with preferences
cur.execute("""
    SELECT id, name, email, dob, income, budget, preferred_policy_type 
    FROM users 
    ORDER BY id DESC 
    LIMIT 3
""")

print("📋 Latest users with preference fields:\n")
print(f"{'ID':<5} {'Name':<20} {'Email':<25} {'DOB':<12} {'Income':<10} {'Budget':<10} {'Pref Type':<12}")
print("-" * 110)

for row in cur.fetchall():
    user_id, name, email, dob, income, budget, pref_type = row
    dob_str = str(dob) if dob else 'NULL'
    income_str = str(income) if income else 'NULL'
    budget_str = str(budget) if budget else 'NULL'
    pref_str = pref_type if pref_type else 'NULL'
    
    print(f"{user_id:<5} {name:<20} {email:<25} {dob_str:<12} {income_str:<10} {budget_str:<10} {pref_str:<12}")

print("\n✅ Verification complete!")

cur.close()
conn.close()
