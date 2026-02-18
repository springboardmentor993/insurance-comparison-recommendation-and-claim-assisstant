import requests

try:
    response = requests.post(
        "http://127.0.0.1:8003/auth/login",
        json={"email": "varun21@gmail.com", "password": "password123"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
