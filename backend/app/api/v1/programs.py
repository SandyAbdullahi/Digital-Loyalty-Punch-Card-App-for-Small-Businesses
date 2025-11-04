from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...api.deps import get_current_user
from ...services.loyalty_program import (
    create_loyalty_program,
    get_loyalty_program,
    get_loyalty_programs_by_merchant,
    update_loyalty_program,
    delete_loyalty_program,
    get_public_loyalty_programs,
)
from ...schemas.loyalty_program import LoyaltyProgram, LoyaltyProgramCreate, LoyaltyProgramUpdate

router = APIRouter()


# Owner CRUD for programs
@router.post("/", response_model=LoyaltyProgram)
def create_program(
    program: LoyaltyProgramCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    # Assume current_user is email, get user and merchant
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    from ...models.user import UserRole
    user = get_user_by_email(db, current_user)
    role_value = getattr(user.role, "value", user.role) if user else None
    if not user or role_value not in ("merchant", UserRole.MERCHANT.value):
        raise HTTPException(status_code=403, detail="Not authorized")
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        raise HTTPException(status_code=404, detail="No merchant found")
    merchant = merchants[0]  # Assume first merchant
    return create_loyalty_program(db, program, merchant.id)


@router.get("/", response_model=List[LoyaltyProgram])
def read_programs(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    from ...models.user import UserRole
    user = get_user_by_email(db, current_user)
    role_value = getattr(user.role, "value", user.role) if user else None
    if not user or role_value not in ("merchant", UserRole.MERCHANT.value):
        raise HTTPException(status_code=403, detail="Not authorized")
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        return []
    merchant = merchants[0]
    return get_loyalty_programs_by_merchant(db, merchant.id)


@router.get("/{program_id}", response_model=LoyaltyProgram)
def read_program(
    program_id: UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    from ...models.user import UserRole
    program = get_loyalty_program(db, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    user = get_user_by_email(db, current_user)
    merchants = get_merchants_by_owner(db, user.id) if user else []
    if not merchants or program.merchant_id != merchants[0].id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return program


@router.put("/{program_id}", response_model=LoyaltyProgram)
def update_program(
    program_id: UUID,
    program_update: LoyaltyProgramUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    from ...models.user import UserRole
    program = get_loyalty_program(db, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    user = get_user_by_email(db, current_user)
    merchants = get_merchants_by_owner(db, user.id) if user else []
    if not merchants or program.merchant_id != merchants[0].id:
        raise HTTPException(status_code=403, detail="Not authorized")
    updated_program = update_loyalty_program(db, program_id, program_update)
    if not updated_program:
        raise HTTPException(status_code=404, detail="Program not found")
    return updated_program


@router.delete("/{program_id}")
def delete_program(
    program_id: UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    from ...models.user import UserRole
    program = get_loyalty_program(db, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    user = get_user_by_email(db, current_user)
    merchants = get_merchants_by_owner(db, user.id) if user else []
    if not merchants or program.merchant_id != merchants[0].id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if delete_loyalty_program(db, program_id):
        return {"message": "Program deleted"}
    raise HTTPException(status_code=404, detail="Program not found")


# Public reads
@router.get("/public", response_model=List[LoyaltyProgram])
def read_public_programs(db: Session = Depends(get_db)):
    return get_public_loyalty_programs(db)
