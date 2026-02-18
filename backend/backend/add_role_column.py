from sqlalchemy import text
from database import engine

def add_role_column():
    with engine.connect() as conn:
        try:
            # Check if column exists
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='role'"))
            if result.fetchone():
                print("Column 'role' already exists.")
            else:
                print("Adding 'role' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user'"))
                conn.commit()
                print("✅ Column 'role' added successfully.")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    add_role_column()
