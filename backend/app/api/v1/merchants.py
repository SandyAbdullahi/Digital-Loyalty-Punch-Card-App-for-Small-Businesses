import os
import shutil
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status, Form, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

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
from ...api.v1.websocket import get_websocket_manager
from ...services.merchant_settings import get_merchant_settings, upsert_merchant_settings
from ...schemas.merchant import Merchant, MerchantCreate, MerchantUpdate
from ...schemas.location import Location, LocationCreate, LocationUpdate
from ...schemas.reward import RedeemCodeConfirm, StampIssueRequest, RedeemRequest
from ...schemas.merchant_settings import MerchantSettings, MerchantSettingsCreate, MerchantSettingsUpdate
from ...models.ledger_entry import LedgerEntry
from ...models.reward import Reward as RewardModel, RewardStatus
from ...models.customer_program_membership import CustomerProgramMembership
from ...models.loyalty_program import LoyaltyProgram
from ...models.merchant import Merchant as MerchantModel
from ...models.user import User
from ...services.reward_service import issue_stamp, redeem_reward, revoke_last_stamp
from ...services.membership import earn_stamps, adjust_balance

router = APIRouter()


# Merchant profile
@router.put("/profile")
def update_merchant_profile(
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
        # Create uploads directory if it doesn't exist
        upload_dir = Path("uploads/logos")
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename
        import time
        file_extension = Path(logo.filename).suffix or ".png"
        filename = f"{merchant.id}_{int(time.time())}{file_extension}"
        file_path = upload_dir / filename

        # Save the file
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(logo.file, buffer)
            update_data["logo_url"] = f"/uploads/logos/{filename}"
        except Exception as e:
            print(f"Error saving logo: {e}")
            # Continue without logo

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

    customers = []
    for customer_id, mems in customer_memberships.items():
        customer = db.query(User).filter(User.id == customer_id).first()
        if not customer:
            continue

        total_stamps = sum(m.current_balance for m in mems)

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
                "last_visit": last_visit[0].isoformat() if last_visit else None,
                "last_visit_display": last_visit[0].strftime('%B %d, %Y - %I:%M %p') if last_visit else None,
                "programs": programs,
            }
        )

    return customers


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
        now = datetime.now(timezone.utc)

        for reward, program, customer in reward_rows:
            program_name = program.name or "Program"
            customer_label = customer.name or customer.email.split("@")[0]

            expires_at = reward.redeem_expires_at
            if expires_at and expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)

            timestamp = reward.reached_at or now
            if timestamp.tzinfo is None:
                timestamp = timestamp.replace(tzinfo=timezone.utc)

            raw_status = reward.status or RewardStatus.INACTIVE.value
            status_value = raw_status.value if isinstance(raw_status, RewardStatus) else str(raw_status)

            if status_value == RewardStatus.REDEEMED.value:
                if reward.redeemed_at:
                    ts = reward.redeemed_at
                    if ts.tzinfo is None:
                        ts = ts.replace(tzinfo=timezone.utc)
                    timestamp = ts
            elif status_value == RewardStatus.EXPIRED.value:
                if expires_at:
                    timestamp = expires_at

            rewards.append(
                {
                    "id": str(reward.id),
                    "program": program_name,
                    "customer": customer_label,
                    "date": timestamp.isoformat(),
                    "status": status_value,
                    "amount": "1",
                    "code": reward.voucher_code if status_value == RewardStatus.REDEEMABLE.value else None,
                    "expires_at": expires_at.isoformat() if expires_at else None,
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
    now = datetime.now(timezone.utc)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < now:
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
    timestamp = (updated.redeemed_at or datetime.utcnow()).isoformat()

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

    # Verify merchant owns the program
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

    # Find membership
    membership = db.query(CustomerProgramMembership).filter(
        CustomerProgramMembership.customer_user_id == customer_id,
        CustomerProgramMembership.program_id == program_uuid
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    # Add stamp
    result = earn_stamps(db, membership.id, 1, "manual", "manual", notes="manual_issue")
    if result:
        # Broadcast the update to the customer via WebSocket
        ws_manager = get_websocket_manager()
        ws_manager.broadcast_stamp_update_sync(str(customer_id), program_id, result.current_balance)
        return {"message": "Stamp added successfully"}
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

    # Verify merchant owns the program
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

    # Find membership
    membership = db.query(CustomerProgramMembership).filter(
        CustomerProgramMembership.customer_user_id == customer_id,
        CustomerProgramMembership.program_id == program_uuid
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    # Revoke stamp (adjust by -1)
    result = adjust_balance(db, membership.id, -1, "manual_revoke", "manual")
    if result:
        return {"message": "Stamp revoked successfully"}
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
        # Delete redeem codes
        db.query(RedeemCode).filter(RedeemCode.membership_id.in_(membership_ids)).delete()
        # Delete ledger entries
        db.query(LedgerEntry).filter(LedgerEntry.membership_id.in_(membership_ids)).delete()

    # Now delete the memberships
    for membership in memberships:
        db.delete(membership)
    db.commit()
    return {"message": "Customer removed from all programs"}


# Analytics
@router.get("/{merchant_id}/analytics")
def get_merchant_analytics_endpoint(
    merchant_id: UUID,
    period: str = Query(Period.THIS_MONTH, enum=[p.value for p in Period]),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if user owns the merchant
    merchant = db.query(MerchantModel).filter(MerchantModel.id == merchant_id, MerchantModel.owner_user_id == user.id).first()
    if not merchant:
        raise HTTPException(status_code=403, detail="Not authorized to access this merchant's analytics")

    try:
        analytics = get_merchant_analytics(db, merchant_id, period)
        return analytics
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{merchant_id}/analytics/customers")
def get_top_customers_endpoint(
    merchant_id: UUID,
    period: str = Query(Period.THIS_MONTH, enum=[p.value for p in Period]),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if user owns the merchant
    merchant = db.query(MerchantModel).filter(MerchantModel.id == merchant_id, MerchantModel.owner_user_id == user.id).first()
    if not merchant:
        raise HTTPException(status_code=403, detail="Not authorized to access this merchant's analytics")

    try:
        customers = get_top_customers(db, merchant_id, period, limit)
        return {"customers": customers}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


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
                "timestamp": datetime.utcnow().isoformat(),
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
    timestamp = (redeemed_reward.redeemed_at or datetime.utcnow()).isoformat()

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
