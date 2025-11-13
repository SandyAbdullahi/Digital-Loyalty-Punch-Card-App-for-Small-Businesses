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
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
