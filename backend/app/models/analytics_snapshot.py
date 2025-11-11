import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False
    )
    period_start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    total_customers_enrolled: Mapped[int] = mapped_column(Integer, nullable=False)
    visits_by_enrolled_customers: Mapped[int] = mapped_column(Integer, nullable=False)
    rewards_redeemed: Mapped[int] = mapped_column(Integer, nullable=False)
    baseline_visits_estimate: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    estimated_extra_visits: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    estimated_extra_revenue_kes: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    net_incremental_revenue_kes: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)