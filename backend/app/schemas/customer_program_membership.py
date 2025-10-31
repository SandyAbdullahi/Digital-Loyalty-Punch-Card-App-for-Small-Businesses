from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class CustomerProgramMembershipBase(BaseModel):
    customer_user_id: UUID
    program_id: UUID
    current_balance: int = 0


class CustomerProgramMembershipCreate(CustomerProgramMembershipBase):
    pass


class CustomerProgramMembershipUpdate(BaseModel):
    current_balance: Optional[int] = None
    is_active: Optional[bool] = None


class CustomerProgramMembershipInDBBase(CustomerProgramMembershipBase):
    id: UUID
    joined_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True


class CustomerProgramMembership(CustomerProgramMembershipInDBBase):
    pass


class CustomerProgramMembershipInDB(CustomerProgramMembershipInDBBase):
    pass