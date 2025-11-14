from sqlalchemy.orm import Session
from sqlalchemy import select, text, inspect
from ..models.merchant_settings import MerchantSettings
from ..schemas.merchant_settings import MerchantSettingsCreate, MerchantSettingsUpdate
import uuid

THEME_COLUMNS = (
    ("theme_primary_color", "VARCHAR(16)", "'#00C896'"),
    ("theme_secondary_color", "VARCHAR(16)", "'#2196F3'"),
    ("theme_accent_color", "VARCHAR(16)", "'#FF5252'"),
    ("theme_background_color", "VARCHAR(16)", "'#F5F5F5'"),
    ("theme_mode", "VARCHAR(16)", "'light'"),
)


def ensure_theme_columns(db: Session) -> None:
    """
    Ensure newly added theme customization columns exist even if migrations
    have not been executed yet. Runs lightweight ALTER TABLE statements
    only when a column is missing.
    """
    try:
        inspector = inspect(db.bind)
    except Exception:
        return

    try:
        existing = {column["name"] for column in inspector.get_columns("merchant_settings")}
    except Exception:
        return

    missing = [col for col in THEME_COLUMNS if col[0] not in existing]
    if not missing:
        return

    connection = db.connection()
    for name, col_type, default in missing:
        try:
            connection.exec_driver_sql(
                f"ALTER TABLE merchant_settings ADD COLUMN {name} {col_type} DEFAULT {default}",
                execution_options={"autocommit": True},
            )
        except Exception:
            pass


def get_merchant_settings(db: Session, merchant_id: uuid.UUID) -> MerchantSettings | None:
    ensure_theme_columns(db)
    return db.execute(
        select(MerchantSettings).where(MerchantSettings.merchant_id == merchant_id)
    ).scalar_one_or_none()


def create_merchant_settings(db: Session, merchant_id: uuid.UUID, settings: MerchantSettingsCreate) -> MerchantSettings:
    ensure_theme_columns(db)
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
