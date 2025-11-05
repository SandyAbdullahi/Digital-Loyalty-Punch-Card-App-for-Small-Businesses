from datetime import datetime, timezone
from pathlib import Path
import os
import shutil
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy import and_, or_, desc
from sqlalchemy.orm import Session, joinedload

from ...db.session import get_db
from ...api.deps import get_current_user
from ...services.auth import get_user_by_email, update_user
from ...services.membership import get_memberships_with_details_by_customer
from ...schemas.customer_program_membership import CustomerProgramMembershipWithDetails
from ...schemas.user import UserUpdate
from ...schemas.notification import CustomerNotification
from ...schemas.reward import CustomerRedemption
from ...models.ledger_entry import LedgerEntry, LedgerEntryType
from ...models.customer_program_membership import CustomerProgramMembership
from ...models.loyalty_program import LoyaltyProgram
from ...models.redeem_code import RedeemCode
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


@router.get("/rewards", response_model=List[CustomerRedemption])
def get_my_rewards(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100),
):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    redemptions_query = (
        db.query(RedeemCode, CustomerProgramMembership, LoyaltyProgram, Merchant)
        .join(CustomerProgramMembership, RedeemCode.membership_id == CustomerProgramMembership.id)
        .join(LoyaltyProgram, RedeemCode.program_id == LoyaltyProgram.id)
        .join(Merchant, LoyaltyProgram.merchant_id == Merchant.id)
        .filter(CustomerProgramMembership.customer_user_id == user.id)
        .order_by(desc(RedeemCode.created_at))
        .limit(limit)
    )

    now_utc = datetime.now(timezone.utc)
    rewards: List[CustomerRedemption] = []

    for code, membership, program, merchant in redemptions_query:
        created_at = code.created_at or datetime.utcnow()
        if created_at.tzinfo is None or created_at.tzinfo.utcoffset(created_at) is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        expires_at = code.expires_at
        if expires_at is not None and (expires_at.tzinfo is None or expires_at.tzinfo.utcoffset(expires_at) is None):
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        used_at = code.used_at
        if used_at is not None and (used_at.tzinfo is None or used_at.tzinfo.utcoffset(used_at) is None):
            used_at = used_at.replace(tzinfo=timezone.utc)

        is_used = str(code.is_used).lower() == "true"
        if is_used:
            status = "redeemed"
        elif expires_at and expires_at < now_utc:
            status = "expired"
        else:
            status = "claimed"

        reward_description = getattr(program, "reward_description", None)
        amount_raw = (code.amount or "0").strip() or "0"
        try:
            stamps_redeemed = int(amount_raw)
        except ValueError:
            stamps_redeemed = None

        rewards.append(
            CustomerRedemption(
                id=str(code.id),
                code=code.code,
                status=status,
                amount=amount_raw,
                created_at=created_at.isoformat(),
                expires_at=expires_at.isoformat() if expires_at else None,
                used_at=used_at.isoformat() if used_at else None,
                program_name=getattr(program, "name", None) or "Programme",
                merchant_name=getattr(merchant, "display_name", None)
                or getattr(merchant, "legal_name", None)
                or "Merchant",
                reward_description=reward_description,
                stamps_redeemed=stamps_redeemed,
            )
        )

    return rewards


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
