import uuid
from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.base import Base


class Merchant(Base):
    __tablename__ = "merchants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    owner_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    display_name: Mapped[str] = mapped_column(String, nullable=False)
    legal_name: Mapped[str] = mapped_column(String, nullable=True)
    logo_url: Mapped[str] = mapped_column(String, nullable=True)
    category: Mapped[str] = mapped_column(String, nullable=True)
    address: Mapped[str] = mapped_column(String, nullable=True)
    description: Mapped[str] = mapped_column(String, nullable=True)
    website: Mapped[str] = mapped_column(String, nullable=True)
    phone: Mapped[str] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    average_spend_per_visit: Mapped[float] = mapped_column(Float, nullable=True)
    baseline_visits_per_period: Mapped[int] = mapped_column(Integer, nullable=True)
    reward_cost_estimate: Mapped[float] = mapped_column(Float, nullable=True)

    # Relationships for eager loading in analytics + QR flows
    owner = relationship("User", back_populates="merchants", lazy="joined")
    locations = relationship("Location", back_populates="merchant", cascade="all, delete-orphan")
    programs = relationship("LoyaltyProgram", back_populates="merchant", cascade="all, delete-orphan")
    memberships = relationship("CustomerProgramMembership", back_populates="merchant")
