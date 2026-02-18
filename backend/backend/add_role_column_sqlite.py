import sqlite3

def add_role_column_sqlite():
    db_path = "insurenz.db"
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "role" in columns:
            print("Column 'role' already exists in SQLite DB.")
        else:
            print("Adding 'role' column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user' NOT NULL")
            conn.commit()
            print("✅ Column 'role' added successfully.")
            
        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    add_role_column_sqlite()
