from datetime import datetime, timezone, timedelta
from pathlib import Path
import os
import shutil
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy import and_, or_, desc
from sqlalchemy.orm import Session, joinedload, selectinload, selectinload

from ...db.session import get_db
from ...api.deps import get_current_user
from ...services.auth import get_user_by_email, update_user
from ...services.membership import get_memberships_with_details_by_customer
from ...schemas.customer_program_membership import CustomerProgramMembershipWithDetails
from ...schemas.user import UserUpdate
from ...schemas.notification import CustomerNotification
from ...schemas.reward import CustomerRedemption, Reward as RewardSchema
from ...models.ledger_entry import LedgerEntry, LedgerEntryType
from ...models.customer_program_membership import CustomerProgramMembership
from ...models.loyalty_program import LoyaltyProgram
from ...models.reward import Reward as RewardModel, RewardStatus
from ...models.stamp import Stamp
from ...models.merchant import Merchant
from ...services.membership import get_membership_by_customer_and_program
from ...services.reward_service import issue_stamp

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

    # Get recent ledger entries for the customer
    entries = db.query(LedgerEntry).filter(
        LedgerEntry.customer_id == user.id
    ).order_by(LedgerEntry.issued_at.desc()).limit(limit).all()

    notifications = []
    for entry in entries:
        program = db.query(LoyaltyProgram).filter(LoyaltyProgram.id == entry.program_id).first()
        merchant = db.query(Merchant).filter(Merchant.id == entry.merchant_id).first()
        if not program or not merchant:
            continue
        notif_type = {
            "EARN": "scan_earn",
            "REDEEM": "reward_redeemed",
            "ADJUST": "manual_issue" if entry.amount > 0 else "manual_revoke"
        }.get(entry.entry_type, "manual_issue")
        message = f"{'Earned' if entry.entry_type == 'EARN' else 'Redeemed' if entry.entry_type == 'REDEEM' else 'Adjusted'} {entry.amount} points"
        notifications.append({
            "id": entry.id,
            "type": notif_type,
            "message": message,
            "timestamp": entry.issued_at,
            "program_name": program.name,
            "merchant_name": merchant.display_name,
            "amount": entry.amount
        })
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

    rewards_query = (
        db.query(RewardModel, CustomerProgramMembership, LoyaltyProgram, Merchant)
        .join(CustomerProgramMembership, RewardModel.enrollment_id == CustomerProgramMembership.id)
        .join(LoyaltyProgram, RewardModel.program_id == LoyaltyProgram.id)
        .join(Merchant, LoyaltyProgram.merchant_id == Merchant.id)
        .filter(CustomerProgramMembership.customer_user_id == user.id)
        .order_by(desc(RewardModel.reached_at))
        .limit(limit)
    )

    rewards: List[CustomerRedemption] = []
    status_map = {
        RewardStatus.REDEEMABLE: "claimed",
        RewardStatus.REDEEMED: "redeemed",
        RewardStatus.EXPIRED: "expired",
    }

    for reward, membership, program, merchant in rewards_query:
        status = status_map.get(reward.status)
        if not status:
            continue

        created_at = reward.reached_at or membership.joined_at or datetime.utcnow()
        if created_at.tzinfo is None or created_at.tzinfo.utcoffset(created_at) is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        expires_at = reward.redeem_expires_at
        if expires_at and (expires_at.tzinfo is None or expires_at.tzinfo.utcoffset(expires_at) is None):
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        used_at = reward.redeemed_at
        if used_at and (used_at.tzinfo is None or used_at.tzinfo.utcoffset(used_at) is None):
            used_at = used_at.replace(tzinfo=timezone.utc)

        stamps_required = getattr(program, "stamps_required", 0) or 0
        reward_description = getattr(program, "reward_description", None) or program.name or "Reward"
        merchant_name = getattr(merchant, "display_name", None) or getattr(merchant, "legal_name", None)

        rewards.append(
            CustomerRedemption(
                id=str(reward.id),
                code=reward.voucher_code or "N/A",
                status=status,
                amount=str(stamps_required),
                created_at=created_at.isoformat(),
                expires_at=expires_at.isoformat() if expires_at else None,
                used_at=used_at.isoformat() if used_at else None,
                program_name=getattr(program, "name", None) or "Programme",
                merchant_name=merchant_name or "Merchant",
                reward_description=reward_description,
                stamps_redeemed=stamps_required if status != "claimed" else None,
            )
        )

    # Sort all rewards by created_at descending and limit
    rewards.sort(key=lambda x: x.created_at, reverse=True)
    rewards = rewards[:limit]

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


@router.delete("/memberships/{program_id}")
def leave_program(
    program_id: UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    membership = get_membership_by_customer_and_program(db, user.id, program_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    # Delete related records first to avoid foreign key constraint violations
    db.query(RewardModel).filter(RewardModel.enrollment_id == membership.id).delete(synchronize_session=False)
    db.query(Stamp).filter(Stamp.enrollment_id == membership.id).delete(synchronize_session=False)
    db.query(LedgerEntry).filter(LedgerEntry.membership_id == membership.id).delete(synchronize_session=False)

    # Delete the membership
    db.delete(membership)
    db.commit()

    return {"message": "Successfully left the program"}


@router.post("/programs/{program_id}/enroll")
def enroll_in_program(
    program_id: UUID,
    qr_token: str = Query(...),  # Assume token is passed
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    # Validate QR token (placeholder)
    # Assume token contains program_id, merchant_id, ts, nonce
    # Validate HMAC

    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if already enrolled
    existing = get_membership_by_customer_and_program(db, user.id, program_id)
    if existing:
        return {"enrollment": existing}

    # Create enrollment
    from ...models import CustomerProgramMembership, JoinedVia
    program = db.query(LoyaltyProgram).options(joinedload(LoyaltyProgram.merchant)).filter(LoyaltyProgram.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    enrollment = CustomerProgramMembership(
        customer_user_id=user.id,
        merchant_id=program.merchant_id,
        program_id=program_id,
        joined_via=JoinedVia.QR
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    # Load the program with merchant
    enrollment.program = program
    return {"enrollment": enrollment}


@router.get("/enrollments/{enrollment_id}/reward", response_model=RewardSchema)
def get_reward_status(
    enrollment_id: UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reward = db.query(RewardModel).filter(
        RewardModel.enrollment_id == enrollment_id,
        RewardModel.customer_id == user.id
    ).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    return reward
