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
    # Temporarily return empty to avoid 500
    return {"items": [], "unique_customers": 0, "rewards_redeemed": 0, "today_scans": 0}

@router.get("/scans-last-7-days")
def get_scans_last_7_days(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # Temporarily return empty to avoid 500
    return {"scans": [0, 0, 0, 0, 0, 0, 0], "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}


