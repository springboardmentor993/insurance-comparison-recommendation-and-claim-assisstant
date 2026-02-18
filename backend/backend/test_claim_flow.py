import requests
import json
import os

BASE_URL = "http://localhost:8000"
USER_EMAIL = "varun21@gmail.com"
USER_PASS = "password123"

def login():
    print(f"Logging in as {USER_EMAIL}...")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": USER_EMAIL,
        "password": USER_PASS
    })
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return None
    return resp.json()["access_token"]

def get_policy(headers):
    print("Getting user policies...")
    resp = requests.get(f"{BASE_URL}/policies/my", headers=headers)
    if resp.status_code != 200:
        print(f"Failed to get policies: {resp.text}")
        return None
    policies = resp.json()
    if not policies:
        print("No policies found for user.")
        return None
    print(f"Found {len(policies)} policies. Using first one ID: {policies[0]['id']}")
    return policies[0]['id']

def create_claim(headers, policy_id):
    print("Creating a new claim...")
    # Create dummy file
    with open("test_history.pdf", "w") as f:
        f.write("Dummy PDF content for history verification")
        
    files = {
        'files': ('test_history.pdf', open('test_history.pdf', 'rb'), 'application/pdf')
    }
    data = {
        "user_policy_id": policy_id,
        "claim_type": "Medical Logic Test",
        "incident_date": "2024-01-01",
        "description": "Testing history tracking",
        "claim_amount": 1200.00
    }
    
    resp = requests.post(f"{BASE_URL}/claims", headers=headers, data=data, files=files)
    if resp.status_code != 200:
        print(f"Claim creation failed: {resp.text}")
        return None
    
    claim = resp.json()
    print(f"Claim created. ID: {claim['id']}, Number: {claim['claim_number']}")
    
    # Check history
    if 'history' in claim and len(claim['history']) > 0:
        print("✅ History present in create response.")
        print(f"Initial History: {claim['history'][0]['status']} - {claim['history'][0]['notes']}")
    else:
        print("❌ History MISSING in create response.")
        
    return claim['id']

def update_status(headers, claim_id):
    print(f"Updating status for claim {claim_id}...")
    data = {
        "status": "under_review",
        "status_notes": "We are reviewing your docs."
    }
    resp = requests.patch(f"{BASE_URL}/claims/{claim_id}/status", headers=headers, json=data)
    
    if resp.status_code != 200:
        print(f"Status update failed: {resp.text}")
        return
    
    updated_claim = resp.json()
    print(f"Status updated to: {updated_claim['status']}")
    
    # Check history
    history = updated_claim.get('history', [])
    print(f"History length: {len(history)}")
    for h in history:
        print(f" - {h['created_at']}: {h['status']} ({h['notes']})")
        
    if len(history) >= 2:
        print("✅ History correctly recorded 2 entries.")
    else:
        print("❌ History entries count mismatch (expected >= 2).")

def main():
    token = login()
    if not token: exit(1)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    policy_id = get_policy(headers)
    if not policy_id: exit(1)
    
    claim_id = create_claim(headers, policy_id)
    if not claim_id: exit(1)
    
    update_status(headers, claim_id)
    
    print("\nTest Complete.")

if __name__ == "__main__":
    main()
