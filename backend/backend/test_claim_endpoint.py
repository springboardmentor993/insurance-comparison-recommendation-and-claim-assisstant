import requests
import json
from datetime import date

BASE_URL = "http://localhost:8000"

def test_create_claim():
    # 1. Login
    print("Logging in...")
    login_data = {
        "username": "varun21@gmail.com", # OAuth2 matches form data username/password
        "password": "password123" 
    }
    # Note: backend auth expects form data for OAuth2PasswordRequestForm usually, 
    # but let's check auth route. 
    # Usually fastAPI OAuth2PasswordRequestForm expects form data.
    
    # Let's try standard login expecting JSON if that's how it's built, 
    # OR form data. Config usually uses /auth/login.
    
    # Based on schemas, UserLogin is a pydantic model, so it likely expects JSON at /auth/login.
    login_payload = {
        "email": "varun21@gmail.com",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return

    token = response.json()["access_token"]
    print(f"Got token: {token[:10]}...")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }

    # 2. Get User Policies to find a valid policy ID
    print("Fetching user policies...")
    resp = requests.get(f"{BASE_URL}/policies/my", headers=headers)
    if resp.status_code != 200:
        print(f"Failed to get policies: {resp.text}")
        return
        
    # policies = resp.json()
    # if not policies:
    #     print("No policies found for user.")
    #     return
        
    policy_id = 1
    # print(f"Using Policy ID: {policy_id}")

    # 3. Create Claim
    print("Submitting claim...")
    
    # Create a dummy file
    with open("test_claim_doc.pdf", "w") as f:
        f.write("This is a supporting document content that pretends to be a PDF.")
        
    files = {
        'files': ('test_claim_doc.pdf', open('test_claim_doc.pdf', 'rb'), 'application/pdf')
    }
    
    data = {
        "user_policy_id": policy_id,
        "claim_type": "Metting Accident",
        "incident_date": str(date.today()),
        "description": "Test claim via script",
        "claim_amount": 5000.00
    }
    
    print(f"Sending request to {BASE_URL}/claims/ ...")
    resp = requests.post(f"{BASE_URL}/claims/", headers=headers, data=data, files=files)
    print("Request sent.")
    
    print(f"Status Code: {resp.status_code}")
    print(f"Response: {resp.text}")
    print("Test finished.")

if __name__ == "__main__":
    test_create_claim()
