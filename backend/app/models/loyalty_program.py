import uuid
from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

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
    stamps_required: Mapped[int] = mapped_column(Integer, nullable=True)
    reward_description: Mapped[str] = mapped_column(Text, nullable=True)
    reward_value_hint_kes: Mapped[float] = mapped_column(Numeric(12, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationship
    merchant: Mapped["Merchant"] = relationship("Merchant", back_populates="programs")
    memberships: Mapped[list["CustomerProgramMembership"]] = relationship("CustomerProgramMembership", back_populates="program")