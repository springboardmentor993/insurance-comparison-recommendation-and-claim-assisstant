
import psycopg2

def update_enum():
    # Hardcoded connection details for local development
    # Based on docker-compose.yml: postgres:password@localhost:5432/insurance_db
    # Note: When running from host machine, use localhost
    
    dbname = "insurance_db"
    user = "postgres"
    password = "password"
    host = "localhost"
    port = "5432"
    
    try:
        conn = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Attempting to add 'home' and 'travel' to policytype enum...")
        
        try:
            cur.execute("ALTER TYPE policytype ADD VALUE IF NOT EXISTS 'home'")
            print("Added 'home'")
        except Exception as e:
            print(f"Home might exist or error: {e}")
            
        try:
            cur.execute("ALTER TYPE policytype ADD VALUE IF NOT EXISTS 'travel'")
            print("Added 'travel'")
        except Exception as e:
            print(f"Travel might exist or error: {e}")
            
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_enum()
