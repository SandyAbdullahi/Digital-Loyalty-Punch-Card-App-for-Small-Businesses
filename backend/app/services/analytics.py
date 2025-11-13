from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, or_, case, cast, Float
from ..models.merchant import Merchant
from ..models.merchant_settings import MerchantSettings, PeriodEnum
from ..models.customer_program_membership import CustomerProgramMembership
from ..models.ledger_entry import LedgerEntry
from ..models.loyalty_program import LoyaltyProgram
from ..models.user import User
from ..models.reward import RedeemCode, Reward, RewardStatus
from ..models.analytics_snapshot import AnalyticsSnapshot
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
from uuid import UUID
from enum import Enum
import statistics


class Period(str, Enum):
    THIS_MONTH = "this_month"
    LAST_3_MONTHS = "last_3_months"
    LAST_12_MONTHS = "last_12_months"


def resolve_period(period: str) -> Tuple[datetime, datetime, str]:
    now = datetime.utcnow()
    if period == Period.THIS_MONTH:
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end = (start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
        label = "This Month"
    elif period == Period.LAST_3_MONTHS:
        end = now
        start = end - timedelta(days=90)
        label = "Last 3 Months"
    elif period == Period.LAST_12_MONTHS:
        end = now
        start = end - timedelta(days=365)
        label = "Last 12 Months"
    else:
        raise ValueError(f"Invalid period: {period}")
    return start, end, label


def get_merchant_analytics(db: Session, merchant_id: UUID, period: str = Period.THIS_MONTH) -> Dict[str, Any]:
    merchant = db.execute(select(Merchant).where(Merchant.id == merchant_id)).scalar_one_or_none()
    if not merchant:
        raise ValueError("Merchant not found")

    settings = db.execute(select(MerchantSettings).where(MerchantSettings.merchant_id == merchant_id)).scalar_one_or_none()
    if not settings:
        # Use default settings if not configured
        settings = MerchantSettings(
            merchant_id=merchant_id,
            avg_spend_per_visit_kes=0,
            baseline_visits_per_customer_per_period=5,
            avg_reward_cost_kes=0,
            default_period=PeriodEnum.MONTH,
            monthly_subscription_kes=None
        )

    start_date, end_date, period_label = resolve_period(period)

    # Check for cached snapshot
    snapshot = db.execute(select(AnalyticsSnapshot).where(
        and_(
            AnalyticsSnapshot.merchant_id == merchant_id,
            AnalyticsSnapshot.period_start == start_date,
            AnalyticsSnapshot.period_end == end_date
        )
    )).scalar_one_or_none()

    if snapshot:
        # Return cached data
        total_reward_cost = snapshot.rewards_redeemed * (settings.avg_reward_cost_kes or 0)
        return {
            "merchantId": str(merchant_id),
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
                "label": period_label
            },
            "totals": {
                "totalCustomersEnrolled": snapshot.total_customers_enrolled,
                "stampsIssued": snapshot.visits_by_enrolled_customers,
                "rewardsRedeemed": snapshot.rewards_redeemed,
                "repeatVisitRate": snapshot.visits_by_enrolled_customers / snapshot.total_customers_enrolled if snapshot.total_customers_enrolled > 0 else 0
            },
            "revenueEstimation": {
                "baselineVisits": snapshot.baseline_visits_estimate,
                "estimatedExtraVisits": snapshot.estimated_extra_visits,
                "estimatedExtraRevenueKES": snapshot.estimated_extra_revenue_kes,
            "conservativeLowerKES": float(snapshot.estimated_extra_revenue_kes) * 0.8,
            "conservativeUpperKES": float(snapshot.estimated_extra_revenue_kes) * 1.2,
                "totalRewardCostKES": total_reward_cost,
                "netIncrementalRevenueKES": snapshot.net_incremental_revenue_kes
            },
            "anomalyFlags": ["negative_net_revenue"] if snapshot.net_incremental_revenue_kes < 0 else [],
            "programs": []  # Not cached
        }

    # Customers enrolled (enrolled before end_date)
    customers_enrolled = db.execute(
        select(func.count(func.distinct(CustomerProgramMembership.customer_user_id)))
        .join(LoyaltyProgram)
        .where(
            and_(
                LoyaltyProgram.merchant_id == merchant_id,
                CustomerProgramMembership.joined_at <= end_date
            )
        )
    ).scalar()

    # Visits by enrolled customers (EARN entries in period)
    visits_by_enrolled_customers = db.execute(
        select(func.count(LedgerEntry.id))
        .join(CustomerProgramMembership)
        .join(LoyaltyProgram)
        .where(
            and_(
                LoyaltyProgram.merchant_id == merchant_id,
                LedgerEntry.entry_type == 'EARN',
                LedgerEntry.issued_at >= start_date,
                LedgerEntry.issued_at <= end_date
            )
        )
    ).scalar()

    # Rewards redeemed in period (count of redemption events)
    rewards_redeemed_count = db.execute(
        select(func.count(Reward.id))
        .where(
            and_(
                Reward.merchant_id == merchant_id,
                Reward.status == RewardStatus.REDEEMED,
                Reward.redeemed_at >= start_date,
                Reward.redeemed_at <= end_date
            )
        )
    ).scalar() or 0

    # Calculate baseline visits
    baseline_visits_per_period = float(settings.baseline_visits_per_customer_per_period or 0)
    baseline_visits = customers_enrolled * baseline_visits_per_period

    estimated_extra_visits = max(0, visits_by_enrolled_customers - baseline_visits)
    estimated_extra_revenue = estimated_extra_visits * float(settings.avg_spend_per_visit_kes or 0)
    total_reward_cost = rewards_redeemed_count * float(settings.avg_reward_cost_kes or 0)
    net_incremental_revenue = estimated_extra_revenue - total_reward_cost

    # Additional metrics
    repeat_visit_rate = visits_by_enrolled_customers / customers_enrolled if customers_enrolled > 0 else 0

    # Improved confidence intervals based on data variability
    revenue_confidence_factor = 0.15 if customers_enrolled > 100 else 0.25  # More confidence with larger sample
    conservative_lower = float(estimated_extra_revenue) * (1 - revenue_confidence_factor)
    conservative_upper = float(estimated_extra_revenue) * (1 + revenue_confidence_factor)

    # Calculate ROI and other metrics
    roi_percentage = (net_incremental_revenue / total_reward_cost * 100) if total_reward_cost > 0 else 0
    avg_visits_per_customer = visits_by_enrolled_customers / customers_enrolled if customers_enrolled > 0 else 0

    anomaly_flags = []
    if net_incremental_revenue < 0:
        anomaly_flags.append("negative_net_revenue")
    if estimated_extra_visits == 0 and visits_by_enrolled_customers > 0:
        anomaly_flags.append("no_uplift_despite_visits")
    if customers_enrolled < 10:
        anomaly_flags.append("small_sample_size")
    if settings.avg_spend_per_visit_kes == 0 or settings.avg_spend_per_visit_kes is None:
        anomaly_flags.append("missing_spend_estimate")
    if settings.avg_reward_cost_kes == 0 or settings.avg_reward_cost_kes is None:
        anomaly_flags.append("missing_reward_cost_estimate")

    # Program breakdown
    programs = db.execute(
        select(
            LoyaltyProgram.id,
            LoyaltyProgram.name,
            func.count(func.distinct(CustomerProgramMembership.customer_user_id)).label('customers_enrolled'),
            func.sum(case((LedgerEntry.entry_type == 'EARN', 1), else_=0)).label('visits'),
            func.coalesce(
                select(func.count(Reward.id))
                .where(
                    and_(
                        Reward.program_id == LoyaltyProgram.id,
                        Reward.merchant_id == merchant_id,
                        Reward.status == RewardStatus.REDEEMED,
                        Reward.redeemed_at >= start_date,
                        Reward.redeemed_at <= end_date,
                    )
                )
                .correlate(LoyaltyProgram)
                .scalar_subquery(),
                0,
            ).label('redemptions')
        )
        .outerjoin(CustomerProgramMembership, LoyaltyProgram.id == CustomerProgramMembership.program_id)
        .outerjoin(LedgerEntry, and_(
            LedgerEntry.membership_id == CustomerProgramMembership.id,
            LedgerEntry.issued_at >= start_date,
            LedgerEntry.issued_at <= end_date
        ))
        .where(LoyaltyProgram.merchant_id == merchant_id)
        .group_by(LoyaltyProgram.id, LoyaltyProgram.name)
    ).all()

    program_breakdown = []
    for prog in programs:
        prog_baseline = prog.customers_enrolled * float(settings.baseline_visits_per_customer_per_period or 0)
        prog_extra = max(0, prog.visits - prog_baseline)
        prog_revenue = prog_extra * float(settings.avg_spend_per_visit_kes or 0)
        prog_reward_cost = prog.redemptions * float(settings.avg_reward_cost_kes or 0)
        prog_net = prog_revenue - prog_reward_cost
        program_breakdown.append({
            "programId": str(prog.id),
            "name": prog.name,
            "stampsRequired": None,
            "customersEnrolled": prog.customers_enrolled,
            "visits": prog.visits,
            "redemptions": prog.redemptions,
            "baselineVisits": prog_baseline,
            "estimatedExtraVisits": prog_extra,
            "estimatedExtraRevenueKES": prog_revenue,
            "totalRewardCostKES": prog_reward_cost,
            "netIncrementalRevenueKES": prog_net
        })

    # Save snapshot for caching
    db.add(AnalyticsSnapshot(
        merchant_id=merchant_id,
        period_start=start_date,
        period_end=end_date,
        total_customers_enrolled=customers_enrolled,
        visits_by_enrolled_customers=visits_by_enrolled_customers,
        rewards_redeemed=rewards_redeemed_count,
        baseline_visits_estimate=baseline_visits,
        estimated_extra_visits=estimated_extra_visits,
        estimated_extra_revenue_kes=estimated_extra_revenue,
        net_incremental_revenue_kes=net_incremental_revenue,
        created_at=datetime.utcnow()
    ))
    db.commit()

    return {
        "merchantId": str(merchant_id),
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat(),
            "label": period_label
        },
        "totals": {
            "totalCustomersEnrolled": customers_enrolled,
            "stampsIssued": visits_by_enrolled_customers,
            "rewardsRedeemed": rewards_redeemed_count,
            "repeatVisitRate": repeat_visit_rate,
            "avgVisitsPerCustomer": avg_visits_per_customer
        },
        "revenueEstimation": {
            "baselineVisits": baseline_visits,
            "estimatedExtraVisits": estimated_extra_visits,
            "estimatedExtraRevenueKES": estimated_extra_revenue,
            "conservativeLowerKES": conservative_lower,
            "conservativeUpperKES": conservative_upper,
            "totalRewardCostKES": total_reward_cost,
            "netIncrementalRevenueKES": net_incremental_revenue,
            "roiPercentage": roi_percentage,
            "confidenceInterval": f"{revenue_confidence_factor * 100:.0f}%"
        },
        "anomalyFlags": anomaly_flags,
        "programs": program_breakdown
    }


