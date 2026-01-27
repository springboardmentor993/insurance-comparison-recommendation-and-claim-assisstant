"""Script to check PostgreSQL database connection and tables"""
import psycopg2
from database import DATABASE_URL

try:
    # Parse connection string
    # postgresql://postgres:jeshwanth72@localhost/insurance_db
    conn = psycopg2.connect(DATABASE_URL)
    print("✅ Database connection successful!")
    
    cur = conn.cursor()
    
    # Get all tables
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema='public'
        ORDER BY table_name
    """)
    tables = cur.fetchall()
    
    print(f"\n📊 Found {len(tables)} table(s):")
    for table in tables:
        table_name = table[0]
        # Get row count for each table
        cur.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cur.fetchone()[0]
        print(f"  - {table_name}: {count} row(s)")
    
    # Check if all required tables exist
    required_tables = ['users', 'providers', 'policies', 'risk_profiles', 'recommendations']
    existing_table_names = [t[0] for t in tables]
    
    print(f"\n🔍 Checking required tables:")
    for req_table in required_tables:
        if req_table in existing_table_names:
            print(f"  ✅ {req_table}")
        else:
            print(f"  ❌ {req_table} - MISSING")
    
    cur.close()
    conn.close()
    print("\n✅ Database check complete!")
    
except psycopg2.OperationalError as e:
    print(f"❌ Database connection failed: {e}")
    print("\nPossible issues:")
    print("  - PostgreSQL server is not running")
    print("  - Database 'insurance_db' doesn't exist")
    print("  - Wrong username/password")
    print("  - Connection string is incorrect")
except Exception as e:
    print(f"❌ Error: {e}")
