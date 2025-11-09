from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from .location import Location


class MerchantBase(BaseModel):
    display_name: str
    legal_name: Optional[str] = None
    logo_url: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    average_spend_per_visit: Optional[float] = None
    baseline_visits_per_period: Optional[int] = None
    reward_cost_estimate: Optional[float] = None


class MerchantCreate(MerchantBase):
    pass


class MerchantUpdate(MerchantBase):
    is_active: Optional[bool] = None


class MerchantInDBBase(MerchantBase):
    id: UUID
    owner_user_id: UUID
    is_active: bool = True
    locations: List[Location] = []

    model_config = ConfigDict(from_attributes=True)


class Merchant(MerchantInDBBase):
    pass


class MerchantInDB(MerchantInDBBase):
    pass