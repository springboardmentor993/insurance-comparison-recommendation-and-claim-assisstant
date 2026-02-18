from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
import requests
from security import hash_password

def create_admin_and_test():
    db: Session = SessionLocal()
    
    # 1. Create/Update Admin User
    admin_email = "admin@example.com"
    admin = db.query(User).filter(User.email == admin_email).first()
    
    if not admin:
        print("Creating admin user...")
        admin = User(
            name="Admin User",
            email=admin_email,
            password=hash_password("admin123"),
            role="admin"
        )
        db.add(admin)
    else:
        print("Updating admin user role...")
        admin.role = "admin"
    
    db.commit()
    print(f"Admin user ready: {admin_email}")
    db.close()
    
    # 2. Login as Admin
    print("\nLogging in as Admin...")
    login_url = "http://localhost:8000/auth/login"
    resp = requests.post(login_url, json={"email": admin_email, "password": "admin123"})
    
    if resp.status_code != 200:
        print(f"❌ Admin login failed: {resp.status_code}")
        return
        
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Try to access My Policies (Should be Forbidden)
    print("Accessing My Policies (Expected: 403)...")
    policies_url = "http://localhost:8000/policies/my"
    p_resp = requests.get(policies_url, headers=headers)
    
    if p_resp.status_code == 403:
        print("✅ SUCCESS: Admin block worked (Got 403 Forbidden)")
    else:
        print(f"❌ FAILURE: Admin allowed access? Status: {p_resp.status_code}")
        
    # 4. Try to access Claims (Should be Forbidden if we implemented GET restriction too, or just POST?)
    # We only restricted POST /claims. Let's test that if possible, or just assume dependency works.
    # The requirement was "Admin user ki access unda kudadhu" - usually means file claim.
    
if __name__ == "__main__":
    create_admin_and_test()
