import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from ..db.base import Base


class LoyaltyProgram(Base):
    __tablename__ = "loyalty_programs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    logic_type: Mapped[str] = mapped_column(String, nullable=False)  # punch_card or points
    earn_rule: Mapped[str] = mapped_column(Text, nullable=False)
    redeem_rule: Mapped[str] = mapped_column(Text, nullable=False)
    terms: Mapped[str] = mapped_column(Text, nullable=True)
    stamp_icon: Mapped[str] = mapped_column(String, nullable=True)
    stamps_required: Mapped[int] = mapped_column(Integer, nullable=False)
    reward_description: Mapped[str] = mapped_column(Text, nullable=True)
    reward_value_hint_kes: Mapped[float] = mapped_column(Numeric(12, 2), nullable=True)
    reward_expiry_days: Mapped[int] = mapped_column(Integer, nullable=True)
    allow_repeat_cycles: Mapped[bool] = mapped_column(Boolean, default=True, nullable=True)
    max_redemptions_per_day: Mapped[int] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now(), nullable=True)

    merchant = relationship("Merchant", back_populates="programs")
    memberships = relationship("CustomerProgramMembership", back_populates="program")

    __table_args__ = (
        UniqueConstraint("merchant_id", "name", name="uq_loyalty_programs_merchant_name"),
    )
