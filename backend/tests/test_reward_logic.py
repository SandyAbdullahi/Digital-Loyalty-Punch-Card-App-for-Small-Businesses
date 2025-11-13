import uuid
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.models.reward import Reward, RewardStatus
from app.schemas.location import LocationCreate
from app.schemas.loyalty_program import LoyaltyProgramCreate
from app.schemas.merchant import MerchantCreate
from app.schemas.user import UserCreate
from app.services.auth import create_user
from app.services.loyalty_program import create_loyalty_program
from app.services.merchant import create_location, create_merchant


@pytest.fixture
def reward_env(db):
    merchant_email = f"merchant_{uuid.uuid4().hex[:6]}@test.com"
    customer_email = f"customer_{uuid.uuid4().hex[:6]}@test.com"

    merchant_user = create_user(
        db,
        UserCreate(
            email=merchant_email,
            password="pass",
            role="merchant",
        ),
    )
    customer_user = create_user(
        db,
        UserCreate(
            email=customer_email,
            password="pass",
            role="customer",
        ),
    )

    merchant = create_merchant(
        db,
        MerchantCreate(display_name="Reward Merchant"),
        owner_user_id=merchant_user.id,
    )
    create_location(
        db,
        LocationCreate(
            name="Main Floor",
            address="123 Demo St",
            lat=40.0,
            lng=-74.0,
        ),
        merchant_id=merchant.id,
    )
    program = create_loyalty_program(
        db,
        LoyaltyProgramCreate(
            name="Coffee Punch Card",
            description="Buy 2 get 1 free",
            logic_type="punch_card",
            earn_rule={"stamps_per_visit": 1},
            redeem_rule={"stamps_needed": 2},
            stamps_required=2,
            reward_description="Free drink",
            reward_expiry_days=1,
            allow_repeat_cycles=True,
        ),
        merchant_id=merchant.id,
    )

    admin_user = create_user(
        db,
        UserCreate(
            email=f"admin_{uuid.uuid4().hex[:6]}@test.com",
            password="pass",
            role="admin",
        ),
    )

    return {
        "merchant_token": create_access_token(merchant_email),
        "customer_token": create_access_token(customer_email),
        "admin_token": create_access_token(admin_user.email),
        "program": program,
        "merchant": merchant,
        "customer_id": customer_user.id,
    }


def _enroll_customer(client, env):
    headers_merchant = {"Authorization": f"Bearer {env['merchant_token']}"}
    issue_resp = client.post(
        "/api/v1/qr/issue-join",
        json={"program_id": str(env["program"].id)},
        headers=headers_merchant,
    )
    assert issue_resp.status_code == 200
    qr_token = issue_resp.json()["token"]

    headers_customer = {"Authorization": f"Bearer {env['customer_token']}"}
    enroll_resp = client.post(
        f"/api/v1/programs/{env['program'].id}/enroll",
        json={"qr_token": qr_token, "lat": 40.0, "lng": -74.0},
        headers=headers_customer,
    )
    assert enroll_resp.status_code == 200, enroll_resp.json()
    payload = enroll_resp.json()
    return payload["enrollment"]["id"], headers_merchant, headers_customer


def test_reward_cycle_and_redeem_flow(client, reward_env):
    enrollment_id, merchant_headers, customer_headers = _enroll_customer(client, reward_env)

    # Issue two unique stamps (idempotent tx_id)
    for idx in range(reward_env["program"].stamps_required):
        resp = client.post(
            f"/api/v1/enrollments/{enrollment_id}/stamps",
            json={"tx_id": f"tx-{idx}"},
            headers=merchant_headers,
        )
        assert resp.status_code == 200

    reward_resp = client.get(
        f"/api/v1/enrollments/{enrollment_id}/reward",
        headers=customer_headers,
    )
    assert reward_resp.status_code == 200
    reward_data = reward_resp.json()
    assert reward_data["reward"]["status"] == RewardStatus.REDEEMABLE.value
    reward_id = reward_data["reward"]["id"]
    voucher_code = reward_data["reward"]["voucher_code"]

    redeem_resp = client.post(
        f"/api/v1/rewards/{reward_id}/redeem",
        json={"voucher_code": voucher_code},
        headers=merchant_headers,
    )
    assert redeem_resp.status_code == 200
    assert redeem_resp.json()["reward"]["status"] == RewardStatus.REDEEMED.value

    # Duplicate redeem remains idempotent
    duplicate = client.post(
        f"/api/v1/rewards/{reward_id}/redeem",
        json={"voucher_code": voucher_code},
        headers=merchant_headers,
    )
    assert duplicate.status_code == 200
    assert duplicate.json()["alreadyRedeemed"] is True


def test_issue_stamp_blocked_when_reward_redeemable(client, reward_env):
    enrollment_id, merchant_headers, _ = _enroll_customer(client, reward_env)

    # Reach threshold
    for idx in range(reward_env["program"].stamps_required):
        resp = client.post(
            f"/api/v1/enrollments/{enrollment_id}/stamps",
            json={"tx_id": f"tx-cap-{idx}"},
            headers=merchant_headers,
        )
        assert resp.status_code == 200

    # Further issue attempts should fail
    blocked = client.post(
        f"/api/v1/enrollments/{enrollment_id}/stamps",
        json={"tx_id": "tx-overflow"},
        headers=merchant_headers,
    )
    assert blocked.status_code == 400
    assert "redeemable" in blocked.json()["detail"]


def test_reward_expire_blocks_redeem(client, reward_env, db: Session):
    enrollment_id, merchant_headers, customer_headers = _enroll_customer(client, reward_env)

    # Reach threshold quickly
    client.post(
        f"/api/v1/enrollments/{enrollment_id}/stamps",
        json={"tx_id": "dup-test"},
        headers=merchant_headers,
    )
    client.post(
        f"/api/v1/enrollments/{enrollment_id}/stamps",
        json={"tx_id": "dup-test"},  # duplicate tx should be ignored
        headers=merchant_headers,
    )
    client.post(
        f"/api/v1/enrollments/{enrollment_id}/stamps",
        json={"tx_id": "dup-test-2"},
        headers=merchant_headers,
    )

    reward_resp = client.get(
        f"/api/v1/enrollments/{enrollment_id}/reward",
        headers=customer_headers,
    )
    reward_data = reward_resp.json()
    reward_id = reward_data["reward"]["id"]

    reward_uuid = uuid.UUID(reward_id)
    reward_model = db.query(Reward).filter(Reward.id == reward_uuid).first()
    assert reward_model is not None
    reward_model.redeem_expires_at = datetime.now(timezone.utc) - timedelta(minutes=5)
    db.commit()

    # Force expiry through admin endpoint
    admin_headers = {"Authorization": f"Bearer {reward_env['admin_token']}"}
    expire_resp = client.post(
        f"/api/v1/rewards/{reward_id}/expire",
        headers=admin_headers,
    )
    assert expire_resp.status_code == 200
    assert expire_resp.json()["reward"]["status"] == RewardStatus.EXPIRED.value

    redeem_attempt = client.post(
        f"/api/v1/rewards/{reward_id}/redeem",
        json={"voucher_code": reward_data["reward"]["voucher_code"]},
        headers=merchant_headers,
    )
    assert redeem_attempt.status_code == 409 or redeem_attempt.status_code == 410
