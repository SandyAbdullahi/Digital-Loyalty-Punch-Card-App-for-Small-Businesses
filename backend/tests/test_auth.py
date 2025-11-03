import pytest
from sqlalchemy.orm import Session

from app.services.auth import create_user
from app.schemas.user import UserCreate


def test_routes(client):
    from app.main import app
    routes = [route.path for route in app.routes if hasattr(route, 'path')]
    print("Routes:", routes)
    assert "/api/v1/auth/login-or-register" in routes


def test_register_customer(client):
    response = client.post("/api/v1/auth/login-or-register", json={
        "email": "customer@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_register_merchant(client):
    response = client.post("/api/v1/auth/login-or-register", json={
        "email": "merchant@example.com",
        "password": "password123"
    })
    assert response.status_code == 200


def test_login(client):
    # First register
    client.post("/api/v1/auth/login-or-register", json={
        "email": "login@example.com",
        "password": "password123"
    })
    # Then login (same endpoint)
    response = client.post("/api/v1/auth/login-or-register", json={
        "email": "login@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_login_wrong_password(client):
    client.post("/api/v1/auth/login-or-register", json={
        "email": "wrong@example.com",
        "password": "password123"
    })
    response = client.post("/api/v1/auth/login-or-register", json={
        "email": "wrong@example.com",
        "password": "wrongpass"
    })
    assert response.status_code == 400


def test_update_profile(client):
    # Register and login
    response = client.post("/api/v1/auth/login-or-register", json={
        "email": "profile@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    token = data["access_token"]
    
    # Update profile
    response = client.put("/api/v1/customer/profile", 
        json={
            "email": "profile@example.com",
            "name": "Updated Name",
            "avatar_url": "https://example.com/avatar.png",
            "role": "customer"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    updated_user = response.json()
    assert updated_user["name"] == "Updated Name"
    assert updated_user["avatar_url"] == "https://example.com/avatar.png"