import pytest
from sqlalchemy.orm import Session
from app.services.analytics import get_merchant_analytics, Period
from app.models.merchant import Merchant
from app.models.customer_program_membership import CustomerProgramMembership
from app.models.ledger_entry import LedgerEntry
from app.models.user import User
from app.models.loyalty_program import LoyaltyProgram
from app.models.merchant_settings import MerchantSettings
from datetime import datetime, timedelta
import uuid


def test_get_merchant_analytics_no_uplift(db: Session):
    # Create owner user
    owner_user = User(id=uuid.uuid4(), email=f"owner{uuid.uuid4()}@test.com", password_hash="hash")
    db.add(owner_user)

    merchant_id = uuid.uuid4()
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
        id=uuid.uuid4(),
        merchant_id=merchant_id,
        name="Test Program",
        logic_type="punch_card",
        earn_rule="1 stamp per visit",
        redeem_rule="10 stamps for free item",
        stamps_required=10
    )
    db.add(program)

    # Add memberships
    memberships = []
    for i in range(10):
        customer_user = User(id=uuid.uuid4(), email=f"customer{i}{uuid.uuid4()}@test.com", password_hash="hash")
        db.add(customer_user)
        membership = CustomerProgramMembership(
            id=uuid.uuid4(),
            customer_user_id=customer_user.id,
            program_id=program.id,
            merchant_id=merchant_id,
            current_balance=5,
            joined_at=datetime.utcnow() - timedelta(days=100)
        )
        db.add(membership)
        memberships.append(membership)

    db.flush()  # Ensure memberships are inserted

    # Add ledger entries with visits = baseline (50 entries for 10 customers, about 5 each)
    for membership in memberships:
        for j in range(5):
            entry = LedgerEntry(
                id=uuid.uuid4(),
                membership_id=membership.id,
                merchant_id=merchant_id,
                program_id=program.id,
                customer_id=membership.customer_user_id,
                entry_type='EARN',
                amount=1,
                issued_at=datetime.utcnow() - timedelta(days=15),
                created_at=datetime.utcnow() - timedelta(days=15)
            )
            db.add(entry)

    db.commit()

    result = get_merchant_analytics(db, merchant_id, Period.LAST_3_MONTHS)

    assert result['totals']['totalCustomersEnrolled'] == 10
    assert result['totals']['stampsIssued'] == 50
    assert result['revenueEstimation']['baselineVisits'] == 50
    assert result['revenueEstimation']['estimatedExtraVisits'] == 0
    assert result['revenueEstimation']['estimatedExtraRevenueKES'] == 0
    assert result['revenueEstimation']['netIncrementalRevenueKES'] == 0


def test_get_merchant_analytics_positive_uplift(db: Session):
    # Create owner user
    owner_user = User(id=uuid.uuid4(), email=f"owner{uuid.uuid4()}@test.com", password_hash="hash")
    db.add(owner_user)

    merchant_id = uuid.uuid4()
    merchant = Merchant(
        id=merchant_id,
        owner_user_id=owner_user.id,
        display_name="Test Merchant",
        average_spend_per_visit=100,
        baseline_visits_per_period=50,
        reward_cost_estimate=200
    )
    db.add(merchant)

    # Add settings
    settings = MerchantSettings(
        merchant_id=merchant_id,
        avg_spend_per_visit_kes=100,
        baseline_visits_per_customer_per_period=2.5,  # 50 / 20
        avg_reward_cost_kes=200
    )
    db.add(settings)

    # Create program
    program = LoyaltyProgram(
        id=uuid.uuid4(),
        merchant_id=merchant_id,
        name="Test Program",
        logic_type="punch_card",
        earn_rule="1 stamp per visit",
        redeem_rule="10 stamps for free item",
        stamps_required=10
    )
    db.add(program)

    # Add memberships
    memberships = []
    for i in range(20):
        customer_user = User(id=uuid.uuid4(), email=f"customer{i}{uuid.uuid4()}@test.com", password_hash="hash")
        db.add(customer_user)
        membership = CustomerProgramMembership(
            id=uuid.uuid4(),
            customer_user_id=customer_user.id,
            program_id=program.id,
            merchant_id=merchant_id,
            current_balance=5,
            joined_at=datetime.utcnow() - timedelta(days=100)
        )
        db.add(membership)
        memberships.append(membership)

    db.flush()  # Ensure memberships are inserted

    # Add ledger entries with visits > baseline (80 entries for 20 customers, 4 each)
    for membership in memberships:
        for j in range(4):
            entry = LedgerEntry(
                id=uuid.uuid4(),
                membership_id=membership.id,
                merchant_id=merchant_id,
                program_id=program.id,
                customer_id=membership.customer_user_id,
                entry_type='EARN',
                amount=1,
                issued_at=datetime.utcnow() - timedelta(days=15),
                created_at=datetime.utcnow() - timedelta(days=15)
            )
            db.add(entry)

    db.commit()

    result = get_merchant_analytics(db, merchant_id, Period.LAST_3_MONTHS)

    assert result['totals']['totalCustomersEnrolled'] == 20
    assert result['totals']['stampsIssued'] == 80
    assert result['revenueEstimation']['baselineVisits'] == 50
    assert result['revenueEstimation']['estimatedExtraVisits'] == 30
    assert result['revenueEstimation']['estimatedExtraRevenueKES'] == 3000
    assert result['revenueEstimation']['netIncrementalRevenueKES'] == 3000


