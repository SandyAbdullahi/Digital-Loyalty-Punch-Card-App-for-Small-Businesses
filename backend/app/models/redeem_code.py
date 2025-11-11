from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..db.base import Base


class RedeemCode(Base):
    __tablename__ = "redeem_codes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=func.gen_random_uuid())
    code = Column(String, unique=True, nullable=False, index=True)
    membership_id = Column(UUID(as_uuid=True), ForeignKey("customer_program_memberships.id"), nullable=False)
    program_id = Column(UUID(as_uuid=True), ForeignKey("loyalty_programs.id"), nullable=False)
    customer_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    merchant_id = Column(UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False)
    amount = Column(String, nullable=False)  # JSON string for redeem amount
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(String, default="false")  # boolean as string for JSON
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    membership = relationship("CustomerProgramMembership")
    program = relationship("LoyaltyProgram")
    customer = relationship("User")
    merchant = relationship("Merchant")