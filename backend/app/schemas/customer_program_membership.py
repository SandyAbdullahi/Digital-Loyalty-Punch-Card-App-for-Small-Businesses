from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from .loyalty_program import LoyaltyProgram
from .merchant import Merchant


class JoinedViaEnum(str, Enum):
    QR = "qr"
    LINK = "link"


class CustomerProgramMembershipBase(BaseModel):
    customer_user_id: UUID
    program_id: UUID
    merchant_id: UUID
    joined_via: JoinedViaEnum = JoinedViaEnum.QR
    current_balance: int = 0
    current_cycle: int = 1


class CustomerProgramMembershipCreate(CustomerProgramMembershipBase):
    pass


class CustomerProgramMembershipUpdate(BaseModel):
    current_balance: Optional[int] = None
    is_active: Optional[bool] = None


class CustomerProgramMembershipInDBBase(CustomerProgramMembershipBase):
    id: UUID
    joined_at: datetime
    last_visit_at: datetime | None = None
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


class CustomerProgramMembership(CustomerProgramMembershipInDBBase):
    pass


class CustomerProgramMembershipInDB(CustomerProgramMembershipInDBBase):
    pass


class CustomerProgramMembershipWithDetails(CustomerProgramMembershipInDBBase):
    program: LoyaltyProgram

    model_config = ConfigDict(from_attributes=True)
