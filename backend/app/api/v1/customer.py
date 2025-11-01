from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...api.deps import get_current_user
from ...services.auth import get_user_by_email
from ...services.membership import get_memberships_by_customer
from ...schemas.customer_program_membership import CustomerProgramMembership

router = APIRouter()

@router.get("/memberships", response_model=List[CustomerProgramMembership])
def get_my_memberships(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_memberships_by_customer(db, user.id)