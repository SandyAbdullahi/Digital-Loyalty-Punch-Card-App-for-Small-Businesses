import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.models.merchant import Merchant
from app.models.merchant_settings import MerchantSettings
from app.models.user import User, UserRole


def _create_user(db: Session, email: str, role: UserRole) -> User:
    user = User(
        id=uuid.uuid4(),
        email=email,
        password_hash="hash",
        role=role,
    )
    db.add(user)
    db.commit()
    return user


def _create_merchant(db: Session, owner: User) -> Merchant:
    merchant = Merchant(
        id=uuid.uuid4(),
        owner_user_id=owner.id,
        display_name="Analytics Demo Merchant",
        legal_name="Analytics Demo Merchant LLC",
    )
    db.add(merchant)
    db.commit()
    return merchant


def test_merchant_analytics_endpoint_returns_data(client: TestClient, db: Session):
    owner = _create_user(db, "owner-api@test.com", UserRole.MERCHANT)
    merchant = _create_merchant(db, owner)
    settings = MerchantSettings(
        merchant_id=merchant.id,
        avg_spend_per_visit_kes=250,
        baseline_visits_per_customer_per_period=1,
        avg_reward_cost_kes=50,
    )
    db.add(settings)
    db.commit()

    token = create_access_token(subject=owner.email)
    response = client.get(
        f"/api/v1/merchants/{merchant.id}/analytics?period=this_month",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["merchantId"] == str(merchant.id)
    assert "revenueEstimation" in payload
    assert "kpis" in payload


def test_merchant_analytics_forbidden_for_non_owner(client: TestClient, db: Session):
    owner = _create_user(db, "owner-api2@test.com", UserRole.MERCHANT)
    other_user = _create_user(db, "intruder@test.com", UserRole.MERCHANT)
    merchant = _create_merchant(db, owner)
    token = create_access_token(subject=other_user.email)

    response = client.get(
        f"/api/v1/merchants/{merchant.id}/analytics?period=this_month",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
