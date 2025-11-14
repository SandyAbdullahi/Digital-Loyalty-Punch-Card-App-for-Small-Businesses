import json
import json
from typing import Dict, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator

from .merchant import Merchant

class LoyaltyProgramBase(BaseModel):
    name: str
    description: Optional[str] = None
    logic_type: str  # punch_card or points
    earn_rule: Optional[Dict] = {}
    redeem_rule: Optional[Dict] = {}
    terms: Optional[str] = None
    stamp_icon: Optional[str] = None
    stamps_required: Optional[int] = None
    reward_description: Optional[str] = None
    reward_value_hint_kes: Optional[float] = None
    reward_expiry_days: Optional[int] = None
    allow_repeat_cycles: Optional[bool] = True
    max_redemptions_per_day: Optional[int] = None
    expires_at: Optional[str] = None

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
    expires_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class LoyaltyProgram(LoyaltyProgramInDBBase):
    merchant: Optional[Merchant] = None





class LoyaltyProgramInDB(LoyaltyProgramInDBBase):
    pass
