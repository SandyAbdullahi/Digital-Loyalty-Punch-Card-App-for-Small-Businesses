from sqlalchemy.orm import Session
from uuid import UUID

from ..models.merchant import Merchant
from ..models.location import Location
from ..schemas.merchant import MerchantCreate, MerchantUpdate
from ..schemas.location import LocationCreate, LocationUpdate


def get_merchant(db: Session, merchant_id: UUID) -> Merchant | None:
    return db.query(Merchant).filter(Merchant.id == merchant_id).first()


def get_merchants_by_owner(db: Session, owner_user_id: UUID) -> list[Merchant]:
    return db.query(Merchant).filter(Merchant.owner_user_id == owner_user_id).all()


def create_merchant(db: Session, merchant: MerchantCreate, owner_user_id: UUID) -> Merchant:
    db_merchant = Merchant(
        owner_user_id=owner_user_id,
        display_name=merchant.display_name,
        legal_name=merchant.legal_name,
        logo_url=merchant.logo_url,
        category=merchant.category,
    )
    db.add(db_merchant)
    db.commit()
    db.refresh(db_merchant)
    return db_merchant


def update_merchant(db: Session, merchant_id: UUID, merchant_update: MerchantUpdate) -> Merchant | None:
    db_merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if db_merchant:
        update_data = merchant_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_merchant, field, value)
        db.commit()
        db.refresh(db_merchant)
    return db_merchant


def delete_merchant(db: Session, merchant_id: UUID) -> bool:
    db_merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if db_merchant:
        db.delete(db_merchant)
        db.commit()
        return True
    return False


def get_location(db: Session, location_id: UUID) -> Location | None:
    return db.query(Location).filter(Location.id == location_id).first()


def get_locations_by_merchant(db: Session, merchant_id: UUID) -> list[Location]:
    return db.query(Location).filter(Location.merchant_id == merchant_id).all()


def create_location(db: Session, location: LocationCreate, merchant_id: UUID) -> Location:
    db_location = Location(
        merchant_id=merchant_id,
        lat=location.lat,
        lng=location.lng,
        address=location.address,
    )
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location


def update_location(db: Session, location_id: UUID, location_update: LocationUpdate) -> Location | None:
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if db_location:
        update_data = location_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_location, field, value)
        db.commit()
        db.refresh(db_location)
    return db_location


def delete_location(db: Session, location_id: UUID) -> bool:
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if db_location:
        db.delete(db_location)
        db.commit()
        return True
    return False


def search_merchants(db: Session, query: str | None = None, near_lat: float | None = None, near_lng: float | None = None, radius_m: float | None = None) -> list[Merchant]:
    # Basic search, implement full later
    merchants = db.query(Merchant).filter(Merchant.is_active == True).all()
    return merchants