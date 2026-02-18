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
    return policies[0]['id'], policies[0]['start_date']

def test_high_amount(headers, policy_id):
    print("\n--- Testing High Amount Fraud ---")
    files = {'files': ('high_amount.pdf', b'dummy content for fraud test', 'application/pdf')}
    data = {
        "user_policy_id": policy_id,
        "claim_type": "Fraud Test High Amount",
        "incident_date": "2024-01-01",
        "description": "High amount claim",
        "claim_amount": 15000.00
    }
    resp = requests.post(f"{BASE_URL}/claims", headers=headers, data=data, files=files)
    if resp.status_code != 200:
        print(f"Failed: {resp.text}")
        return None, None
    
    claim = resp.json()
    flags = claim.get('fraud_flags', [])
    print(f"Claim ID: {claim['id']}, Amount: {claim['claim_amount']}")
    print(f"Flags found: {len(flags)}")
    for f in flags:
        print(f" - {f['flag_reason']}: {f['flag_details']}")
        
    if any(f['flag_reason'] == "High Amount" for f in flags):
        print("✅ High Amount Flag DETECTED")
    else:
        print("❌ High Amount Flag MISSED")
    
    if claim['documents']:
        return claim['documents'][0]['file_name'], claim['documents'][0]['file_size']
    return None, None

def test_duplicate_document(headers, policy_id, filename, filesize):
    if not filename:
        print("Skipping duplicate test due to previous failure")
        return

    print("\n--- Testing Duplicate Document Fraud ---")
    # Upload same file content/name
    
    files = {'files': (filename, b'dummy content for fraud test', 'application/pdf')}
    data = {
        "user_policy_id": policy_id,
        "claim_type": "Fraud Test Duplicate",
        "incident_date": "2024-01-02",
        "description": "Duplicate doc claim",
        "claim_amount": 500.00
    }
    
    resp = requests.post(f"{BASE_URL}/claims", headers=headers, data=data, files=files)
    if resp.status_code != 200:
        print(f"Failed: {resp.text}")
        return
        
    claim = resp.json()
    flags = claim.get('fraud_flags', [])
    
    print(f"Claim ID: {claim['id']}")
    for f in flags:
        print(f" - {f['flag_reason']}: {f['flag_details']}")
        
    if any(f['flag_reason'] == "Duplicate Document" for f in flags):
        print("✅ Duplicate Document Flag DETECTED")
    else:
        print("❌ Duplicate Document Flag MISSED")

def test_suspicious_timing(headers, policy_id, start_date):
    print("\n--- Testing Suspicious Timing Fraud ---")
    # Incident date = start_date
    
    files = {'files': ('timing_test.pdf', b'dummy content for timing test', 'application/pdf')}
    data = {
        "user_policy_id": policy_id,
        "claim_type": "Fraud Test Timing",
        "incident_date": start_date, # Claim happened on policy start date!
        "description": "Suspicious timing claim",
        "claim_amount": 100.00
    }
    
    resp = requests.post(f"{BASE_URL}/claims", headers=headers, data=data, files=files)
    if resp.status_code != 200:
        print(f"Failed: {resp.text}")
        return
        
    claim = resp.json()
    flags = claim.get('fraud_flags', [])
    
    print(f"Claim ID: {claim['id']}")
    for f in flags:
        print(f" - {f['flag_reason']}: {f['flag_details']}")
        
    if any(f['flag_reason'] == "Suspicious Timing" for f in flags):
        print("✅ Suspicious Timing Flag DETECTED")
    else:
        print("❌ Suspicious Timing Flag MISSED")

def main():
    token = login()
    if not token: exit(1)
    headers = {"Authorization": f"Bearer {token}"}
    
    policy_id, start_date = get_policy(headers)
    if not policy_id: exit(1)
    
    filename, size = test_high_amount(headers, policy_id)
    test_duplicate_document(headers, policy_id, filename, size)
    test_suspicious_timing(headers, policy_id, start_date)

if __name__ == "__main__":
    main()