def get_top_customers(db: Session, merchant_id: UUID, period: str = Period.THIS_MONTH, limit: int = 10) -> List[Dict[str, Any]]:
    merchant = db.execute(select(Merchant).where(Merchant.id == merchant_id)).scalar_one_or_none()
    if not merchant:
        raise ValueError("Merchant not found")

    settings = db.execute(select(MerchantSettings).where(MerchantSettings.merchant_id == merchant_id)).scalar_one_or_none()
    if not settings:
        # Use default settings if not configured
        settings = MerchantSettings(
            merchant_id=merchant_id,
            avg_spend_per_visit_kes=0,
            baseline_visits_per_customer_per_period=5,
            avg_reward_cost_kes=0,
            default_period=PeriodEnum.MONTH,
            monthly_subscription_kes=None
        )

    start_date, end_date, _ = resolve_period(period)

    baseline_per_customer = settings.baseline_visits_per_customer_per_period or 0

    # Top customers by visits in period
    top_customers_query = db.execute(
        select(
            User.id,
            User.name,
            User.email,
            func.count(LedgerEntry.id).label('visits')
        )
        .join(CustomerProgramMembership, User.id == CustomerProgramMembership.customer_user_id)
        .join(LedgerEntry, LedgerEntry.membership_id == CustomerProgramMembership.id)
        .join(LoyaltyProgram, CustomerProgramMembership.program_id == LoyaltyProgram.id)
        .where(
            and_(
                LoyaltyProgram.merchant_id == merchant_id,
                LedgerEntry.entry_type == 'EARN',
                LedgerEntry.issued_at >= start_date,
                LedgerEntry.issued_at <= end_date,
                CustomerProgramMembership.joined_at <= end_date
            )
        )
        .group_by(User.id, User.name, User.email)
        .order_by(func.count(LedgerEntry.id).desc())
        .limit(limit)
    ).all()

    result = []
    for user_id, name, email, visits in top_customers_query:
        customer_name = name or (email.split('@')[0] if email else 'Unknown')
        extra_visits = max(0, visits - baseline_per_customer)
        estimated_revenue = extra_visits * (settings.avg_spend_per_visit_kes or 0)
        result.append({
            "customerId": str(user_id),
            "name": customer_name,
            "visits": visits,
            "baselineVisitsEstimate": baseline_per_customer,
            "extraVisits": extra_visits,
            "estimatedRevenueKES": estimated_revenue
        })

    return result
