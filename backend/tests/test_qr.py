import pytest
from uuid import uuid4

from app.services.auth import create_user
from app.services.merchant import create_merchant, create_location
from app.services.loyalty_program import create_loyalty_program
from app.schemas.user import UserCreate
from app.schemas.merchant import MerchantCreate
from app.schemas.location import LocationCreate
from app.schemas.loyalty_program import LoyaltyProgramCreate


@pytest.fixture
def merchant_token(client, db):
    import uuid
    email = f"merchant{uuid.uuid4().hex[:8]}@test.com"
    # Create merchant user
    merchant_user = create_user(db, UserCreate(email=email, password="pass", role="merchant"))
    # Create merchant
    merchant = create_merchant(db, MerchantCreate(display_name="Test Merchant"), owner_user_id=merchant_user.id)
    # Create location
    location = create_location(db, LocationCreate(name="Main Location", address="123 Main St", lat=40.0, lng=-74.0), merchant_id=merchant.id)
    # Create program
    program = create_loyalty_program(db, LoyaltyProgramCreate(name="Test Program", description="Test", logic_type="punch_card", earn_rule={"stamps_per_purchase": 1}, redeem_rule={"stamps_needed": 10}), merchant_id=merchant.id)

    # Login
    response = client.post("/api/v1/auth/login-or-register", json={"email": email, "password": "pass", "role": "merchant"})
    token = response.json()["access_token"]
    return {"token": token, "location_id": location.id, "program_id": program.id}


@pytest.fixture
def customer_token(client, db):
    import uuid
    email = f"customer{uuid.uuid4().hex[:8]}@test.com"
    # Create customer
    create_user(db, UserCreate(email=email, password="pass", role="customer"))
    # Login
    response = client.post("/api/v1/auth/login-or-register", json={"email": email, "password": "pass"})
    token = response.json()["access_token"]
    return token


