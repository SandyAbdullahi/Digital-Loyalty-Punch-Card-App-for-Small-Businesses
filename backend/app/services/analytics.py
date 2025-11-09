from sqlalchemy.orm import Session
from ..models.merchant import Merchant
from ..models.customer_program_membership import CustomerProgramMembership
from ..models.ledger_entry import LedgerEntry
from ..models.loyalty_program import LoyaltyProgram
from ..models.user import User
from datetime import datetime, timedelta
from typing import Dict, Any, List
from uuid import UUID


def get_merchant_analytics(db: Session, merchant_id: UUID, period_days: int = 30) -> Dict[str, Any]:
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise ValueError("Merchant not found")

    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=period_days)

    # Total customers enrolled
    total_customers_enrolled = db.query(CustomerProgramMembership).join(LoyaltyProgram).filter(
        LoyaltyProgram.merchant_id == merchant_id
    ).count()

    # Stamps issued this period
    stamps_issued_this_month = db.query(LedgerEntry).join(CustomerProgramMembership).join(LoyaltyProgram).filter(
        LoyaltyProgram.merchant_id == merchant_id,
        LedgerEntry.entry_type == 'EARN',
        LedgerEntry.created_at >= start_date,
        LedgerEntry.created_at <= end_date
    ).count()

    # Rewards redeemed this period
    rewards_redeemed_this_month = db.query(LedgerEntry).join(CustomerProgramMembership).join(LoyaltyProgram).filter(
        LoyaltyProgram.merchant_id == merchant_id,
        LedgerEntry.entry_type == 'REDEEM',
        LedgerEntry.created_at >= start_date,
        LedgerEntry.created_at <= end_date
    ).count()

    # Visits by enrolled customers (approximate: count earn entries as visits)
    visits_by_enrolled_customers = db.query(LedgerEntry).join(CustomerProgramMembership).join(LoyaltyProgram).filter(
        LoyaltyProgram.merchant_id == merchant_id,
        LedgerEntry.entry_type == 'EARN',
        LedgerEntry.created_at >= start_date,
        LedgerEntry.created_at <= end_date
    ).count()

    # Baseline visits estimate
    baseline_visits_estimate = merchant.baseline_visits_per_period or 0

    # Average spend per visit
    average_spend_per_visit = merchant.average_spend_per_visit or 0

    # Reward cost estimate
    reward_cost_estimate = merchant.reward_cost_estimate or 0

    # Estimated extra visits
    estimated_extra_visits = max(0, visits_by_enrolled_customers - baseline_visits_estimate)

    # Estimated extra revenue
    estimated_extra_revenue = estimated_extra_visits * average_spend_per_visit

    # Net incremental revenue
    net_incremental_revenue = estimated_extra_revenue - reward_cost_estimate

    return {
        "merchantId": str(merchant_id),
        "totalCustomersEnrolled": total_customers_enrolled,
        "stampsIssuedThisMonth": stamps_issued_this_month,
        "rewardsRedeemedThisMonth": rewards_redeemed_this_month,
        "visitsByEnrolledCustomers": visits_by_enrolled_customers,
        "baselineVisitsEstimate": baseline_visits_estimate,
        "averageSpendPerVisit": average_spend_per_visit,
        "rewardCostEstimate": reward_cost_estimate,
        "estimatedExtraVisits": estimated_extra_visits,
        "estimatedExtraRevenue": estimated_extra_revenue,
        "netIncrementalRevenue": net_incremental_revenue
    }


def get_top_customers(db: Session, merchant_id: UUID, period_days: int = 30, limit: int = 10) -> List[Dict[str, Any]]:
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise ValueError("Merchant not found")

    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=period_days)

    # Get total customers
    total_customers = db.query(CustomerProgramMembership).join(LoyaltyProgram).filter(
        LoyaltyProgram.merchant_id == merchant_id
    ).distinct(CustomerProgramMembership.customer_user_id).count()

    baseline_per_customer = (merchant.baseline_visits_per_period or 0) / total_customers if total_customers > 0 else 0
    average_spend = merchant.average_spend_per_visit or 0

    # Get top customers by visits
    from sqlalchemy import func
    top_customers_query = db.query(
        User.name,
        User.email,
        func.count(LedgerEntry.id).label('visits')
    ).join(CustomerProgramMembership, User.id == CustomerProgramMembership.customer_user_id).join(LedgerEntry, LedgerEntry.membership_id == CustomerProgramMembership.id).join(LoyaltyProgram, CustomerProgramMembership.program_id == LoyaltyProgram.id).filter(
        LoyaltyProgram.merchant_id == merchant_id,
        LedgerEntry.entry_type == 'EARN',
        LedgerEntry.created_at >= start_date,
        LedgerEntry.created_at <= end_date
    ).group_by(User.id, User.name, User.email).order_by(func.count(LedgerEntry.id).desc()).limit(limit).all()

    result = []
    for name, email, visits in top_customers_query:
        customer_name = name or (email.split('@')[0] if email else 'Unknown')
        extra_visits = max(0, visits - baseline_per_customer)
        estimated_revenue = extra_visits * average_spend
        result.append({
            "name": customer_name,
            "visits": visits,
            "extraVisits": extra_visits,
            "estimatedRevenue": estimated_revenue
        })

    return result