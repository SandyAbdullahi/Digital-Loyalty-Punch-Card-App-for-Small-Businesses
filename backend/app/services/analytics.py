from __future__ import annotations

from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum
from typing import Any, Dict, List, Tuple, TypedDict
from uuid import UUID

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from ..models.merchant import Merchant
from ..models.merchant_settings import MerchantSettings
from ..models.loyalty_program import LoyaltyProgram
from ..models.reward import Reward, RewardStatus
from ..models.stamp import Stamp
from .merchant_settings import get_merchant_settings as load_merchant_settings


class Period(str, Enum):
    THIS_MONTH = "this_month"
    LAST_3_MONTHS = "last_3_months"
    LAST_12_MONTHS = "last_12_months"


class PeriodWindow(TypedDict):
    start: datetime
    end: datetime
    label: str


def get_window(period: str) -> PeriodWindow:
    now = datetime.utcnow()
    if period == Period.THIS_MONTH:
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end = (start + timedelta(days=32)).replace(day=1)
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
        raise ValueError(f"Invalid period value: {period}")
    return {"start": start, "end": end, "label": label}


def _decimal_to_float(value: Decimal | float | None) -> float:
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


def get_settings(db: Session, merchant_id: UUID) -> Tuple[Dict[str, float], List[str]]:
    record = load_merchant_settings(db, merchant_id)
    if not record:
        defaults = {
            "avg_spend": 0.0,
            "baseline_per_customer": 0.0,
            "avg_reward_cost": 0.0,
            "subscription": 0.0,
        }
        return defaults, ["missing_settings"]

    settings = {
        "avg_spend": _decimal_to_float(record.avg_spend_per_visit_kes),
        "baseline_per_customer": _decimal_to_float(
            record.baseline_visits_per_customer_per_period
        ),
        "avg_reward_cost": _decimal_to_float(record.avg_reward_cost_kes),
        "subscription": _decimal_to_float(record.monthly_subscription_kes),
    }

    warnings: List[str] = []
    if any(value == 0 for key, value in settings.items() if key != "subscription"):
        warnings.append("missing_settings")
    return settings, warnings


def get_aggregates(
    db: Session, merchant_id: UUID, window: PeriodWindow
) -> Dict[str, Any]:
    start = window["start"]
    end = window["end"]

    stamp_filters = [
        Stamp.merchant_id == merchant_id,
        Stamp.issued_at >= start,
        Stamp.issued_at < end,
    ]

    visit_count = db.query(func.count(Stamp.id)).filter(*stamp_filters).scalar() or 0

    active_customers = (
        db.query(func.count(func.distinct(Stamp.customer_id)))
        .filter(*stamp_filters)
        .scalar()
        or 0
    )

    visit_volume_subquery = (
        db.query(
            Stamp.customer_id.label("customer_id"),
            func.count(Stamp.id).label("visit_count"),
        )
        .filter(*stamp_filters)
        .group_by(Stamp.customer_id)
        .subquery()
    )

    multi_visit_customers = (
        db.query(func.count())
        .select_from(visit_volume_subquery)
        .filter(visit_volume_subquery.c.visit_count >= 2)
        .scalar()
        or 0
    )

    reward_filters = [
        Reward.merchant_id == merchant_id,
        Reward.status == RewardStatus.REDEEMED,
        Reward.redeemed_at >= start,
        Reward.redeemed_at < end,
    ]

    redemptions = db.query(func.count(Reward.id)).filter(*reward_filters).scalar() or 0

    program_names = {
        program.id: program.name
        for program in db.query(LoyaltyProgram.id, LoyaltyProgram.name)
        .filter(LoyaltyProgram.merchant_id == merchant_id)
        .all()
    }

    program_stats: Dict[UUID, Dict[str, Any]] = {}

    visit_rows = (
        db.query(
            Stamp.program_id,
            func.count(Stamp.id).label("visits"),
            func.count(func.distinct(Stamp.customer_id)).label("customers"),
        )
        .filter(*stamp_filters)
        .group_by(Stamp.program_id)
        .all()
    )
    for row in visit_rows:
        program_stats[row.program_id] = {
            "programId": str(row.program_id),
            "name": program_names.get(row.program_id, "Programme"),
            "visits": int(row.visits or 0),
            "customersActive": int(row.customers or 0),
            "redemptions": 0,
        }

    redemption_rows = (
        db.query(
            Reward.program_id,
            func.count(Reward.id).label("redemptions"),
        )
        .filter(*reward_filters)
        .group_by(Reward.program_id)
        .all()
    )
    for row in redemption_rows:
        bucket = program_stats.setdefault(
            row.program_id,
            {
                "programId": str(row.program_id),
                "name": program_names.get(row.program_id, "Programme"),
                "visits": 0,
                "customersActive": 0,
                "redemptions": 0,
            },
        )
        bucket["redemptions"] = int(row.redemptions or 0)

    return {
        "visits": int(visit_count),
        "redemptions": int(redemptions),
        "active_customers": int(active_customers),
        "multi_visit_customers": int(multi_visit_customers),
        "programs": list(program_stats.values()),
    }


