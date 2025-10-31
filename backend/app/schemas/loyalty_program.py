from typing import Dict, Optional
from uuid import UUID

from pydantic import BaseModel


class LoyaltyProgramBase(BaseModel):
    name: str
    description: Optional[str] = None
    logic_type: str  # punch_card or points
    earn_rule: Dict
    redeem_rule: Dict
    terms: Optional[str] = None


class LoyaltyProgramCreate(LoyaltyProgramBase):
    pass


class LoyaltyProgramUpdate(LoyaltyProgramBase):
    is_active: Optional[bool] = None


class LoyaltyProgramInDBBase(LoyaltyProgramBase):
    id: UUID
    merchant_id: UUID
    is_active: bool = True

    class Config:
        from_attributes = True


class LoyaltyProgram(LoyaltyProgramInDBBase):
    pass


class LoyaltyProgramInDB(LoyaltyProgramInDBBase):
    pass