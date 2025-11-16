import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base


class CustomerStats(Base):
    __tablename__ = "customer_stats"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True
    )
    total_revenue: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal('0.0'))
    total_visits: Mapped[int] = mapped_column(Integer, default=0)
    rewards_redeemed: Mapped[int] = mapped_column(Integer, default=0)
    last_visit_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)