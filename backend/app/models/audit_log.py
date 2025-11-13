import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from ..db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    actor_type: Mapped[str] = mapped_column(String, nullable=False)  # e.g., 'user', 'system'
    actor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True)
    action: Mapped[str] = mapped_column(String, nullable=False)  # e.g., 'stamp_issued', 'reward_redeemed'
    entity: Mapped[str] = mapped_column(String, nullable=False)  # e.g., 'stamp', 'reward'
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    details: Mapped[dict] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
