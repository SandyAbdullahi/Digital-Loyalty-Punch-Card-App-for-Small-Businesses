import json
import os
from typing import List
from uuid import UUID, uuid4
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status, Form, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func

from ...db.session import get_db
from ...api.deps import get_current_user
from ...services.auth import get_user_by_email
from ...services.merchant import (
    create_merchant,
    get_merchant,
    get_merchants_by_owner,
    update_merchant,
    delete_merchant,
    create_location,
    get_location,
    get_locations_by_merchant,
    update_location,
    delete_location,
    search_merchants,
)
from ...services.analytics import get_merchant_analytics, get_top_customers, Period
from ...core.timezone import to_local, now_local, now_local_iso, format_local
from ...api.v1.websocket import get_websocket_manager
from ...services.merchant_settings import get_merchant_settings, upsert_merchant_settings
from ...schemas.merchant import Merchant, MerchantCreate, MerchantUpdate
from ...schemas.location import Location, LocationCreate, LocationUpdate
from ...schemas.reward import RedeemCodeConfirm, StampIssueRequest, RedeemRequest
from ...schemas.merchant_settings import MerchantSettings, MerchantSettingsCreate, MerchantSettingsUpdate
from ...schemas.customer import CustomerDetail
from ...models.ledger_entry import LedgerEntry, LedgerEntryType
from ...models.reward import Reward as RewardModel, RewardStatus
from ...models.customer_program_membership import CustomerProgramMembership
from ...models.loyalty_program import LoyaltyProgram
from ...models.merchant import Merchant as MerchantModel
from ...models.user import User
from ...services.reward_service import (
    issue_stamp,
    redeem_reward,
    revoke_last_stamp,
    get_reward_state,
)
from ...services.membership import earn_stamps, adjust_balance

router = APIRouter()


def _parse_rule(rule_data):
    if isinstance(rule_data, str):
        try:
            return json.loads(rule_data)
        except json.JSONDecodeError:
            return {}
    if isinstance(rule_data, dict):
        return rule_data
    return {}


def _program_threshold(program: LoyaltyProgram) -> int:
    redeem_rule = _parse_rule(program.redeem_rule)
    earn_rule = _parse_rule(program.earn_rule)
    return (
        program.stamps_required
        or program.reward_threshold
        or redeem_rule.get("stamps_needed")
        or redeem_rule.get("threshold")
        or redeem_rule.get("reward_threshold")
        or redeem_rule.get("max_value")
        or earn_rule.get("stamps_needed")
        or earn_rule.get("threshold")
        or 10
    )


def _broadcast_reward_snapshot(ws_manager, customer_id: UUID, reward: RewardModel | None) -> None:
    if not reward:
        return

    status_value = reward.status.value if isinstance(reward.status, RewardStatus) else str(reward.status)
    timestamp = format_local(reward.redeemed_at or reward.reached_at) or now_local_iso()
    ws_manager.broadcast_reward_status_sync(
        str(customer_id),
        {
            "reward_id": str(reward.id),
            "program_id": str(reward.program_id),
            "status": status_value,
            "timestamp": timestamp,
        },
    )


