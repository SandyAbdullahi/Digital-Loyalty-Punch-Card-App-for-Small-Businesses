from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LedgerEntryBase(BaseModel):
    membership_id: UUID
    entry_type: str
    amount: int
    tx_id: Optional[str] = None
    device_fingerprint: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None


class LedgerEntryCreate(LedgerEntryBase):
    pass


class LedgerEntryUpdate(BaseModel):
    notes: Optional[str] = None


class LedgerEntryInDBBase(LedgerEntryBase):
    id: UUID
    issued_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LedgerEntry(LedgerEntryInDBBase):
    pass


class LedgerEntryInDB(LedgerEntryInDBBase):
    pass