import requests
import json

BASE_URL = "http://localhost:8000"

def test_categorized_recommendations():
    print("Testing Categorized Recommendations API...")
    
    print("Fetching OpenAPI schema to debug routes...")
    try:
        schema = requests.get(f"{BASE_URL}/openapi.json")
        if schema.status_code == 200:
            paths = schema.json().get("paths", {}).keys()
            print("Available Paths:")
            for p in paths:
                if "auth" in p:
                    print(f"  {p}")
        else:
            print(f"Could not fetch schema: {schema.status_code}")
    except Exception as e:
        print(f"Schema fetch failed: {e}")

    import time
    unique_email = f"test_cat_{int(time.time())}@example.com"
    
    # 1. Register & Login
    print(f"Registering new user {unique_email}...")
    reg_data = {
        "email": unique_email,
        "password": "password123",
        "name": "Test User",
        "dob": "1990-01-01",
        "risk_profile": {
            "age": 30,
            "income": 50000,
            "dependents": 2,
            "risk_tolerance": "medium",
            "insurance_type": "health", 
            "budget": "medium",
            "priority": "balanced",
            "coverage_amount": 500000
        }
    }
    
    try:
        reg_resp = requests.post(f"{BASE_URL}/api/v1/auth/register", json=reg_data)
        if reg_resp.status_code not in [200, 201]:
             print(f"Registration failed: {reg_resp.text}")
             return

        print("Logging in...")
        login_data = {
            "email": unique_email,
            "password": "password123"
        }
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
            
        if response.status_code != 200:
            print(f"Authentication failed: {response.text}")
            return

        token = response.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Force Regenerate to ensure we get new logic
        print("Regenerating recommendations...")
        response = requests.post(f"{BASE_URL}/api/v1/recommendations/regenerate", headers=headers)
        if response.status_code != 200:
            print(f"Regeneration failed: {response.text}")
            return
            
        recommendations = response.json()
        print(f"Received {len(recommendations)} recommendations.")
        
        # 3. Analyze Types
        types_found = set()
        for rec in recommendations:
            policy = rec.get("policy", {})
            p_type = policy.get("policy_type")
            if p_type:
                types_found.add(p_type)
        
        print(f"Policy Types Found: {types_found}")
        
        expected_types = {"health", "life", "auto", "home", "travel"}
        missing = expected_types - set(t.lower() for t in types_found)
        
        # We want to see at least 2 distinct types to verify categorization logic
        if len(types_found) > 1:
            print("SUCCESS: Multiple policy types returned.")
            if not missing:
                 print("PERFECT: All expected types returned.")
            else:
                 print(f"Note: Missing types {missing}, but that might be due to valid scoring/limits.")
        else:
            print("FAILURE: Only one policy type returned. Logic not working.")
            
    except Exception as e:
        print(f"Test failed with exception: {e}")

if __name__ == "__main__":
    test_categorized_recommendations()