def test_get_merchant_analytics_negative_net(db: Session):
    # Create owner user
    owner_user = User(id=uuid.uuid4(), email=f"owner{uuid.uuid4()}@test.com", password_hash="hash")
    db.add(owner_user)

    merchant_id = uuid.uuid4()
    merchant = Merchant(
        id=merchant_id,
        owner_user_id=owner_user.id,
        display_name="Test Merchant",
        average_spend_per_visit=100,
        baseline_visits_per_period=50,
        reward_cost_estimate=5000
    )
    db.add(merchant)

    # Add settings
    settings = MerchantSettings(
        merchant_id=merchant_id,
        avg_spend_per_visit_kes=100,
        baseline_visits_per_customer_per_period=5,  # 50 / 10
        avg_reward_cost_kes=5000
    )
    db.add(settings)

    # Create program
    program = LoyaltyProgram(
        id=uuid.uuid4(),
        merchant_id=merchant_id,
        name="Test Program",
        logic_type="punch_card",
        earn_rule="1 stamp per visit",
        redeem_rule="10 stamps for free item",
        stamps_required=10
    )
    db.add(program)

    # Add memberships
    memberships = []
    for i in range(10):
        customer_user = User(id=uuid.uuid4(), email=f"customer{i}{uuid.uuid4()}@test.com", password_hash="hash")
        db.add(customer_user)
        membership = CustomerProgramMembership(
            id=uuid.uuid4(),
            customer_user_id=customer_user.id,
            program_id=program.id,
            merchant_id=merchant_id,
            current_balance=5,
            joined_at=datetime.utcnow() - timedelta(days=100)
        )
        db.add(membership)
        memberships.append(membership)

    db.flush()  # Ensure memberships are inserted

    # Add ledger entries (60 entries for 10 customers, 6 each)
    for membership in memberships:
        for j in range(6):
            entry = LedgerEntry(
                id=uuid.uuid4(),
                membership_id=membership.id,
                merchant_id=merchant_id,
                program_id=program.id,
                customer_id=membership.customer_user_id,
                entry_type='EARN',
                amount=1,
                issued_at=datetime.utcnow() - timedelta(days=15),
                created_at=datetime.utcnow() - timedelta(days=15)
            )
            db.add(entry)

    # Add some redemptions to create negative net revenue
    entry = LedgerEntry(
        id=uuid.uuid4(),
        membership_id=memberships[0].id,
        merchant_id=merchant_id,
        program_id=program.id,
        customer_id=memberships[0].customer_user_id,
        entry_type='REDEEM',
        amount=1,  # Redeeming 1 reward
        issued_at=datetime.utcnow() - timedelta(days=15),
        created_at=datetime.utcnow() - timedelta(days=15)
    )
    db.add(entry)

    db.commit()

    result = get_merchant_analytics(db, merchant_id, Period.LAST_3_MONTHS)

    assert result['totals']['totalCustomersEnrolled'] == 10
    assert result['totals']['stampsIssued'] == 60
    assert result['revenueEstimation']['baselineVisits'] == 50
    assert result['revenueEstimation']['estimatedExtraVisits'] == 10
    assert result['revenueEstimation']['estimatedExtraRevenueKES'] == 1000
    assert result['revenueEstimation']['netIncrementalRevenueKES'] == -4000


def test_get_merchant_analytics_no_customers(db: Session):
    # Create owner user
    owner_user = User(id=uuid.uuid4(), email=f"owner{uuid.uuid4()}@test.com", password_hash="hash")
    db.add(owner_user)

    merchant_id = uuid.uuid4()
    merchant = Merchant(
        id=merchant_id,
        owner_user_id=owner_user.id,
        display_name="Test Merchant",
        average_spend_per_visit=100,
        baseline_visits_per_period=50,
        reward_cost_estimate=200
    )
    db.add(merchant)

    # Add settings
    settings = MerchantSettings(
        merchant_id=merchant_id,
        avg_spend_per_visit_kes=100,
        baseline_visits_per_customer_per_period=5,
        avg_reward_cost_kes=200
    )
    db.add(settings)
    db.flush()
    db.commit()

    result = get_merchant_analytics(db, merchant_id, Period.LAST_3_MONTHS)

    assert result['totals']['totalCustomersEnrolled'] == 0
    assert result['totals']['stampsIssued'] == 0
    assert result['revenueEstimation']['baselineVisits'] == 0
    assert result['revenueEstimation']['estimatedExtraVisits'] == 0
    assert result['revenueEstimation']['estimatedExtraRevenueKES'] == 0
    assert result['revenueEstimation']['netIncrementalRevenueKES'] == 0