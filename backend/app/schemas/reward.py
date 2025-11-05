from typing import Optional

from pydantic import BaseModel


class Reward(BaseModel):
    id: str
    program: str
    customer: str
    date: str
    status: str
    amount: str
    code: Optional[str] = None
    expires_at: Optional[str] = None


class RedeemRequest(BaseModel):
    amount: int
    idempotency_key: Optional[str] = None


class RedeemCodeConfirm(BaseModel):
    code: str


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
