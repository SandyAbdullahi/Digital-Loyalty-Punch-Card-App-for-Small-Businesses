from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from ...db.session import get_db
from ...api.deps import get_current_user
from ...services.auth import get_user_by_email
from ...services.merchant import get_merchants_by_owner
from ...models.ledger_entry import LedgerEntry
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
    recent_entries = db.query(LedgerEntry).filter(
        LedgerEntry.program_id.in_(program_ids)
    ).order_by(desc(LedgerEntry.created_at)).limit(10).all()

    items = []
    for entry in recent_entries:
        customer = db.query(User).filter(User.id == entry.customer_user_id).first()
        program = next((p for p in merchant.programs if p.id == entry.program_id), None)
        if entry.entry_type == 'earn':
            message = f"{program.name if program else 'Program'} added a stamp for {customer.name if customer and customer.name else customer.email if customer else 'Customer'}."
            type_ = 'stamp'
        elif entry.entry_type == 'redeem':
            message = f"{entry.amount} stamps redeemed by {customer.name if customer and customer.name else customer.email if customer else 'Customer'}."
            type_ = 'reward'
        else:
            continue
        items.append({
            "id": str(entry.id),
            "type": type_,
            "message": message,
            "timestamp": entry.created_at.isoformat()
        })

    # Unique customers
    unique_customers = db.query(func.count(func.distinct(LedgerEntry.customer_user_id))).filter(
        LedgerEntry.program_id.in_(program_ids)
    ).scalar() or 0

    # Rewards redeemed
    rewards_redeemed = db.query(func.sum(LedgerEntry.amount)).filter(
        LedgerEntry.program_id.in_(program_ids),
        LedgerEntry.entry_type == 'redeem'
    ).scalar() or 0

    # Today scans
    today = datetime.utcnow().date()
    today_scans = db.query(func.sum(LedgerEntry.amount)).filter(
        LedgerEntry.program_id.in_(program_ids),
        LedgerEntry.entry_type == 'earn',
        func.date(LedgerEntry.created_at) == today
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
    for i in range(7):
        date = datetime.utcnow().date() - timedelta(days=6-i)
        count = db.query(func.sum(LedgerEntry.amount)).filter(
            LedgerEntry.program_id.in_(program_ids),
            LedgerEntry.entry_type == 'earn',
            func.date(LedgerEntry.created_at) == date
        ).scalar() or 0
        scans.append(count)

    return {"scans": scans}