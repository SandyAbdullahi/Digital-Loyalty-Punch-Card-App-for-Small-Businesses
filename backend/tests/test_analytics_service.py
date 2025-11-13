import uuid
from datetime import datetime, timedelta

import pytest
from sqlalchemy.orm import Session

from app.models.customer_program_membership import CustomerProgramMembership
from app.models.loyalty_program import LoyaltyProgram
from app.models.merchant import Merchant
from app.models.merchant_settings import MerchantSettings
from app.models.reward import Reward, RewardStatus
from app.models.stamp import Stamp
from app.models.user import User, UserRole
from app.services.analytics import Period, get_merchant_analytics


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
        name="Coffee Club",
        logic_type="punch_card",
        earn_rule="{}",
        redeem_rule="{}",
        stamps_required=4,
    )
    db.add(program)
    db.commit()
    return program


def _create_membership(db: Session, merchant: Merchant, program: LoyaltyProgram, customer: User) -> CustomerProgramMembership:
    membership = CustomerProgramMembership(
        id=uuid.uuid4(),
        customer_user_id=customer.id,
        program_id=program.id,
        merchant_id=merchant.id,
        current_balance=0,
        joined_at=datetime.utcnow() - timedelta(days=10),
    )
    db.add(membership)
    db.commit()
    return membership


def _add_stamp_entries(db: Session, merchant: Merchant, program: LoyaltyProgram, membership: CustomerProgramMembership, count: int) -> None:
    issued_at = datetime.utcnow() - timedelta(days=1)
    for idx in range(count):
        stamp = Stamp(
            id=uuid.uuid4(),
            enrollment_id=membership.id,
            program_id=program.id,
            merchant_id=merchant.id,
            customer_id=membership.customer_user_id,
            tx_id=f"tx_{membership.id.hex}_{idx}",
            issued_at=issued_at + timedelta(minutes=idx),
        )
        db.add(stamp)
    db.commit()


def _add_reward(db: Session, merchant: Merchant, program: LoyaltyProgram, membership: CustomerProgramMembership) -> None:
    reward = Reward(
        id=uuid.uuid4(),
        enrollment_id=membership.id,
        program_id=program.id,
        merchant_id=merchant.id,
        customer_id=membership.customer_user_id,
        status=RewardStatus.REDEEMED,
        voucher_code=f"CODE-{uuid.uuid4().hex[:6]}",
        redeemed_at=datetime.utcnow() - timedelta(hours=6),
        reached_at=datetime.utcnow() - timedelta(days=2),
    )
    db.add(reward)
    db.commit()


def test_analytics_metrics_with_extra_visits(db: Session):
    owner = _create_user(db, "owner@test.com", UserRole.MERCHANT)
    merchant = _create_merchant(db, owner)
    program = _create_program(db, merchant)

    settings = MerchantSettings(
        merchant_id=merchant.id,
        avg_spend_per_visit_kes=500,
        baseline_visits_per_customer_per_period=2,
        avg_reward_cost_kes=100,
    )
    db.add(settings)
    db.commit()

    customer = _create_user(db, "customer@test.com", UserRole.CUSTOMER)
    membership = _create_membership(db, merchant, program, customer)

    _add_stamp_entries(db, merchant, program, membership, count=4)
    _add_reward(db, merchant, program, membership)

    analytics = get_merchant_analytics(db, merchant.id, Period.THIS_MONTH)

    assert analytics["revenueEstimation"]["baselineVisits"] == pytest.approx(2.0)
    assert analytics["revenueEstimation"]["estimatedExtraVisits"] == pytest.approx(2.0)
    assert analytics["revenueEstimation"]["estimatedExtraRevenueKES"] == pytest.approx(1000.0)
    assert analytics["revenueEstimation"]["totalRewardCostKES"] == pytest.approx(100.0)
    assert analytics["revenueEstimation"]["netIncrementalRevenueKES"] == pytest.approx(900.0)
    assert analytics["kpis"]["repeatVisitRate"] == pytest.approx(1.0)
    assert "small_sample_size" in analytics["warnings"]
    assert "missing_settings" not in analytics["warnings"]


def test_analytics_missing_settings_flag(db: Session):
    owner = _create_user(db, "owner2@test.com", UserRole.MERCHANT)
    merchant = _create_merchant(db, owner)
    program = _create_program(db, merchant)
    customer = _create_user(db, "customer2@test.com", UserRole.CUSTOMER)
    membership = _create_membership(db, merchant, program, customer)

    _add_stamp_entries(db, merchant, program, membership, count=1)

    analytics = get_merchant_analytics(db, merchant.id, Period.THIS_MONTH)
    assert "missing_settings" in analytics["warnings"]


def test_analytics_no_extra_visits_when_below_baseline(db: Session):
    owner = _create_user(db, "owner3@test.com", UserRole.MERCHANT)
    merchant = _create_merchant(db, owner)
    program = _create_program(db, merchant)

    settings = MerchantSettings(
        merchant_id=merchant.id,
        avg_spend_per_visit_kes=400,
        baseline_visits_per_customer_per_period=10,
        avg_reward_cost_kes=50,
    )
    db.add(settings)
    db.commit()

    customer = _create_user(db, "customer3@test.com", UserRole.CUSTOMER)
    membership = _create_membership(db, merchant, program, customer)
    _add_stamp_entries(db, merchant, program, membership, count=4)

    analytics = get_merchant_analytics(db, merchant.id, Period.THIS_MONTH)

    assert analytics["revenueEstimation"]["estimatedExtraVisits"] == 0
    assert analytics["revenueEstimation"]["estimatedExtraRevenueKES"] == 0
    assert analytics["revenueEstimation"]["netIncrementalRevenueKES"] == 0