def test_issue_join_qr(client, merchant_token):
    headers = {"Authorization": f"Bearer {merchant_token['token']}"}
    response = client.post("/api/v1/qr/issue-join", json={"program_id": str(merchant_token['program_id'])}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "token" in data


def test_issue_stamp_qr(client, merchant_token):
    headers = {"Authorization": f"Bearer {merchant_token['token']}"}
    response = client.post("/api/v1/qr/issue-stamp", json={"program_id": str(merchant_token['program_id']), "purchase_total": 10.0}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "token" in data


def test_issue_redeem_qr(client, merchant_token):
    headers = {"Authorization": f"Bearer {merchant_token['token']}"}
    response = client.post("/api/v1/qr/issue-redeem", json={"program_id": str(merchant_token['program_id']), "amount": 5}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "token" in data


def test_scan_join(client, merchant_token, customer_token):
    # Issue join QR
    headers_merchant = {"Authorization": f"Bearer {merchant_token['token']}"}
    issue_response = client.post("/api/v1/qr/issue-join", json={"program_id": str(merchant_token['program_id'])}, headers=headers_merchant)
    qr_token = issue_response.json()["token"]

    # Scan as customer
    headers_customer = {"Authorization": f"Bearer {customer_token}"}
    response = client.post("/api/v1/qr/scan-join", json={"token": qr_token, "lat": 40.0, "lng": -74.0}, headers=headers_customer)
    assert response.status_code == 200
    data = response.json()
    assert "membership_id" in data


def test_scan_stamp(client, merchant_token, customer_token):
    # First join
    headers_merchant = {"Authorization": f"Bearer {merchant_token['token']}"}
    join_issue = client.post("/api/v1/qr/issue-join", json={"program_id": str(merchant_token['program_id'])}, headers=headers_merchant)
    join_token = join_issue.json()["token"]
    headers_customer = {"Authorization": f"Bearer {customer_token}"}
    client.post("/api/v1/qr/scan-join", json={"token": join_token, "lat": 40.0, "lng": -74.0}, headers=headers_customer)

    # Issue stamp
    stamp_issue = client.post("/api/v1/qr/issue-stamp", json={"program_id": str(merchant_token['program_id']), "purchase_total": 10.0}, headers=headers_merchant)
    stamp_token = stamp_issue.json()["token"]

    # Scan stamp
    response = client.post("/api/v1/qr/scan-stamp", json={"token": stamp_token, "lat": 40.0, "lng": -74.0}, headers=headers_customer)
    assert response.status_code == 200
    data = response.json()
    assert "new_balance" in data
    assert data["new_balance"] == 1


def test_scan_redeem(client, merchant_token, customer_token):
    # Join and earn stamps
    headers_merchant = {"Authorization": f"Bearer {merchant_token['token']}"}
    join_issue = client.post("/api/v1/qr/issue-join", json={"program_id": str(merchant_token['program_id'])}, headers=headers_merchant)
    join_token = join_issue.json()["token"]
    headers_customer = {"Authorization": f"Bearer {customer_token}"}
    client.post("/api/v1/qr/scan-join", json={"token": join_token, "lat": 40.0, "lng": -74.0}, headers=headers_customer)

    for _ in range(5):
        stamp_issue = client.post("/api/v1/qr/issue-stamp", json={"program_id": str(merchant_token['program_id']), "purchase_total": 10.0}, headers=headers_merchant)
        stamp_token = stamp_issue.json()["token"]
        client.post("/api/v1/qr/scan-stamp", json={"token": stamp_token, "lat": 40.0, "lng": -74.0}, headers=headers_customer)

    # Issue redeem
    redeem_issue = client.post("/api/v1/qr/issue-redeem", json={"program_id": str(merchant_token['program_id']), "amount": 3}, headers=headers_merchant)
    redeem_token = redeem_issue.json()["token"]

    # Scan redeem
    response = client.post("/api/v1/qr/scan-redeem", json={"token": redeem_token, "lat": 40.0, "lng": -74.0}, headers=headers_customer)
    assert response.status_code == 200
    data = response.json()
    assert data["new_balance"] == 2


def test_double_spend_prevention(client, merchant_token, customer_token):
    # Issue join QR
    headers_merchant = {"Authorization": f"Bearer {merchant_token['token']}"}
    issue_response = client.post("/api/v1/qr/issue-join", json={"program_id": str(merchant_token['program_id'])}, headers=headers_merchant)
    qr_token = issue_response.json()["token"]

    # Scan first time
    headers_customer = {"Authorization": f"Bearer {customer_token}"}
    response1 = client.post("/api/v1/qr/scan-join", json={"token": qr_token, "lat": 40.0, "lng": -74.0}, headers=headers_customer)
    assert response1.status_code == 200

    # Scan second time - should fail due to nonce check
    response2 = client.post("/api/v1/qr/scan-join", json={"token": qr_token, "lat": 40.0, "lng": -74.0}, headers=headers_customer)
    assert response2.status_code == 400


def test_geofence_check(client, merchant_token, customer_token):
    # Issue join QR
    headers_merchant = {"Authorization": f"Bearer {merchant_token['token']}"}
    issue_response = client.post("/api/v1/qr/issue-join", json={"program_id": str(merchant_token['program_id'])}, headers=headers_merchant)
    qr_token = issue_response.json()["token"]

    # Scan with far location
    headers_customer = {"Authorization": f"Bearer {customer_token}"}
    response = client.post("/api/v1/qr/scan-join", json={"token": qr_token, "lat": 50.0, "lng": -80.0}, headers=headers_customer)
    assert response.status_code == 400
    assert "not near" in response.json()["detail"].lower()


def test_universal_scan(client, merchant_token, customer_token):
    # Test join
    headers_merchant = {"Authorization": f"Bearer {merchant_token['token']}"}
    join_issue = client.post("/api/v1/qr/issue-join", json={"program_id": str(merchant_token['program_id'])}, headers=headers_merchant)
    assert join_issue.status_code == 200, f"Join issue failed: {join_issue.text}"
    join_token = join_issue.json()["token"]
    headers_customer = {"Authorization": f"Bearer {customer_token}"}
    response = client.post("/api/v1/qr/scan", json={"token": join_token, "lat": 40.0, "lng": -74.0}, headers=headers_customer)
    assert response.status_code == 200
    assert "membership_id" in response.json()

    # Test stamp
    stamp_issue = client.post("/api/v1/qr/issue-stamp", json={"program_id": str(merchant_token['program_id']), "purchase_total": 10.0}, headers=headers_merchant)
    stamp_token = stamp_issue.json()["token"]
    response = client.post("/api/v1/qr/scan", json={"token": stamp_token, "lat": 40.0, "lng": -74.0}, headers=headers_customer)
    assert response.status_code == 200
    assert "new_balance" in response.json()


def test_redeem_points_program(client, db):
    # Create points program
    from app.services.auth import create_user
    from app.services.merchant import create_merchant
    from app.services.loyalty_program import create_loyalty_program
    from app.services.membership import create_membership
    from app.schemas.user import UserCreate
    from app.schemas.merchant import MerchantCreate
    from app.schemas.loyalty_program import LoyaltyProgramCreate
    from app.schemas.customer_program_membership import CustomerProgramMembershipCreate

    # Create merchant
    merchant_user = create_user(db, UserCreate(email="merchant@test.com", password="pass", role="merchant"))
    merchant = create_merchant(db, MerchantCreate(display_name="Test Merchant"), owner_user_id=merchant_user.id)
    program = create_loyalty_program(db, LoyaltyProgramCreate(
        name="Points Program",
        description="Test points",
        logic_type="points",
        earn_rule={"points_per_dollar": 1},
        redeem_rule={"points_needed": 100}
    ), merchant_id=merchant.id)

    # Create customer
    customer_user = create_user(db, UserCreate(email="customer@test.com", password="pass", role="customer"))
    membership = create_membership(db, CustomerProgramMembershipCreate(
        customer_user_id=customer_user.id,
        program_id=program.id,
        merchant_id=merchant.id,
        current_balance=50
    ))

    # Login customer
    response = client.post("/api/v1/auth/login-or-register", json={"email": "customer@test.com", "password": "pass"})
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Try to redeem more than balance - should fail
    response = client.post(f"/api/v1/programs/{program.id}/redeem", json={"amount": 60}, headers=headers)
    assert response.status_code == 400

    # Redeem partial - should work
    response = client.post(f"/api/v1/programs/{program.id}/redeem", json={"amount": 25}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "code" in data
    assert data["amount"] == "25"

    # Check balance updated
    db.refresh(membership)  # Refresh the membership object
    assert membership.current_balance == 25


def test_redeem_punch_card_program(client, db):
    # Create punch card program
    from app.services.auth import create_user
    from app.services.merchant import create_merchant
    from app.services.loyalty_program import create_loyalty_program
    from app.services.membership import create_membership
    from app.schemas.user import UserCreate
    from app.schemas.merchant import MerchantCreate
    from app.schemas.loyalty_program import LoyaltyProgramCreate
    from app.schemas.customer_program_membership import CustomerProgramMembershipCreate

    # Create merchant
    merchant_user = create_user(db, UserCreate(email="merchant2@test.com", password="pass", role="merchant"))
    merchant = create_merchant(db, MerchantCreate(display_name="Test Merchant 2"), owner_user_id=merchant_user.id)
    program = create_loyalty_program(db, LoyaltyProgramCreate(
        name="Punch Card Program",
        description="Test punch card",
        logic_type="punch_card",
        earn_rule={"stamps_per_purchase": 1},
        redeem_rule={"stamps_needed": 10}
    ), merchant_id=merchant.id)

    # Create customer
    customer_user = create_user(db, UserCreate(email="customer2@test.com", password="pass", role="customer"))
    membership = create_membership(db, CustomerProgramMembershipCreate(
        customer_user_id=customer_user.id,
        program_id=program.id,
        merchant_id=merchant.id,
        current_balance=10
    ))

    # Login customer
    response = client.post("/api/v1/auth/login-or-register", json={"email": "customer2@test.com", "password": "pass"})
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Try to redeem partial - should fail
    response = client.post(f"/api/v1/programs/{program.id}/redeem", json={"amount": 5}, headers=headers)
    assert response.status_code == 400

    # Redeem full amount - should work
    response = client.post(f"/api/v1/programs/{program.id}/redeem", json={"amount": 10}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "code" in data
    assert data["amount"] == "10"