def compute_metrics(
    merchant_id: UUID,
    window: PeriodWindow,
    aggregates: Dict[str, Any],
    settings: Dict[str, float],
    extra_warnings: List[str],
) -> Dict[str, Any]:
    visits = aggregates["visits"]
    redemptions = aggregates["redemptions"]
    active_customers = aggregates["active_customers"]
    multi_visit_customers = aggregates["multi_visit_customers"]

    baseline_visits = active_customers * settings["baseline_per_customer"]
    estimated_extra_visits = max(0.0, visits - baseline_visits)
    estimated_extra_revenue = estimated_extra_visits * settings["avg_spend"]
    total_reward_cost = redemptions * settings["avg_reward_cost"]
    net_incremental_revenue = estimated_extra_revenue - total_reward_cost

    repeat_visit_rate = (
        multi_visit_customers / active_customers if active_customers else 0.0
    )
    avg_visits_per_active = visits / active_customers if active_customers else 0.0
    roi_vs_subscription = (
        net_incremental_revenue / settings["subscription"]
        if settings["subscription"] and settings["subscription"] > 0
        else None
    )

    warnings = list(extra_warnings)
    if active_customers < 10:
        warnings.append("small_sample_size")

    programs_payload: List[Dict[str, Any]] = []
    for program in aggregates["programs"]:
        baseline_prog = program["customersActive"] * settings["baseline_per_customer"]
        extra_prog = max(0.0, program["visits"] - baseline_prog)
        revenue_prog = extra_prog * settings["avg_spend"]
        cost_prog = program["redemptions"] * settings["avg_reward_cost"]
        net_prog = revenue_prog - cost_prog
        programs_payload.append(
            {
                "programId": program["programId"],
                "name": program["name"],
                "customersActive": program["customersActive"],
                "visits": program["visits"],
                "redemptions": program["redemptions"],
                "baselineVisits": baseline_prog,
                "estimatedExtraVisits": extra_prog,
                "estimatedExtraRevenueKES": revenue_prog,
                "netIncrementalRevenueKES": net_prog,
            }
        )

    kpis = {
        "totalCustomersEnrolled": active_customers,
        "stampsIssued": visits,
        "rewardsRedeemed": redemptions,
        "repeatVisitRate": repeat_visit_rate,
        "avgVisitsPerActiveCustomer": avg_visits_per_active,
    }

    missing_assumptions = "missing_settings" in warnings

    payload = {
        "merchantId": str(merchant_id),
        "period": {
            "label": window["label"],
            "start": window["start"].isoformat(),
            "end": window["end"].isoformat(),
        },
        "kpis": kpis,
        "totals": {
            "totalCustomersEnrolled": kpis["totalCustomersEnrolled"],
            "stampsIssued": kpis["stampsIssued"],
            "rewardsRedeemed": kpis["rewardsRedeemed"],
            "repeatVisitRate": repeat_visit_rate,
        },
        "revenueEstimation": {
            "baselineVisits": baseline_visits,
            "estimatedExtraVisits": estimated_extra_visits,
            "estimatedExtraRevenueKES": estimated_extra_revenue,
            "totalRewardCostKES": total_reward_cost,
            "netIncrementalRevenueKES": net_incremental_revenue,
            "roiVsSubscription": roi_vs_subscription,
            "missingAssumptions": missing_assumptions,
        },
        "engagement": {
            "activeCustomers": active_customers,
            "avgVisitsPerActive": avg_visits_per_active,
        },
        "warnings": warnings,
        "programs": programs_payload,
    }
    return payload


def get_merchant_analytics(
    db: Session, merchant_id: UUID, period: str = Period.THIS_MONTH
) -> Dict[str, Any]:
    merchant = db.execute(
        select(Merchant).where(Merchant.id == merchant_id)
    ).scalar_one_or_none()
    if not merchant:
        raise ValueError("Merchant not found")

    window = get_window(period)
    settings, warnings = get_settings(db, merchant_id)
    aggregates = get_aggregates(db, merchant_id, window)
    analytics = compute_metrics(merchant_id, window, aggregates, settings, warnings)
    analytics["warnings"] = sorted(set(analytics["warnings"]))
    return analytics


def get_top_customers(
    db: Session,
    merchant_id: UUID,
    period: str = Period.THIS_MONTH,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """
    Placeholder implementation until detailed customer analytics are implemented.
    """
    return []
