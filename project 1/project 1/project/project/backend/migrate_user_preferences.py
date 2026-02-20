"""
Migration script to add user preference fields to the users table.
Run this once to update your existing database schema.
"""
import psycopg2
from database import DATABASE_URL

def migrate():
    """Add income, budget, and preferred_policy_type columns to users table"""
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        print("🔄 Starting migration: Adding user preference columns...")
        
        # Check if columns already exist
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('income', 'budget', 'preferred_policy_type')
        """)
        existing_columns = [row[0] for row in cur.fetchall()]
        
        # Add income column if it doesn't exist
        if 'income' not in existing_columns:
            print("  ➕ Adding 'income' column...")
            cur.execute("""
                ALTER TABLE users 
                ADD COLUMN income INTEGER
            """)
            print("  ✅ Added 'income' column")
        else:
            print("  ⏭️  'income' column already exists")
        
        # Add budget column if it doesn't exist
        if 'budget' not in existing_columns:
            print("  ➕ Adding 'budget' column...")
            cur.execute("""
                ALTER TABLE users 
                ADD COLUMN budget INTEGER
            """)
            print("  ✅ Added 'budget' column")
        else:
            print("  ⏭️  'budget' column already exists")
        
        # Add preferred_policy_type column if it doesn't exist
        if 'preferred_policy_type' not in existing_columns:
            print("  ➕ Adding 'preferred_policy_type' column...")
            cur.execute("""
                ALTER TABLE users 
                ADD COLUMN preferred_policy_type VARCHAR
            """)
            print("  ✅ Added 'preferred_policy_type' column")
        else:
            print("  ⏭️  'preferred_policy_type' column already exists")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
        # Verify the changes
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('income', 'budget', 'preferred_policy_type')
            ORDER BY column_name
        """)
        
        print("\n📋 Verified new columns:")
        for row in cur.fetchall():
            print(f"  - {row[0]}: {row[1]}")
        
    except psycopg2.Error as e:
        conn.rollback()
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    migrate()
