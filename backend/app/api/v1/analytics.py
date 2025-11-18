from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from datetime import datetime, timedelta, timezone

from ...core.timezone import format_local, now_local_iso

from ...db.session import get_db
from ...api.deps import get_current_user
from ...services.auth import get_user_by_email
from ...services.merchant import get_merchants_by_owner
from ...models.ledger_entry import LedgerEntry, LedgerEntryType
from ...models.customer_program_membership import CustomerProgramMembership
from ...models.user import User
from ...models.loyalty_program import LoyaltyProgram
from ...models.reward import Reward, RewardStatus

router = APIRouter()


def _get_current_merchant(db: Session, current_user: str):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        raise HTTPException(status_code=404, detail="Merchant profile not found")
    return user, merchants[0]


@router.get("/recent-activity")
def get_recent_activity(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user, merchant = _get_current_merchant(db, current_user)

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    unique_customers = (
        db.query(func.count(func.distinct(CustomerProgramMembership.customer_user_id)))
        .filter(CustomerProgramMembership.merchant_id == merchant.id)
        .scalar()
        or 0
    )

    rewards_redeemed = (
        db.query(func.count(Reward.id))
        .filter(
            Reward.merchant_id == merchant.id,
            Reward.status == RewardStatus.REDEEMED,
        )
        .scalar()
        or 0
    )

    today_scans = (
        db.query(func.count(LedgerEntry.id))
        .filter(
            LedgerEntry.merchant_id == merchant.id,
            LedgerEntry.entry_type == LedgerEntryType.EARN,
            LedgerEntry.issued_at >= today_start,
        )
        .scalar()
        or 0
    )

    reward_entries = (
        db.query(
            Reward,
            User.name.label("customer_name"),
            User.email.label("customer_email"),
            LoyaltyProgram.name.label("program_name"),
        )
        .join(User, User.id == Reward.customer_id)
        .join(LoyaltyProgram, LoyaltyProgram.id == Reward.program_id)
        .filter(
            Reward.merchant_id == merchant.id,
            Reward.status == RewardStatus.REDEEMED,
        )
        .order_by(Reward.redeemed_at.desc())
        .limit(10)
        .all()
    )

    ledger_entries = (
        db.query(
            LedgerEntry,
            User.name.label("customer_name"),
            User.email.label("customer_email"),
            LoyaltyProgram.name.label("program_name"),
        )
        .join(User, User.id == LedgerEntry.customer_id)
        .join(LoyaltyProgram, LoyaltyProgram.id == LedgerEntry.program_id)
        .filter(LedgerEntry.merchant_id == merchant.id)
        .order_by(LedgerEntry.issued_at.desc())
        .limit(25)
        .all()
    )

    items = []
    for entry, customer_name, customer_email, program_name in ledger_entries:
        entry_type = entry.entry_type
        amount = entry.amount or 0
        if entry_type == LedgerEntryType.EARN:
            rendered_type = "stamp"
        elif entry_type == LedgerEntryType.REDEEM:
            rendered_type = "reward"
        elif entry_type == LedgerEntryType.ADJUST:
            rendered_type = "manual_issue" if amount >= 0 else "manual_revoke"
        else:
            rendered_type = "stamp"

        items.append(
            {
                "id": str(entry.id),
                "type": rendered_type,
                "amount": abs(amount),
                "customer_name": customer_name,
                "customer_email": customer_email,
                "program_name": program_name,
                "timestamp": format_local(entry.issued_at or entry.created_at) or now_local_iso(),
                "message": entry.notes,
            }
        )

    for reward, customer_name, customer_email, program_name in reward_entries:
        stamped_at = reward.redeemed_at or reward.redeem_expires_at or reward.reached_at or datetime.utcnow()
        items.append(
            {
                "id": str(reward.id),
                "type": "reward",
                "amount": 1,
                "customer_name": customer_name,
                "customer_email": customer_email,
                "program_name": program_name,
                "timestamp": format_local(stamped_at) or now_local_iso(),
                "message": "Reward redeemed",
            }
        )

    items.sort(key=lambda row: row["timestamp"], reverse=True)

    return {
        "items": items,
        "unique_customers": unique_customers,
        "rewards_redeemed": rewards_redeemed,
        "today_scans": today_scans,
    }


@router.get("/scans-last-7-days")
def get_scans_last_7_days(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user, merchant = _get_current_merchant(db, current_user)

    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    counts = {day.date(): 0 for day in days}

    entries = (
        db.query(LedgerEntry.issued_at)
        .filter(
            LedgerEntry.merchant_id == merchant.id,
            LedgerEntry.entry_type == LedgerEntryType.EARN,
            LedgerEntry.issued_at >= days[0],
        )
        .all()
    )

    for (issued_at,) in entries:
        if issued_at is None:
            continue
        day_key = issued_at.date()
        if day_key in counts:
            counts[day_key] += 1

    scans = [counts[day.date()] for day in days]
    labels = [day.strftime("%a") for day in days]

    return {"scans": scans, "labels": labels}
