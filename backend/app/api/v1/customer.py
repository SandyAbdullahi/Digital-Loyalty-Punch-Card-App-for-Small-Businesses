from typing import List
import os
import shutil
from pathlib import Path
from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy import and_, or_, desc
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...api.deps import get_current_user
from ...services.auth import get_user_by_email, update_user
from ...services.membership import get_memberships_with_details_by_customer
from ...schemas.customer_program_membership import CustomerProgramMembershipWithDetails
from ...schemas.user import UserUpdate
from ...schemas.notification import CustomerNotification
from ...models.ledger_entry import LedgerEntry, LedgerEntryType
from ...models.customer_program_membership import CustomerProgramMembership
from ...models.loyalty_program import LoyaltyProgram
from ...models.merchant import Merchant

router = APIRouter()

@router.get("/memberships", response_model=List[CustomerProgramMembershipWithDetails])
def get_my_memberships(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_memberships_with_details_by_customer(db, user.id)


@router.get("/notifications", response_model=List[CustomerNotification])
def get_my_notifications(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    entries = (
        db.query(LedgerEntry, CustomerProgramMembership, LoyaltyProgram, Merchant)
        .join(CustomerProgramMembership, LedgerEntry.membership_id == CustomerProgramMembership.id)
        .join(LoyaltyProgram, CustomerProgramMembership.program_id == LoyaltyProgram.id)
        .join(Merchant, LoyaltyProgram.merchant_id == Merchant.id)
        .filter(
            CustomerProgramMembership.customer_user_id == user.id,
            or_(
                and_(
                    LedgerEntry.entry_type == LedgerEntryType.EARN.value,
                    LedgerEntry.notes == "manual_issue",
                ),
                and_(
                    LedgerEntry.entry_type == LedgerEntryType.ADJUST.value,
                    LedgerEntry.notes == "manual_revoke",
                    LedgerEntry.amount < 0,
                ),
            ),
        )
        .order_by(desc(LedgerEntry.created_at))
        .limit(limit)
        .all()
    )

    notifications: List[CustomerNotification] = []
    for entry, membership, program, merchant in entries:
        merchant_name = (
            getattr(merchant, "display_name", None)
            or getattr(merchant, "legal_name", None)
            or "Merchant"
        )
        program_name = getattr(program, "name", None) or "Programme"
        amount = abs(int(entry.amount or 0))

        if entry.entry_type in (LedgerEntryType.EARN, LedgerEntryType.EARN.value):
            message = f"{merchant_name} manually added {amount} stamp{'s' if amount != 1 else ''} to {program_name}."
            type_ = "manual_issue"
        elif entry.entry_type in (LedgerEntryType.ADJUST, LedgerEntryType.ADJUST.value):
            message = f"{merchant_name} removed {amount} stamp{'s' if amount != 1 else ''} from {program_name}."
            type_ = "manual_revoke"
        else:
            continue

        created_at = entry.created_at
        if created_at.tzinfo is None or created_at.tzinfo.utcoffset(created_at) is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        notifications.append(
            CustomerNotification(
                id=entry.id,
                type=type_,
                message=message,
                timestamp=created_at,
                program_name=program_name,
                merchant_name=merchant_name,
                amount=amount,
            )
        )

    return notifications


@router.put("/profile")
def update_profile(
    name: str = Form(None),
    email: str = Form(...),
    avatar: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    try:
        user = get_user_by_email(db, current_user)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        update_data = {"name": name, "email": email}

        if avatar and avatar.filename:
            # Create uploads directory if it doesn't exist
            upload_dir = Path("uploads/avatars")
            upload_dir.mkdir(parents=True, exist_ok=True)

            # Generate unique filename
            import time
            file_extension = Path(avatar.filename).suffix or ".jpg"
            filename = f"{user.id}_{int(time.time())}{file_extension}"
            file_path = upload_dir / filename

            # Save the file
            try:
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(avatar.file, buffer)
                update_data["avatar_url"] = f"/uploads/avatars/{filename}"
            except Exception as e:
                print(f"Error saving avatar: {e}")
                # Continue without avatar

        profile = UserUpdate(**update_data)
        return update_user(db, user, profile)
    except Exception as e:
        print(f"Error in update_profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
