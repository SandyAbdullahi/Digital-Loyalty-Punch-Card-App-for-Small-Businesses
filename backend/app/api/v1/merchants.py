import os
import shutil
from pathlib import Path
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ...db.session import get_db
from ...api.deps import get_current_user
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
from ...schemas.merchant import Merchant, MerchantCreate, MerchantUpdate
from ...schemas.location import Location, LocationCreate, LocationUpdate

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
        file_extension = Path(logo.filename).suffix or ".png"
        filename = f"{merchant.id}{file_extension}"
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


# Merchant customers
@router.get("/customers")
def get_merchant_customers(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        return []

    merchant = merchants[0]
    program_ids = [p.id for p in merchant.programs]

    from ...models.customer_program_membership import CustomerProgramMembership
    from ...models.user import User
    from ...models.ledger_entry import LedgerEntry
    from sqlalchemy import func

    memberships = db.query(CustomerProgramMembership).filter(
        CustomerProgramMembership.program_id.in_(program_ids)
    ).all()

    customers = []
    for membership in memberships:
        customer = db.query(User).filter(User.id == membership.customer_user_id).first()
        if not customer:
            continue

        total_stamps = db.query(func.sum(LedgerEntry.amount)).join(
            CustomerProgramMembership, LedgerEntry.membership_id == CustomerProgramMembership.id
        ).filter(
            CustomerProgramMembership.customer_user_id == customer.id,
            CustomerProgramMembership.program_id.in_(program_ids),
            LedgerEntry.entry_type == 'earn'
        ).scalar() or 0

        last_visit = db.query(LedgerEntry.created_at).join(
            CustomerProgramMembership, LedgerEntry.membership_id == CustomerProgramMembership.id
        ).filter(
            CustomerProgramMembership.customer_user_id == customer.id,
            CustomerProgramMembership.program_id.in_(program_ids)
        ).order_by(desc(LedgerEntry.created_at)).first()

        programs = [{
            "id": str(membership.program_id),
            "name": membership.program.name,
            "progress": membership.current_balance,
            "threshold": membership.program.redeem_rule.get('reward_threshold', 10) if membership.program.redeem_rule else 10
        }]

        customers.append({
            "id": str(customer.id),
            "name": customer.name or customer.email.split('@')[0],
            "email": customer.email,
            "avatar": customer.avatar_url,
            "totalStamps": total_stamps,
            "lastVisit": last_visit[0].strftime('%B %d, %Y') if last_visit else 'Never',
            "programs": programs
        })

    return customers

# Merchant rewards
@router.get("/rewards")
def get_merchant_rewards(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        return []

    merchant = merchants[0]
    program_ids = [p.id for p in merchant.programs]

    from ...models.ledger_entry import LedgerEntry
    from ...models.user import User

    redeem_entries = db.query(LedgerEntry).join(
        CustomerProgramMembership, LedgerEntry.membership_id == CustomerProgramMembership.id
    ).filter(
        CustomerProgramMembership.program_id.in_(program_ids),
        LedgerEntry.entry_type == 'redeem'
    ).order_by(desc(LedgerEntry.created_at)).all()

    rewards = []
    for entry in redeem_entries:
        membership = db.query(CustomerProgramMembership).filter(CustomerProgramMembership.id == entry.membership_id).first()
        customer = db.query(User).filter(User.id == membership.customer_user_id).first() if membership else None
        program = next((p for p in merchant.programs if p.id == membership.program_id), None) if membership else None
        rewards.append({
            "id": str(entry.id),
            "program": program.name if program else 'Program',
            "customer": customer.name or customer.email.split('@')[0] if customer else 'Customer',
            "date": entry.created_at.strftime('%B %d, %Y - %I:%M %p'),
            "status": 'redeemed'
        })

    return rewards

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