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
    "role": "customer"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(test_data))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code == 401:
        response_data = response.json()
        print(f"Error Detail: {response_data.get('detail', 'No detail')}")
except Exception as e:
    print(f"Error: {e}")