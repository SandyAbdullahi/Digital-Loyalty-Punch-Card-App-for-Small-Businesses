from sqlalchemy.orm import Session
from sqlalchemy import select
from ..models.merchant_settings import MerchantSettings
from ..schemas.merchant_settings import MerchantSettingsCreate, MerchantSettingsUpdate
import uuid


def get_merchant_settings(db: Session, merchant_id: uuid.UUID) -> MerchantSettings | None:
    return db.execute(
        select(MerchantSettings).where(MerchantSettings.merchant_id == merchant_id)
    ).scalar_one_or_none()


def create_merchant_settings(db: Session, merchant_id: uuid.UUID, settings: MerchantSettingsCreate) -> MerchantSettings:
    db_settings = MerchantSettings(
        merchant_id=merchant_id,
        **settings.model_dump()
    )
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings


def update_merchant_settings(db: Session, merchant_id: uuid.UUID, settings: MerchantSettingsUpdate) -> MerchantSettings | None:
    db_settings = get_merchant_settings(db, merchant_id)
    if not db_settings:
        return None
    update_data = settings.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_settings, key, value)
    db.commit()
    db.refresh(db_settings)
    return db_settings


def upsert_merchant_settings(db: Session, merchant_id: uuid.UUID, settings: MerchantSettingsUpdate) -> MerchantSettings:
    existing = get_merchant_settings(db, merchant_id)
    if existing:
        return update_merchant_settings(db, merchant_id, settings)
    else:
        # Create with defaults + provided
        create_data = MerchantSettingsCreate(**settings.model_dump(exclude_unset=True))
        return create_merchant_settings(db, merchant_id, create_data)