import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.models.merchant import Merchant
from app.models.user import User, UserRole
from app.models.customer_program_membership import CustomerProgramMembership
from app.models.loyalty_program import LoyaltyProgram
from app.models.ledger_entry import LedgerEntry, LedgerEntryType
from app.models.reward import Reward, RewardStatus


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
        display_name="Test Merchant",
        legal_name="Test Merchant LLC",
    )
    db.add(merchant)
    db.commit()
    return merchant


def _create_program(db: Session, merchant: Merchant) -> LoyaltyProgram:
    program = LoyaltyProgram(
        id=uuid.uuid4(),
        merchant_id=merchant.id,
        name="Test Program",
        logic_type="punch_card",
        earn_rule="{}",
        redeem_rule="{}",
        stamps_required=10,
    )
    db.add(program)
    db.commit()
    return program


def _create_membership(db: Session, customer: User, program: LoyaltyProgram) -> CustomerProgramMembership:
    membership = CustomerProgramMembership(
        id=uuid.uuid4(),
        customer_user_id=customer.id,
        merchant_id=program.merchant_id,
        program_id=program.id,
        current_balance=5,
    )
    db.add(membership)
    db.commit()
    return membership


def test_get_customer_detail_returns_lifetime_metrics(client: TestClient, db: Session):
    # Create merchant owner
    owner = _create_user(db, "merchant@test.com", UserRole.MERCHANT)
    merchant = _create_merchant(db, owner)
    program = _create_program(db, merchant)

    # Create customer
    customer = _create_user(db, "customer@test.com", UserRole.CUSTOMER)
    membership = _create_membership(db, customer, program)

    # Create some ledger entries (visits)
    for i in range(3):
        entry = LedgerEntry(
            membership_id=membership.id,
            merchant_id=merchant.id,
            program_id=program.id,
            customer_id=customer.id,
            entry_type=LedgerEntryType.EARN,
            amount=1,
        )
        db.add(entry)
    db.commit()

    # Create customer stats
    from app.models.customer_stats import CustomerStats
    customer_stats = CustomerStats(
        customer_id=customer.id,
        total_visits=3,
        total_revenue=0.0,
        rewards_redeemed=1,
    )
    db.add(customer_stats)

    # Create a redeemed reward
    reward = Reward(
        id=uuid.uuid4(),
        customer_id=customer.id,
        program_id=program.id,
        merchant_id=merchant.id,
        enrollment_id=membership.id,
        status=RewardStatus.REDEEMED,
        cycle=1,
    )
    db.add(reward)
    db.commit()

    # Authenticate as merchant
    token = create_access_token(subject=owner.email)
    response = client.get(
        f"/api/v1/merchants/customers/{customer.id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()

    # Check lifetime metrics
    assert "lifetime_total_visits" in data
    assert data["lifetime_total_visits"] == 3  # 3 EARN entries

    assert "lifetime_total_revenue" in data
    assert data["lifetime_total_revenue"] == 0.0  # Not implemented yet

    assert "lifetime_rewards_redeemed" in data
    assert data["lifetime_rewards_redeemed"] == 1  # 1 redeemed reward

    assert "lifetime_avg_basket_size" in data
    assert data["lifetime_avg_basket_size"] == 0.0  # revenue / visits = 0 / 3 = 0


def test_get_customer_detail_zero_visits(client: TestClient, db: Session):
    # Create merchant owner
    owner = _create_user(db, "merchant2@test.com", UserRole.MERCHANT)
    merchant = _create_merchant(db, owner)
    program = _create_program(db, merchant)

    # Create customer with no visits
    customer = _create_user(db, "customer2@test.com", UserRole.CUSTOMER)
    membership = _create_membership(db, customer, program)

    # Authenticate as merchant
    token = create_access_token(subject=owner.email)
    response = client.get(
        f"/api/v1/merchants/customers/{customer.id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()

    # Check lifetime metrics handle zero visits
    assert data["lifetime_total_visits"] == 0
    assert data["lifetime_avg_basket_size"] == 0.0