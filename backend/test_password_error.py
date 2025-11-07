#!/usr/bin/env python3
import requests
import json

# Test login with existing user but wrong password
url = "http://localhost:8000/api/v1/auth/login"
headers = {"Content-Type": "application/json"}

# First, let's register a test user
register_url = "http://localhost:8000/api/v1/auth/register"
test_user = {
    "email": "testmerchant@example.com",
    "password": "correctpassword123",
    "role": "merchant"
}

print("Registering test user...")
try:
    register_response = requests.post(register_url, headers=headers, data=json.dumps(test_user))
    print(f"Registration Status: {register_response.status_code}")
    if register_response.status_code == 200:
        print("✅ Test user registered successfully")
    else:
        print(f"Registration failed: {register_response.text}")
except Exception as e:
    print(f"Registration error: {e}")

print("\n--- Testing wrong password ---")
# Test with wrong password
wrong_password_data = {
    "email": "testmerchant@example.com",
    "password": "wrongpassword",
    "role": "merchant"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(wrong_password_data))
    print(f"Status Code: {response.status_code}")
    if response.status_code == 401:
        response_data = response.json()
        error_detail = response_data.get('detail', 'No detail')
        print(f"Error Detail: {error_detail}")
        if error_detail == "Wrong password":
            print("✅ Correct error message for wrong password!")
        else:
            print(f"❌ Expected 'Wrong password', got '{error_detail}'")
    else:
        print(f"Unexpected response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

print("\n--- Testing non-existent user ---")
# Test with non-existent user
non_existent_data = {
    "email": "nonexistent@example.com",
    "password": "test123",
    "role": "merchant"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(non_existent_data))
    print(f"Status Code: {response.status_code}")
    if response.status_code == 401:
        response_data = response.json()
        error_detail = response_data.get('detail', 'No detail')
        print(f"Error Detail: {error_detail}")
        if error_detail == "Login failed: Account does not exist":
            print("✅ Correct error message for non-existent account!")
        else:
            print(f"❌ Expected 'Login failed: Account does not exist', got '{error_detail}'")
    else:
        print(f"Unexpected response: {response.text}")
except Exception as e:
    print(f"Error: {e}")