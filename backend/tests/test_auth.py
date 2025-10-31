import pytest
from sqlalchemy.orm import Session

from app.services.auth import create_user
from app.schemas.user import UserCreate


def test_register_customer(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "customer@example.com",
        "password": "password123",
        "phone": "1234567890",
        "role": "customer"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_register_merchant(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "merchant@example.com",
        "password": "password123",
        "role": "merchant"
    })
    assert response.status_code == 200


def test_login(client):
    # First register
    client.post("/api/v1/auth/register", json={
        "email": "login@example.com",
        "password": "password123",
        "role": "customer"
    })
    # Then login
    response = client.post("/api/v1/auth/login", json={
        "email": "login@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={
        "email": "wrong@example.com",
        "password": "password123",
        "role": "customer"
    })
    response = client.post("/api/v1/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrongpass"
    })
    assert response.status_code == 401


def test_refresh_token(client):
    # Register and login
    client.post("/api/v1/auth/register", json={
        "email": "refresh@example.com",
        "password": "password123",
        "role": "customer"
    })
    login_response = client.post("/api/v1/auth/login", json={
        "email": "refresh@example.com",
        "password": "password123"
    })
    refresh_token = login_response.json()["refresh_token"]

    # Refresh
    response = client.post("/api/v1/auth/refresh", json={
        "refresh_token": refresh_token
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data