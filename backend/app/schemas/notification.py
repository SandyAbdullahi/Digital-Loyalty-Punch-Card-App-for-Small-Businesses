from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class CustomerNotification(BaseModel):
    id: UUID
    type: Literal["manual_issue", "manual_revoke", "scan_earn", "reward_redeemed"]
    message: str
    timestamp: datetime
    program_name: str
    merchant_name: str
    amount: int
