from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LocationBase(BaseModel):
    lat: float
    lng: float
    address: str


class LocationCreate(LocationBase):
    pass


class LocationUpdate(LocationBase):
    pass


class LocationInDBBase(LocationBase):
    id: UUID
    merchant_id: UUID

    model_config = ConfigDict(from_attributes=True)


class Location(LocationInDBBase):
    pass


class LocationInDB(LocationInDBBase):
    pass