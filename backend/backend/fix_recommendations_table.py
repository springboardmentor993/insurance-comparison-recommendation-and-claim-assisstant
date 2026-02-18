"""
Fix recommendations table in PostgreSQL database.
Adds missing columns if needed.
"""
import psycopg2

def fix_recommendations_table():
    """Add missing columns to recommendations table."""
    conn = psycopg2.connect(
        host="localhost",
        database="insurance",
        user="postgres",
        password="varun_2117"
    )
    
    try:
        cursor = conn.cursor()
        
        # Check if table exists and add missing columns
        sql = """
        -- Create the recommendations table if it doesn't exist
        CREATE TABLE IF NOT EXISTS recommendations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            policy_id INTEGER NOT NULL REFERENCES policies(id),
            score NUMERIC NOT NULL,
            reasons JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE
        );
        
        -- Check and add missing columns
        DO $$ 
        BEGIN
            -- Add reasons column if missing
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='recommendations' AND column_name='reasons'
            ) THEN
                ALTER TABLE recommendations ADD COLUMN reasons JSONB;
                RAISE NOTICE 'Added reasons column';
            END IF;
            
            -- Add updated_at column if missing
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='recommendations' AND column_name='updated_at'
            ) THEN
                ALTER TABLE recommendations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
                RAISE NOTICE 'Added updated_at column';
            END IF;
        END $$;
        """
        
        cursor.execute(sql)
        conn.commit()
        
        print("✅ Recommendations table fixed successfully!")
        print("   - Table exists with all required columns")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    fix_recommendations_table()
