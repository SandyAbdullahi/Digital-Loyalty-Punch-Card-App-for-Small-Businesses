import json
from typing import Dict, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


class LoyaltyProgramBase(BaseModel):
    name: str
    description: Optional[str] = None
    logic_type: str  # punch_card or points
    earn_rule: Dict
    redeem_rule: Dict
    terms: Optional[str] = None
    stamp_icon: Optional[str] = None

    @field_validator('earn_rule', 'redeem_rule', mode='before')
    @classmethod
    def parse_json(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return {}
        return v


class LoyaltyProgramCreate(LoyaltyProgramBase):
    pass


class LoyaltyProgramUpdate(LoyaltyProgramBase):
    is_active: Optional[bool] = None


class LoyaltyProgramInDBBase(LoyaltyProgramBase):
    id: UUID
    merchant_id: UUID
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


class LoyaltyProgram(LoyaltyProgramInDBBase):
    merchant: "Merchant | None" = None


# Import here to avoid circular import
from .merchant import Merchant


class LoyaltyProgramInDB(LoyaltyProgramInDBBase):
    pass