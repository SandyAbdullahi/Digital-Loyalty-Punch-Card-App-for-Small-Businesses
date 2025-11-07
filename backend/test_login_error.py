#!/usr/bin/env python3
import requests
import json

# Test login with non-existent user
url = "http://localhost:8000/api/v1/auth/login"
headers = {"Content-Type": "application/json"}

# Test data for non-existent user
test_data = {
    "email": "nonexistent@example.com",
    "password": "test123",
    "role": "merchant"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(test_data))
    print(f"Status Code: {response.status_code}")
    if response.status_code == 401:
        response_data = response.json()
        print(f"Error Detail: {response_data.get('detail', 'No detail')}")
        print("✅ Correct error message for non-existent account!")
    else:
        print(f"Unexpected response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

# Test with existing user but wrong password
print("\n--- Testing wrong password ---")
test_data_wrong_pass = {
    "email": "test@example.com",  # Assuming this user exists
    "password": "wrongpassword",
    "role": "merchant"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(test_data_wrong_pass))
    print(f"Status Code: {response.status_code}")
    if response.status_code == 401:
        response_data = response.json()
        print(f"Error Detail: {response_data.get('detail', 'No detail')}")
        print("✅ Correct error message for wrong password!")
    else:
        print(f"Unexpected response: {response.text}")
except Exception as e:
    print(f"Error: {e}")