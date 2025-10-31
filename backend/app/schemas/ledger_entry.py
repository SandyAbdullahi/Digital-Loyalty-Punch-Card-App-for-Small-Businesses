from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class LedgerEntryBase(BaseModel):
    membership_id: UUID
    entry_type: str
    amount: int
    tx_ref: Optional[str] = None
    device_fingerprint: Optional[str] = None
    notes: Optional[str] = None


class LedgerEntryCreate(LedgerEntryBase):
    pass


class LedgerEntryUpdate(BaseModel):
    notes: Optional[str] = None


class LedgerEntryInDBBase(LedgerEntryBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class LedgerEntry(LedgerEntryInDBBase):
    pass


class LedgerEntryInDB(LedgerEntryInDBBase):
    pass