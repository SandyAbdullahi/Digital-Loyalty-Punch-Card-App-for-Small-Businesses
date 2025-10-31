from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel

from .location import Location


class MerchantBase(BaseModel):
    display_name: str
    legal_name: Optional[str] = None
    logo_url: Optional[str] = None
    category: Optional[str] = None


class MerchantCreate(MerchantBase):
    pass


class MerchantUpdate(MerchantBase):
    is_active: Optional[bool] = None


class MerchantInDBBase(MerchantBase):
    id: UUID
    owner_user_id: UUID
    is_active: bool = True
    locations: List[Location] = []

    class Config:
        from_attributes = True


class Merchant(MerchantInDBBase):
    pass


class MerchantInDB(MerchantInDBBase):
    pass