import pytest
from sqlalchemy.orm import Session
from app.services.analytics import get_merchant_analytics
from app.models.merchant import Merchant
from app.models.customer_program_membership import CustomerProgramMembership
from app.models.ledger_entry import LedgerEntry
from app.models.user import User
from app.models.loyalty_program import LoyaltyProgram
from datetime import datetime, timedelta
import uuid


def test_get_merchant_analytics_no_uplift(db: Session):
    # Create owner user
    owner_user = User(id=str(uuid.uuid4()), email=f"owner{uuid.uuid4()}@test.com", password_hash="hash")
    db.add(owner_user)

    merchant_id = str(uuid.uuid4())
    merchant = Merchant(
        id=merchant_id,
        owner_user_id=owner_user.id,
        display_name="Test Merchant",
        average_spend_per_visit=100,
        baseline_visits_per_period=50,
        reward_cost_estimate=200
    )
    db.add(merchant)

    # Create program
    program = LoyaltyProgram(
        id=str(uuid.uuid4()),
        merchant_id=merchant_id,
        name="Test Program",
        logic_type="punch_card",
        earn_rule="1 stamp per visit",
        redeem_rule="10 stamps for free item"
    )
    db.add(program)

    # Add memberships
    memberships = []
    for i in range(10):
        customer_user = User(id=str(uuid.uuid4()), email=f"customer{i}{uuid.uuid4()}@test.com", password_hash="hash")
        db.add(customer_user)
        membership = CustomerProgramMembership(
            id=str(uuid.uuid4()),
            customer_user_id=customer_user.id,
            program_id=program.id,
            current_balance=5
        )
        db.add(membership)
        memberships.append(membership)

    db.flush()  # Ensure memberships are inserted

    # Add ledger entries with visits = baseline (50 entries for 10 customers, about 5 each)
    for membership in memberships:
        for j in range(5):
            entry = LedgerEntry(
                id=str(uuid.uuid4()),
                membership_id=membership.id,
                entry_type='EARN',
                amount=1,
                created_at=datetime.utcnow() - timedelta(days=15)
            )
            db.add(entry)

    db.commit()

    result = get_merchant_analytics(db, merchant_id, 30)

    assert result['totalCustomersEnrolled'] == 10
    assert result['visitsByEnrolledCustomers'] == 50
    assert result['baselineVisitsEstimate'] == 50
    assert result['estimatedExtraVisits'] == 0
    assert result['estimatedExtraRevenue'] == 0
    assert result['netIncrementalRevenue'] == -200


def test_get_merchant_analytics_positive_uplift(db: Session):
    # Create owner user
    owner_user = User(id=str(uuid.uuid4()), email=f"owner{uuid.uuid4()}@test.com", password_hash="hash")
    db.add(owner_user)

    merchant_id = str(uuid.uuid4())
    merchant = Merchant(
        id=merchant_id,
        owner_user_id=owner_user.id,
        display_name="Test Merchant",
        average_spend_per_visit=100,
        baseline_visits_per_period=50,
        reward_cost_estimate=200
    )
    db.add(merchant)

    # Create program
    program = LoyaltyProgram(
        id=str(uuid.uuid4()),
        merchant_id=merchant_id,
        name="Test Program",
        logic_type="punch_card",
        earn_rule="1 stamp per visit",
        redeem_rule="10 stamps for free item"
    )
    db.add(program)

    # Add memberships
    memberships = []
    for i in range(20):
        customer_user = User(id=str(uuid.uuid4()), email=f"customer{i}{uuid.uuid4()}@test.com", password_hash="hash")
        db.add(customer_user)
        membership = CustomerProgramMembership(
            id=str(uuid.uuid4()),
            customer_user_id=customer_user.id,
            program_id=program.id,
            current_balance=5
        )
        db.add(membership)
        memberships.append(membership)

    db.flush()  # Ensure memberships are inserted

    # Add ledger entries with visits > baseline (80 entries for 20 customers, 4 each)
    for membership in memberships:
        for j in range(4):
            entry = LedgerEntry(
                id=str(uuid.uuid4()),
                membership_id=membership.id,
                entry_type='EARN',
                amount=1,
                created_at=datetime.utcnow() - timedelta(days=15)
            )
            db.add(entry)

    db.commit()

    result = get_merchant_analytics(db, merchant_id, 30)

    assert result['totalCustomersEnrolled'] == 20
    assert result['visitsByEnrolledCustomers'] == 80
    assert result['baselineVisitsEstimate'] == 50
    assert result['estimatedExtraVisits'] == 30
    assert result['estimatedExtraRevenue'] == 3000
    assert result['netIncrementalRevenue'] == 2800


