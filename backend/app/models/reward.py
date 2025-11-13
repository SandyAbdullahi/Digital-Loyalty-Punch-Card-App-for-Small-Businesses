import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base


class RewardStatus(str, Enum):
    INACTIVE = "inactive"
    REDEEMABLE = "redeemable"
    REDEEMED = "redeemed"
    EXPIRED = "expired"


class Reward(Base):
    __tablename__ = "rewards"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    enrollment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customer_program_memberships.id"), nullable=False
    )
    program_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loyalty_programs.id"), nullable=False
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    status: Mapped[RewardStatus] = mapped_column(String, nullable=False, default=RewardStatus.INACTIVE)
    reached_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    voucher_code: Mapped[str] = mapped_column(String(32), nullable=True, unique=True)
    redeem_expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    redeemed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    redeemed_by_staff_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True)
    audit: Mapped[dict] = mapped_column(JSON, nullable=True)
    cycle: Mapped[int] = mapped_column(Integer, nullable=True, default=1)

    __table_args__ = (
        UniqueConstraint("enrollment_id", "cycle", name="uq_rewards_enrollment_cycle"),
    )


# Backward compatibility
RedeemCode = Reward