# Merchant profile
@router.put("/profile")
async def update_merchant_profile(
    name: str = Form(None),
    description: str = Form(None),
    website: str = Form(None),
    address: str = Form(None),
    phone: str = Form(None),
    logo: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner, update_merchant
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        raise HTTPException(status_code=404, detail="Merchant not found")

    merchant = merchants[0]
    update_data = {}
    if name is not None:
        update_data["display_name"] = name
    if description is not None:
        update_data["description"] = description
    if website is not None:
        update_data["website"] = website
    if address is not None:
        update_data["address"] = address
    if phone is not None:
        update_data["phone"] = phone

    if logo and logo.filename:
        contents = await logo.read()
        if not logo.content_type or not logo.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only images are allowed")
        from ...services.r2_client import upload_bytes

        update_data["logo_url"] = upload_bytes(
            prefix=f"merchants/{merchant.id}/logos",
            filename=logo.filename,
            data=contents,
            content_type=logo.content_type,
        )

    if update_data:
        merchant_update = MerchantUpdate(**update_data)
        updated_merchant = update_merchant(db, merchant.id, merchant_update)
        if not updated_merchant:
            raise HTTPException(status_code=404, detail="Merchant not found")
        return updated_merchant
    return merchant

# Merchant locations
@router.get("/locations", response_model=List[Location])
def get_merchant_locations(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        return []

    merchant = merchants[0]
    return get_locations_by_merchant(db, merchant.id)


# Owner CRUD for merchants
@router.post("/", response_model=Merchant)
def create_merchant_endpoint(
    merchant: MerchantCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    # Assume current_user is email, get user id
    from ...services.auth import get_user_by_email
    user = get_user_by_email(db, current_user)
    if not user or user.role != "merchant":
        raise HTTPException(status_code=403, detail="Not authorized")
    return create_merchant(db, merchant, user.id)


@router.get("/", response_model=List[Merchant])
def read_merchants(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
  ):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_merchants_by_owner(db, user.id)


@router.get("/customers")
def get_merchant_customers(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    from ...services.customer_stats_service import get_customer_stats
    from ...models.customer_program_membership import CustomerProgramMembership
    from ...models.user import User
    from ...models.ledger_entry import LedgerEntry
    from sqlalchemy import func
    import json

    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        return []

    merchant = merchants[0]
    program_ids = [p.id for p in merchant.programs]
    if not program_ids:
        return []

    memberships = (
        db.query(CustomerProgramMembership)
        .filter(CustomerProgramMembership.program_id.in_(program_ids))
        .all()
    )

    # Group memberships by customer
    customer_memberships = {}
    for membership in memberships:
        customer_id = membership.customer_user_id
        if customer_id not in customer_memberships:
            customer_memberships[customer_id] = []
        customer_memberships[customer_id].append(membership)

    customer_ids = list(customer_memberships.keys())
    if not customer_ids:
        return []

    lifetime_stamps_rows = (
        db.query(
            LedgerEntry.customer_id,
            func.coalesce(func.sum(LedgerEntry.amount), 0).label("lifetime_stamps"),
        )
        .filter(
            LedgerEntry.merchant_id == merchant.id,
            LedgerEntry.customer_id.in_(customer_ids),
            LedgerEntry.entry_type == LedgerEntryType.EARN,
        )
        .group_by(LedgerEntry.customer_id)
        .all()
    )
    lifetime_map = {
        str(row.customer_id): float(row.lifetime_stamps or 0) for row in lifetime_stamps_rows
    }

    customers = []
    for customer_id, mems in customer_memberships.items():
        customer = db.query(User).filter(User.id == customer_id).first()
        if not customer:
            continue

        # Get customer stats
        customer_stats = get_customer_stats(db, customer_id)

        total_stamps = sum(m.current_balance for m in mems)
        lifetime_stamps = lifetime_map.get(str(customer_id), float(total_stamps))
        avg_stamps_per_program = round(lifetime_stamps / len(mems), 2) if mems else 0

        membership_ids = [m.id for m in mems]
        last_visit = (
            db.query(LedgerEntry.created_at)
            .filter(LedgerEntry.membership_id.in_(membership_ids))
            .order_by(desc(LedgerEntry.created_at))
            .first()
        )

        programs = []
        for membership in mems:
            redeem_source = membership.program.redeem_rule if membership.program else {}
            if isinstance(redeem_source, str):
                try:
                    redeem_rule = json.loads(redeem_source)
                except json.JSONDecodeError:
                    redeem_rule = {}
            elif isinstance(redeem_source, dict):
                redeem_rule = redeem_source
            else:
                redeem_rule = {}
            threshold = redeem_rule.get("reward_threshold", 10)

            programs.append({
                "id": str(membership.program_id),
                "name": membership.program.name,
                "progress": membership.current_balance,
                "threshold": threshold,
            })

        customers.append(
            {
                "id": str(customer.id),
                "name": customer.name or customer.email.split("@")[0],
                "email": customer.email,
                "avatar": customer.avatar_url,
                "totalStamps": total_stamps,
                "lifetime_stamps": lifetime_stamps,
                "avg_stamps_per_program": avg_stamps_per_program,
                "last_visit": last_visit[0].isoformat() if last_visit else None,
                "last_visit_display": last_visit[0].strftime('%B %d, %Y - %I:%M %p') if last_visit else None,
                "programs": programs,
                "lifetime_total_visits": customer_stats.total_visits if customer_stats else 0,
                "lifetime_total_revenue": customer_stats.total_revenue if customer_stats else 0.0,
                "lifetime_rewards_redeemed": customer_stats.rewards_redeemed if customer_stats else 0,
                "lifetime_avg_basket_size": (customer_stats.total_revenue / customer_stats.total_visits if customer_stats and customer_stats.total_visits > 0 else 0.0) if customer_stats else 0.0,
            }
        )

    return customers


@router.get("/customers/{customer_id}", response_model=CustomerDetail)
def get_customer_detail(
    customer_id: UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    from ...services.customer_stats_service import get_customer_stats
    from ...models.customer_program_membership import CustomerProgramMembership
    from ...models.user import User

    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        raise HTTPException(status_code=404, detail="Merchant not found")

    merchant = merchants[0]

    memberships = (
        db.query(CustomerProgramMembership)
        .options(joinedload(CustomerProgramMembership.program))
        .filter(
            CustomerProgramMembership.customer_user_id == customer_id,
            CustomerProgramMembership.merchant_id == merchant.id,
        )
        .all()
    )

    if not memberships:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer = db.query(User).filter(User.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")

    # Get customer stats
    customer_stats = get_customer_stats(db, customer_id)

    membership_ids = [membership.id for membership in memberships]
    total_stamps = sum(m.current_balance for m in memberships)

    programs = []
    for membership in memberships:
        program = membership.program
        program_name = program.name if program else "Program"
        threshold = _program_threshold(program) if program else 10
        programs.append(
            {
                "id": str(membership.program_id),
                "name": program_name,
                "progress": membership.current_balance,
                "threshold": threshold,
                "current_cycle": membership.current_cycle,
                "joined_at": format_local(membership.joined_at),
            }
        )

    last_visit_at = customer_stats.last_visit_at if customer_stats else None
    last_visit_iso = last_visit_at.isoformat() if last_visit_at else None
    last_visit_display = format_local(last_visit_at) if last_visit_at else None

    valid_statuses = [
        RewardStatus.REDEEMABLE.value,
        RewardStatus.REDEEMED.value,
        RewardStatus.EXPIRED.value,
    ]

    rewards = (
        db.query(RewardModel, LoyaltyProgram)
        .join(LoyaltyProgram, RewardModel.program_id == LoyaltyProgram.id)
        .filter(
            RewardModel.merchant_id == merchant.id,
            RewardModel.customer_id == customer_id,
            RewardModel.status.in_(valid_statuses),
        )
        .order_by(desc(RewardModel.reached_at))
        .limit(30)
        .all()
    )

    redemption_history: List[dict] = []
    seen_reward_ids: set[str] = set()
    redeemed_total = 0
    redeemable_total = 0
    expired_total = 0

    for reward, program in rewards:
        reward_id = str(reward.id)
        if reward_id in seen_reward_ids:
            continue
        seen_reward_ids.add(reward_id)
        status_value = (
            reward.status.value
            if isinstance(reward.status, RewardStatus)
            else str(reward.status)
        )
        if status_value == RewardStatus.REDEEMED.value:
            redeemed_total += 1
        elif status_value == RewardStatus.REDEEMABLE.value:
            redeemable_total += 1
        elif status_value == RewardStatus.EXPIRED.value:
            expired_total += 1

        redemption_history.append(
            {
                "id": reward_id,
                "program_id": str(reward.program_id),
                "program_name": program.name if program else "Program",
                "status": status_value,
                "reached_at": format_local(reward.reached_at),
                "redeemed_at": format_local(reward.redeemed_at),
                "voucher_code": reward.voucher_code,
                "cycle": reward.cycle,
            }
        )

    ledger_entries = (
        db.query(LedgerEntry)
        .filter(
            LedgerEntry.merchant_id == merchant.id,
            LedgerEntry.customer_id == customer_id,
        )
        .order_by(desc(LedgerEntry.created_at))
        .limit(25)
        .all()
    )

    total_visits = customer_stats.total_visits if customer_stats else 0

    # Get lifetime stamps from ledger for insights
    lifetime_stamps_query = (
        db.query(func.coalesce(func.sum(LedgerEntry.amount), 0))
        .filter(
            LedgerEntry.merchant_id == merchant.id,
            LedgerEntry.customer_id == customer_id,
            LedgerEntry.entry_type == LedgerEntryType.EARN,
        )
    )
    lifetime_stamps = lifetime_stamps_query.scalar() or 0

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_visits = (
        db.query(func.count(LedgerEntry.id))
        .filter(
            LedgerEntry.merchant_id == merchant.id,
            LedgerEntry.customer_id == customer_id,
            LedgerEntry.entry_type == LedgerEntryType.EARN,
            LedgerEntry.created_at >= thirty_days_ago,
        )
        .scalar()
        or 0
    )

    recent_activity: List[dict] = []
    for entry in ledger_entries:
        entry_type = (
            entry.entry_type.value
            if hasattr(entry.entry_type, "value")
            else str(entry.entry_type)
        )
        timestamp = format_local(entry.created_at)
        related_program = next(
            (p for p in programs if p["id"] == str(entry.program_id)), None
        )
        recent_activity.append(
            {
                "id": str(entry.id),
                "program_id": str(entry.program_id),
                "program_name": related_program["name"] if related_program else None,
                "entry_type": entry_type,
                "change": entry.amount,
                "timestamp": timestamp,
                "notes": entry.notes,
            }
        )

    # Lifetime metrics
    lifetime_total_visits = customer_stats.total_visits if customer_stats else 0
    lifetime_total_revenue = customer_stats.total_revenue if customer_stats else 0.0
    lifetime_rewards_redeemed = customer_stats.rewards_redeemed if customer_stats else 0
    lifetime_avg_basket_size = lifetime_total_revenue / lifetime_total_visits if lifetime_total_visits > 0 else 0.0

    return {
        "id": str(customer.id),
        "name": customer.name or customer.email.split("@")[0],
        "email": customer.email,
        "avatar": customer.avatar_url,
        "total_stamps": total_stamps,
        "lifetime_stamps": lifetime_stamps,
        "avg_stamps_per_program": round(
            lifetime_stamps / len(programs), 2
        )
        if programs
        else 0,
        "last_visit": last_visit_iso,
        "last_visit_display": last_visit_display,
        "programs": programs,
        "redemption_history": redemption_history,
        "recent_activity": recent_activity,
        "reward_summary": {
            "redeemed": redeemed_total,
            "redeemable": redeemable_total,
            "expired": expired_total,
        },
        "insights": {
            "total_programs": len(programs),
            "lifetime_visits": total_visits,
            "visits_last_30_days": recent_visits,
            "rewards_redeemed": redeemed_total,
            "rewards_pending": redeemable_total,
            "rewards_expired": expired_total,
            "average_stamps_per_program": round(
                lifetime_stamps / len(programs), 2
            )
            if programs
            else 0,
        },
        "lifetime_total_visits": lifetime_total_visits,
        "lifetime_total_revenue": lifetime_total_revenue,
        "lifetime_rewards_redeemed": lifetime_rewards_redeemed,
        "lifetime_avg_basket_size": lifetime_avg_basket_size,
    }


@router.get("/{merchant_id}/analytics", response_model=dict)
def get_merchant_analytics_endpoint(
    merchant_id: UUID,
    period: str = "this_month",
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner

    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    merchants = get_merchants_by_owner(db, user.id)
    if not merchants or merchants[0].id != merchant_id:
        raise HTTPException(status_code=404, detail="Merchant not found")

    return get_merchant_analytics(db, merchant_id, period)


@router.get("/{merchant_id}/analytics/customers")
def get_top_customers_endpoint(
    merchant_id: UUID,
    period: str = "this_month",
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner

    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    merchants = get_merchants_by_owner(db, user.id)
    if not merchants or merchants[0].id != merchant_id:
        raise HTTPException(status_code=404, detail="Merchant not found")

    customers = get_top_customers(db, merchant_id, period, limit)
    return {"customers": customers}


# Merchant rewards
@router.get("/rewards")
def get_merchant_rewards(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        user = get_user_by_email(db, current_user)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        merchants = get_merchants_by_owner(db, user.id)
        if not merchants:
            return []

        merchant = merchants[0]

        reward_rows = (
            db.query(RewardModel, LoyaltyProgram, User)
            .join(LoyaltyProgram, RewardModel.program_id == LoyaltyProgram.id)
            .join(User, RewardModel.customer_id == User.id)
            .filter(
                RewardModel.merchant_id == merchant.id,
                RewardModel.status.in_(
                    [
                        RewardStatus.REDEEMABLE,
                        RewardStatus.REDEEMED,
                        RewardStatus.EXPIRED,
                        RewardStatus.REDEEMABLE.value,
                        RewardStatus.REDEEMED.value,
                        RewardStatus.EXPIRED.value,
                    ]
                ),
            )
            .order_by(desc(RewardModel.reached_at))
            .limit(100)
            .all()
        )

        rewards: List[dict] = []
        now_iso = now_local_iso()

        for reward, program, customer in reward_rows:
            program_name = program.name or "Program"
            customer_label = customer.name or customer.email.split("@")[0]

            expires_at_iso = format_local(reward.redeem_expires_at)
            timestamp_iso = format_local(reward.reached_at) or now_iso

            raw_status = reward.status or RewardStatus.INACTIVE.value
            status_value = raw_status.value if isinstance(raw_status, RewardStatus) else str(raw_status)

            if status_value == RewardStatus.REDEEMED.value:
                if reward.redeemed_at:
                    timestamp_iso = format_local(reward.redeemed_at) or timestamp_iso
            elif status_value == RewardStatus.EXPIRED.value:
                if expires_at_iso:
                    timestamp_iso = expires_at_iso

            rewards.append(
                {
                    "id": str(reward.id),
                    "program": program_name,
                    "customer": customer_label,
                    "date": timestamp_iso,
                    "status": status_value,
                    "amount": "1",
                    "code": reward.voucher_code if status_value == RewardStatus.REDEEMABLE.value else None,
                    "expires_at": expires_at_iso,
                }
            )

        return rewards
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Error in get_merchant_rewards: {exc}")
        raise HTTPException(status_code=500, detail="Failed to load rewards")


@router.get("/{merchant_id}", response_model=Merchant)
def read_merchant(
    merchant_id: UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    from ...services.auth import get_user_by_email
    merchant = get_merchant(db, merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    user = get_user_by_email(db, current_user)
    if merchant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return merchant


@router.put("/{merchant_id}", response_model=Merchant)
def update_merchant_endpoint(
    merchant_id: UUID,
    merchant_update: MerchantUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    from ...services.auth import get_user_by_email
    merchant = get_merchant(db, merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    user = get_user_by_email(db, current_user)
    if merchant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    updated_merchant = update_merchant(db, merchant_id, merchant_update)
    if not updated_merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return updated_merchant


@router.delete("/{merchant_id}")
def delete_merchant_endpoint(
    merchant_id: UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    from ...services.auth import get_user_by_email
    merchant = get_merchant(db, merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    user = get_user_by_email(db, current_user)
    if merchant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if delete_merchant(db, merchant_id):
        return {"message": "Merchant deleted"}
    raise HTTPException(status_code=404, detail="Merchant not found")


# Merchant Settings
@router.get("/{merchant_id}/settings", response_model=MerchantSettings)
def get_merchant_settings_endpoint(
    merchant_id: UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    from ...services.auth import get_user_by_email
    merchant = get_merchant(db, merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    user = get_user_by_email(db, current_user)
    if merchant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    settings = get_merchant_settings(db, merchant_id)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings


@router.put("/{merchant_id}/settings", response_model=MerchantSettings)
def update_merchant_settings_endpoint(
    merchant_id: UUID,
    settings: MerchantSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    from ...services.auth import get_user_by_email
    merchant = get_merchant(db, merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    user = get_user_by_email(db, current_user)
    if merchant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    updated_settings = upsert_merchant_settings(db, merchant_id, settings)
    return MerchantSettings.model_validate(updated_settings)


# Locations CRUD
@router.post("/{merchant_id}/locations", response_model=Location)
def create_location_endpoint(
    merchant_id: UUID,
    location: LocationCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    from ...services.auth import get_user_by_email
    merchant = get_merchant(db, merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    user = get_user_by_email(db, current_user)
    if merchant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return create_location(db, location, merchant_id)


@router.get("/{merchant_id}/locations", response_model=List[Location])
def read_locations(
    merchant_id: UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    from ...services.auth import get_user_by_email
    merchant = get_merchant(db, merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    user = get_user_by_email(db, current_user)
    if merchant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_locations_by_merchant(db, merchant_id)


@router.put("/{merchant_id}/locations/{location_id}", response_model=Location)
def update_location_endpoint(
    merchant_id: UUID,
    location_id: UUID,
    location_update: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    from ...services.auth import get_user_by_email
    merchant = get_merchant(db, merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    user = get_user_by_email(db, current_user)
    if merchant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    location = get_location(db, location_id)
    if not location or location.merchant_id != merchant_id:
        raise HTTPException(status_code=404, detail="Location not found")
    updated_location = update_location(db, location_id, location_update)
    if not updated_location:
        raise HTTPException(status_code=404, detail="Location not found")
    return updated_location


@router.delete("/{merchant_id}/locations/{location_id}")
def delete_location_endpoint(
    merchant_id: UUID,
    location_id: UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    from ...services.auth import get_user_by_email
    merchant = get_merchant(db, merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    user = get_user_by_email(db, current_user)
    if merchant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    location = get_location(db, location_id)
    if not location or location.merchant_id != merchant_id:
        raise HTTPException(status_code=404, detail="Location not found")
    if delete_location(db, location_id):
        return {"message": "Location deleted"}
    raise HTTPException(status_code=404, detail="Location not found")


# Redeem code verification
@router.post("/redeem-code")
def redeem_code(
    payload: RedeemCodeConfirm,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        raise HTTPException(status_code=404, detail="Merchant not found")

    merchant = merchants[0]

    code_value = payload.code.strip()
    if not code_value:
        raise HTTPException(status_code=400, detail="Redeem code is required")

    reward = (
        db.query(RewardModel)
        .filter(
            RewardModel.voucher_code == code_value,
            RewardModel.merchant_id == merchant.id,
        )
        .first()
    )

    if not reward:
        raise HTTPException(status_code=404, detail="Invalid or already used code")

    if reward.status != RewardStatus.REDEEMABLE:
        raise HTTPException(status_code=400, detail="Reward not redeemable")

    expires_at = reward.redeem_expires_at
    expires_local = to_local(expires_at)
    if expires_local and expires_local < now_local():
        raise HTTPException(status_code=400, detail="Code has expired")

    try:
        updated = redeem_reward(
            db,
            reward_id=reward.id,
            staff_id=user.id,
            merchant_id=merchant.id,
        )
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except TimeoutError:
        raise HTTPException(status_code=410, detail="Reward expired")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    customer = db.query(User).filter(User.id == reward.customer_id).first()
    program = db.query(LoyaltyProgram).filter(LoyaltyProgram.id == reward.program_id).first()
    enrollment = (
        db.query(CustomerProgramMembership)
        .filter(CustomerProgramMembership.id == reward.enrollment_id)
        .first()
    )
    new_balance = enrollment.current_balance if enrollment else 0
    timestamp = format_local(updated.redeemed_at) or now_local_iso()

    ws_manager = get_websocket_manager()
    try:
        ws_manager.broadcast_reward_status_sync(
            str(updated.customer_id),
            {
                "reward_id": str(updated.id),
                "program_id": str(updated.program_id),
                "status": updated.status,
                "timestamp": timestamp,
            },
        )
        ws_manager.broadcast_stamp_update_sync(
            str(updated.customer_id),
            str(updated.program_id),
            new_balance,
        )
        ws_manager.broadcast_merchant_reward_update_sync(
            str(merchant.owner_user_id),
            {
                "reward_id": str(updated.id),
                "status": updated.status,
                "program_id": str(updated.program_id),
                "timestamp": timestamp,
            },
        )
        ws_manager.broadcast_merchant_customer_update_sync(
            str(merchant.owner_user_id),
            {
                "customer_id": str(updated.customer_id),
                "customer_name": customer.name or customer.email.split("@")[0] if customer else "Customer",
                "program_id": str(updated.program_id),
                "program_name": program.name if program else "Program",
                "new_balance": new_balance,
                "timestamp": timestamp,
            },
        )
    except Exception as exc:
        print(f"Failed to broadcast redeem code update: {exc}")

    return {
        "id": str(updated.id),
        "program": program.name if program else "Program",
        "customer": customer.name or customer.email.split("@")[0] if customer else "Customer",
        "amount": "1",
        "status": updated.status,
    }


# Manual stamp actions
@router.post("/customers/{customer_id}/add-stamp")
def add_manual_stamp(
    customer_id: UUID,
    program_id: str = Form(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    from ...services.membership import earn_stamps
    from ...api.v1.websocket import get_websocket_manager
    from ...models.customer_program_membership import CustomerProgramMembership

    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        raise HTTPException(status_code=404, detail="Merchant not found")
    merchant = merchants[0]
    program_ids = [p.id for p in merchant.programs]
    try:
        program_uuid = UUID(program_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid program_id")
    if program_uuid not in program_ids:
        raise HTTPException(status_code=403, detail="Not authorized")

    program = db.query(LoyaltyProgram).filter(LoyaltyProgram.id == program_uuid).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    stamp_limit = _program_threshold(program)

    membership = db.query(CustomerProgramMembership).filter(
        CustomerProgramMembership.customer_user_id == customer_id,
        CustomerProgramMembership.program_id == program_uuid
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    current_balance = membership.current_balance or 0
    ws_manager = get_websocket_manager()

    if program.logic_type == "punch_card":
        if current_balance >= stamp_limit:
            raise HTTPException(
                status_code=400,
                detail="Customer already has the maximum stamps for this reward.",
            )
        try:
            stamp = issue_stamp(
                db,
                enrollment_id=membership.id,
                tx_id=f"manual_{uuid4().hex}",
                staff_id=user.id,
            )
            db.refresh(membership)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))

        new_balance = membership.current_balance or 0
        ws_manager.broadcast_stamp_update_sync(str(customer_id), program_id, new_balance)
        ws_manager.broadcast_merchant_customer_update_sync(
            str(merchant.owner_user_id),
            {
                "customer_id": str(customer_id),
                "program_id": str(program_uuid),
                "delta": 1,
                "new_balance": new_balance,
                "program_name": program.name,
                "timestamp": now_local_iso(),
            },
        )
        reward = get_reward_state(db, membership.id)
        _broadcast_reward_snapshot(ws_manager, customer_id, reward)
        return {"message": "Stamp added successfully", "stamp_id": str(stamp.id)}

    if current_balance >= stamp_limit:
        raise HTTPException(
            status_code=400,
            detail="Customer already has the maximum points for this reward.",
        )

    result = earn_stamps(db, membership.id, 1, "manual", "manual", notes="manual_issue")
    if result:
        new_balance = result.current_balance or 0
        ws_manager.broadcast_stamp_update_sync(str(customer_id), program_id, new_balance)
        ws_manager.broadcast_merchant_customer_update_sync(
            str(merchant.owner_user_id),
            {
                "customer_id": str(customer_id),
                "program_id": str(program_uuid),
                "delta": 1,
                "new_balance": new_balance,
                "program_name": program.name,
                "timestamp": now_local_iso(),
            },
        )
        reward = get_reward_state(db, membership.id)
        _broadcast_reward_snapshot(ws_manager, customer_id, reward)
        return {"message": "Points added successfully"}

    raise HTTPException(status_code=400, detail="Failed to add stamp")

@router.post("/customers/{customer_id}/revoke-stamp")
def revoke_manual_stamp(
    customer_id: UUID,
    program_id: str = Form(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
  ):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    from ...services.membership import adjust_balance
    from ...models.customer_program_membership import CustomerProgramMembership

    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        raise HTTPException(status_code=404, detail="Merchant not found")
    merchant = merchants[0]
    program_ids = [p.id for p in merchant.programs]
    try:
        program_uuid = UUID(program_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid program_id")
    if program_uuid not in program_ids:
        raise HTTPException(status_code=403, detail="Not authorized")

    membership = db.query(CustomerProgramMembership).filter(
        CustomerProgramMembership.customer_user_id == customer_id,
        CustomerProgramMembership.program_id == program_uuid
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    program = db.query(LoyaltyProgram).filter(LoyaltyProgram.id == program_uuid).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    current_balance = membership.current_balance or 0
    ws_manager = get_websocket_manager()

    if program.logic_type == "punch_card":
        try:
            updated = revoke_last_stamp(db, enrollment_id=membership.id, staff_id=user.id)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        new_balance = updated.current_balance or 0
        ws_manager.broadcast_stamp_update_sync(str(customer_id), program_id, new_balance)
        ws_manager.broadcast_merchant_customer_update_sync(
            str(merchant.owner_user_id),
            {
                "customer_id": str(customer_id),
                "program_id": str(program_uuid),
                "delta": -1,
                "new_balance": new_balance,
                "program_name": program.name,
                "timestamp": now_local_iso(),
            },
        )
        reward = get_reward_state(db, membership.id)
        _broadcast_reward_snapshot(ws_manager, customer_id, reward)
        return {"message": "Stamp revoked", "balance": new_balance}

    if current_balance <= 0:
        raise HTTPException(status_code=400, detail="Customer has no stamps to revoke")

    result = adjust_balance(db, membership.id, -1, "manual_revoke", "manual")
    if result:
        new_balance = result.current_balance or 0
        ws_manager.broadcast_stamp_update_sync(str(customer_id), program_id, new_balance)
        ws_manager.broadcast_merchant_customer_update_sync(
            str(merchant.owner_user_id),
            {
                "customer_id": str(customer_id),
                "program_id": str(program_uuid),
                "delta": -1,
                "new_balance": new_balance,
                "program_name": program.name,
                "timestamp": now_local_iso(),
            },
        )
        reward = get_reward_state(db, membership.id)
        _broadcast_reward_snapshot(ws_manager, customer_id, reward)
        return {"message": "Stamp revoked successfully", "balance": new_balance}

    raise HTTPException(status_code=400, detail="Failed to revoke stamp")

@router.delete("/customers/{customer_id}")
def delete_customer(
    customer_id: UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    from ...models.customer_program_membership import CustomerProgramMembership
    from ...models.redeem_code import RedeemCode
    from ...models.ledger_entry import LedgerEntry

    # Verify merchant
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        raise HTTPException(status_code=404, detail="Merchant not found")
    merchant = merchants[0]
    program_ids = [p.id for p in merchant.programs]

    # Delete all memberships for this customer in the merchant's programs
    memberships = db.query(CustomerProgramMembership).filter(
        CustomerProgramMembership.customer_user_id == customer_id,
        CustomerProgramMembership.program_id.in_(program_ids)
    ).all()

    # Delete related records first to avoid foreign key constraint violations
    membership_ids = [m.id for m in memberships]
    if membership_ids:
        # Delete rewards for these enrollments
        db.query(RedeemCode).filter(RedeemCode.enrollment_id.in_(membership_ids)).delete(
            synchronize_session=False
        )
        # Delete ledger entries
        db.query(LedgerEntry).filter(LedgerEntry.membership_id.in_(membership_ids)).delete(
            synchronize_session=False
        )

    # Now delete the memberships
    for membership in memberships:
        db.delete(membership)
    db.commit()
    return {"message": "Customer removed from all programs"}


# Public search
@router.get("/search", response_model=List[Merchant])
def search_merchants_endpoint(
    query: str = Query(None),
    near_lat: float = Query(None),
    near_lng: float = Query(None),
    radius_m: float = Query(None),
    db: Session = Depends(get_db),
):
    return search_merchants(db, query, near_lat, near_lng, radius_m)


# Reward logic endpoints
@router.post("/enrollments/{enrollment_id}/stamps")
def issue_stamp_endpoint(
    enrollment_id: UUID,
    request: StampIssueRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if user is staff/owner of the merchant
    from ...models import CustomerProgramMembership
    enrollment = db.query(CustomerProgramMembership).filter(CustomerProgramMembership.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    merchant = db.query(MerchantModel).filter(MerchantModel.id == enrollment.merchant_id).first()
    if merchant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    try:
        stamp = issue_stamp(db, enrollment_id=enrollment_id, tx_id=request.tx_id, staff_id=request.issued_by_staff_id or user.id)
        ws_manager = get_websocket_manager()
        ws_manager.broadcast_stamp_update_sync(
            str(enrollment.customer_user_id),
            str(enrollment.program_id),
            enrollment.current_balance,
        )
        ws_manager.broadcast_merchant_customer_update_sync(
            str(merchant.owner_user_id),
            {
                "customer_id": str(enrollment.customer_user_id),
                "program_id": str(enrollment.program_id),
                "delta": 1,
                "new_balance": enrollment.current_balance,
                "program_name": program.name,
                "timestamp": now_local_iso(),
            },
        )
        return {"stamp": stamp, "message": "Stamp issued"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/rewards/{reward_id}/redeem")
def redeem_reward_endpoint(
    reward_id: UUID,
    request: RedeemRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    from ...models import Reward
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    merchant = db.query(MerchantModel).filter(MerchantModel.id == reward.merchant_id).first()
    if merchant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    customer = db.query(User).filter(User.id == reward.customer_id).first()

    code_value = (request.voucher_code or "").strip()
    if not code_value:
        raise HTTPException(status_code=400, detail="Voucher code is required")
    if reward.voucher_code and reward.voucher_code != code_value:
        raise HTTPException(status_code=409, detail="Voucher code mismatch")

    try:
        redeemed_reward = redeem_reward(
            db,
            reward_id=reward.id,
            staff_id=request.redeemed_by_staff_id or user.id,
            merchant_id=reward.merchant_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except TimeoutError as e:
        raise HTTPException(status_code=410, detail=str(e))

    program = (
        db.query(LoyaltyProgram)
        .options(joinedload(LoyaltyProgram.merchant))
        .filter(LoyaltyProgram.id == redeemed_reward.program_id)
        .first()
    )
    enrollment = (
        db.query(CustomerProgramMembership)
        .filter(CustomerProgramMembership.id == redeemed_reward.enrollment_id)
        .first()
    )
    current_balance = enrollment.current_balance if enrollment else 0
    timestamp = format_local(redeemed_reward.redeemed_at) or now_local_iso()

    ws_manager = get_websocket_manager()
    try:
        ws_manager.broadcast_reward_status_sync(
            str(redeemed_reward.customer_id),
            {
                "reward_id": str(redeemed_reward.id),
                "program_id": str(redeemed_reward.program_id),
                "status": redeemed_reward.status,
                "timestamp": timestamp,
            },
        )
        ws_manager.broadcast_stamp_update_sync(
            str(redeemed_reward.customer_id),
            str(redeemed_reward.program_id),
            current_balance,
        )
        if program and program.merchant:
            customer_name = (
                customer.name or customer.email.split("@")[0]
                if customer
                else "Customer"
            )
            ws_manager.broadcast_merchant_reward_update_sync(
                str(program.merchant.owner_user_id),
                {
                    "reward_id": str(redeemed_reward.id),
                    "status": redeemed_reward.status,
                    "program_id": str(redeemed_reward.program_id),
                    "timestamp": timestamp,
                },
            )
            ws_manager.broadcast_merchant_customer_update_sync(
                str(program.merchant.owner_user_id),
                {
                    "customer_id": str(redeemed_reward.customer_id),
                    "customer_name": customer_name,
                    "program_id": str(redeemed_reward.program_id),
                    "program_name": program.name,
                    "new_balance": current_balance,
                    "timestamp": timestamp,
                },
            )
    except Exception as exc:
        print(f"Failed to broadcast merchant reward redeem: {exc}")

    return {"reward": redeemed_reward, "message": "Reward redeemed"}