def test_get_merchant_analytics_negative_net(db: Session):
    # Create owner user
    owner_user = User(id=str(uuid.uuid4()), email=f"owner{uuid.uuid4()}@test.com", password_hash="hash")
    db.add(owner_user)

    merchant_id = str(uuid.uuid4())
    merchant = Merchant(
        id=merchant_id,
        owner_user_id=owner_user.id,
        display_name="Test Merchant",
        average_spend_per_visit=100,
        baseline_visits_per_period=50,
        reward_cost_estimate=5000
    )
    db.add(merchant)

    # Create program
    program = LoyaltyProgram(
        id=str(uuid.uuid4()),
        merchant_id=merchant_id,
        name="Test Program",
        logic_type="punch_card",
        earn_rule="1 stamp per visit",
        redeem_rule="10 stamps for free item"
    )
    db.add(program)

    # Add memberships
    memberships = []
    for i in range(10):
        customer_user = User(id=str(uuid.uuid4()), email=f"customer{i}{uuid.uuid4()}@test.com", password_hash="hash")
        db.add(customer_user)
        membership = CustomerProgramMembership(
            id=str(uuid.uuid4()),
            customer_user_id=customer_user.id,
            program_id=program.id,
            current_balance=5
        )
        db.add(membership)
        memberships.append(membership)

    db.flush()  # Ensure memberships are inserted

    # Add ledger entries (60 entries for 10 customers, 6 each)
    for membership in memberships:
        for j in range(6):
            entry = LedgerEntry(
                id=str(uuid.uuid4()),
                membership_id=membership.id,
                entry_type='EARN',
                amount=1,
                created_at=datetime.utcnow() - timedelta(days=15)
            )
            db.add(entry)

    db.commit()

    result = get_merchant_analytics(db, merchant_id, 30)

    assert result['totalCustomersEnrolled'] == 10
    assert result['visitsByEnrolledCustomers'] == 60
    assert result['baselineVisitsEstimate'] == 50
    assert result['estimatedExtraVisits'] == 10
    assert result['estimatedExtraRevenue'] == 1000
    assert result['netIncrementalRevenue'] == -4000


def test_get_merchant_analytics_no_customers(db: Session):
    # Create owner user
    owner_user = User(id=str(uuid.uuid4()), email=f"owner{uuid.uuid4()}@test.com", password_hash="hash")
    db.add(owner_user)

    merchant_id = str(uuid.uuid4())
    merchant = Merchant(
        id=merchant_id,
        owner_user_id=owner_user.id,
        display_name="Test Merchant",
        average_spend_per_visit=100,
        baseline_visits_per_period=50,
        reward_cost_estimate=200
    )
    db.add(merchant)
    db.commit()

    result = get_merchant_analytics(db, merchant_id, 30)

    assert result['totalCustomersEnrolled'] == 0
    assert result['visitsByEnrolledCustomers'] == 0
    assert result['baselineVisitsEstimate'] == 50
    assert result['estimatedExtraVisits'] == 0
    assert result['estimatedExtraRevenue'] == 0
    assert result['netIncrementalRevenue'] == -200