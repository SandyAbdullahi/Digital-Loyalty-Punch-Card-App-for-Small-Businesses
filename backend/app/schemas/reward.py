from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class RewardBase(BaseModel):
    enrollment_id: UUID
    program_id: UUID
    merchant_id: UUID
    customer_id: UUID
    status: str
    cycle: int


class RewardCreate(RewardBase):
    pass


class RewardUpdate(BaseModel):
    status: Optional[str] = None
    redeemed_at: Optional[datetime] = None
    redeemed_by_staff_id: Optional[UUID] = None


class Reward(RewardBase):
    id: UUID
    reached_at: Optional[datetime]
    voucher_code: Optional[str]
    redeem_expires_at: Optional[datetime]
    redeemed_at: Optional[datetime]
    redeemed_by_staff_id: Optional[UUID]
    audit: Optional[dict]

    class Config:
        from_attributes = True


class StampIssueRequest(BaseModel):
    tx_id: str
    issued_by_staff_id: Optional[UUID] = None


class RedeemRequest(BaseModel):
    voucher_code: str
    redeemed_by_staff_id: Optional[UUID] = None


class RedeemCodeConfirm(BaseModel):
    code: str


class RedeemStampsRequest(BaseModel):
    amount: int
    idempotency_key: Optional[str] = None


class CustomerRedemption(BaseModel):
    id: str
    code: str
    status: str
    amount: str
    created_at: str
    expires_at: Optional[str] = None
    used_at: Optional[str] = None
    program_name: Optional[str] = None
    merchant_name: Optional[str] = None
    reward_description: Optional[str] = None
    stamps_redeemed: Optional[int] = None
