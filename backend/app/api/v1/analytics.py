from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from datetime import datetime, timedelta, timezone

from ...db.session import get_db
from ...api.deps import get_current_user
from ...services.auth import get_user_by_email
from ...services.merchant import get_merchants_by_owner
from ...models.ledger_entry import LedgerEntry, LedgerEntryType
from ...models.customer_program_membership import CustomerProgramMembership
from ...models.user import User

router = APIRouter()

@router.get("/recent-activity")
def get_recent_activity(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        return {"items": [], "unique_customers": 0, "rewards_redeemed": 0, "today_scans": 0}

    merchant = merchants[0]
    program_ids = [p.id for p in merchant.programs]

    # Recent ledger entries
    recent_entries = db.query(LedgerEntry).join(
        CustomerProgramMembership, LedgerEntry.membership_id == CustomerProgramMembership.id
    ).filter(
        CustomerProgramMembership.program_id.in_(program_ids)
    ).order_by(desc(LedgerEntry.created_at)).limit(10).all()

    items = []
    for entry in recent_entries:
        membership = db.query(CustomerProgramMembership).filter(CustomerProgramMembership.id == entry.membership_id).first()
        customer = db.query(User).filter(User.id == membership.customer_user_id).first() if membership else None
        program = next((p for p in merchant.programs if p.id == membership.program_id), None) if membership else None

        customer_name = (customer.name or "").strip() if customer and customer.name else None
        customer_email = customer.email if customer else None
        display_name = customer_name or customer_email or "Customer"
        program_name = program.name if program else "Programme"

        if entry.entry_type in (LedgerEntryType.EARN, LedgerEntryType.EARN.value):
            stamp_phrase = "stamp" if entry.amount == 1 else "stamps"
            if entry.notes == "manual_issue":
                message = f"{display_name} was manually awarded {entry.amount} {stamp_phrase} in {program_name}."
                type_ = 'manual_issue'
            else:
                message = f"{program_name} added {entry.amount} {stamp_phrase} for {display_name}."
                type_ = 'stamp'
        elif entry.entry_type in (LedgerEntryType.REDEEM, LedgerEntryType.REDEEM.value):
            stamp_phrase = "stamp" if entry.amount == 1 else "stamps"
            message = f"{entry.amount} {stamp_phrase} redeemed by {display_name}."
            type_ = 'reward'
        elif entry.entry_type in (LedgerEntryType.ADJUST, LedgerEntryType.ADJUST.value) and entry.amount < 0 and entry.notes == "manual_revoke":
            stamp_phrase = "stamp" if abs(entry.amount) == 1 else "stamps"
            message = f"{display_name} had {abs(entry.amount)} {stamp_phrase} manually revoked in {program_name}."
            type_ = 'manual_revoke'
        else:
            continue

        # Convert timestamp from database (UTC+3) to UTC
        timestamp = entry.created_at
        if timestamp.tzinfo is None or timestamp.tzinfo.utcoffset(timestamp) is None:
            utc_time = timestamp - timedelta(hours=3)
            timestamp = utc_time.replace(tzinfo=timezone.utc)

        items.append({
            "id": str(entry.id),
            "type": type_,
            "message": message,
            "timestamp": timestamp.isoformat(),
            "customer_name": customer_name,
            "customer_email": customer_email,
            "program_name": program.name if program else None,
            "amount": entry.amount,
        })

    # Unique customers
    unique_customers = db.query(func.count(func.distinct(CustomerProgramMembership.customer_user_id))).filter(
        CustomerProgramMembership.program_id.in_(program_ids)
    ).scalar() or 0

    # Rewards redeemed
    rewards_redeemed = db.query(func.sum(LedgerEntry.amount)).join(
        CustomerProgramMembership, LedgerEntry.membership_id == CustomerProgramMembership.id
    ).filter(
        CustomerProgramMembership.program_id.in_(program_ids),
        LedgerEntry.entry_type == LedgerEntryType.REDEEM.value
    ).scalar() or 0

    # Today scans
    today = datetime.utcnow().date()
    today_scans = db.query(func.sum(LedgerEntry.amount)).join(
        CustomerProgramMembership, LedgerEntry.membership_id == CustomerProgramMembership.id
    ).filter(
        CustomerProgramMembership.program_id.in_(program_ids),
        LedgerEntry.entry_type == LedgerEntryType.EARN.value,
        func.date(LedgerEntry.created_at) == today,
        or_(LedgerEntry.notes.is_(None), LedgerEntry.notes != "manual_issue")
    ).scalar() or 0

    return {
        "items": items,
        "unique_customers": unique_customers,
        "rewards_redeemed": rewards_redeemed,
        "today_scans": today_scans
    }

@router.get("/scans-last-7-days")
def get_scans_last_7_days(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        return {"scans": [0, 0, 0, 0, 0, 0, 0]}

    merchant = merchants[0]
    program_ids = [p.id for p in merchant.programs]

    scans = []
    labels = []
    for i in range(7):
        date = datetime.utcnow().date() - timedelta(days=6-i)
        labels.append(date.strftime('%a'))
        count = db.query(func.sum(LedgerEntry.amount)).join(
            CustomerProgramMembership, LedgerEntry.membership_id == CustomerProgramMembership.id
        ).filter(
            CustomerProgramMembership.program_id.in_(program_ids),
            LedgerEntry.entry_type == LedgerEntryType.EARN.value,
            func.date(LedgerEntry.created_at) == date
        ).scalar() or 0
        scans.append(int(count))

    return {"scans": scans, "labels": labels}


