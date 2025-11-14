import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base


class PeriodEnum(str, Enum):
    MONTH = "month"
    QUARTER = "quarter"


class MerchantSettings(Base):
    __tablename__ = "merchant_settings"

    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("merchants.id"), primary_key=True
    )
    avg_spend_per_visit_kes: Mapped[float] = mapped_column(
        Numeric(12, 2), nullable=False, server_default=text("0"), default=0
    )
    baseline_visits_per_customer_per_period: Mapped[float] = mapped_column(
        Numeric(6, 2), nullable=False, server_default=text("0"), default=0
    )
    avg_reward_cost_kes: Mapped[float] = mapped_column(
        Numeric(12, 2), nullable=False, server_default=text("0"), default=0
    )
    default_period: Mapped[PeriodEnum] = mapped_column(
        String, nullable=False, default=PeriodEnum.MONTH
    )
    monthly_subscription_kes: Mapped[float] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    theme_primary_color: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default=text("'#00C896'"), default="#00C896"
    )
    theme_secondary_color: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default=text("'#2196F3'"), default="#2196F3"
    )
    theme_accent_color: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default=text("'#FF5252'"), default="#FF5252"
    )
    theme_background_color: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default=text("'#F5F5F5'"), default="#F5F5F5"
    )
    theme_mode: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default=text("'light'"), default="light"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
