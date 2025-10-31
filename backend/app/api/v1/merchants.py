from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

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


# Owner CRUD for merchants
@router.post("/", response_model=Merchant)
def create_merchant_endpoint(
    merchant: MerchantCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    # Assume current_user is email, get user id
    from ....services.auth import get_user_by_email
    user = get_user_by_email(db, current_user)
    if not user or user.role != "merchant":
        raise HTTPException(status_code=403, detail="Not authorized")
    return create_merchant(db, merchant, user.id)


@router.get("/", response_model=List[Merchant])
def read_merchants(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
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