import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.base import Base


class JoinedVia(str, Enum):
    QR = "qr"
    LINK = "link"


class CustomerProgramMembership(Base):
    __tablename__ = "customer_program_memberships"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    program_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loyalty_programs.id"), nullable=False
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False
    )
    joined_via: Mapped[JoinedVia] = mapped_column(String, nullable=False, default=JoinedVia.QR)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    last_visit_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    current_balance: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_cycle: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    program = relationship("LoyaltyProgram", back_populates="memberships")
    customer = relationship("User", back_populates="memberships")
    merchant = relationship("Merchant", back_populates="memberships")

    __table_args__ = (
        UniqueConstraint("customer_user_id", "program_id", name="uq_membership_customer_program"),
        Index("ix_customer_program_memberships_program_joined", "program_id", "joined_at"),
    )
