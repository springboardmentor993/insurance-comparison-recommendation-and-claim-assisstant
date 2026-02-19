import sys
from pathlib import Path
import requests

# Add parent directory to path to support imports if needed, though we'll use requests
sys.path.insert(0, str(Path(__file__).parent.parent))

BASE_URL = "http://127.0.0.1:8000"

def create_user(email, password, name, role="user"):
    print(f"Creating {role} user: {email}...")
    
    # 1. Register
    reg_data = {
        "email": email,
        "password": password,
        "name": name,
        "dob": "1990-01-01"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
        
        if response.status_code == 200:
            print("✅ Registration successful!")
        elif response.status_code == 400 and "already exists" in response.text:
            print("ℹ️  User already exists (skipping registration)")
        else:
            print(f"❌ Registration failed: {response.status_code} - {response.text}")
            return False

        # 2. Login just to check
        login_data = {
            "email": email,
            "password": password
        }
        res = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if res.status_code == 200:
            print("✅ Login successful! Token received.")
            
            # If admin, we need to update the role manually in DB since register endpoint likely defaults to 'user'
            # Note: The register endpoint in auth.py DOES NOT allow setting role (for security).
            # So we would need to update it via SQL.
            if role == "admin":
                print("⚠️  Note: You must manually update this user's role to 'admin' in the database if the register endpoint doesn't support it.")
                
        else:
            print(f"❌ Login failed: {res.status_code} - {res.text}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False
        
    return True

if __name__ == "__main__":
    print(f"Testing Auth with Backend at {BASE_URL}")
    create_user("user@example.com", "password123", "Test User")
    print("-" * 30)
    create_user("admin@example.com", "admin123", "Admin User", role="admin")
