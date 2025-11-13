from datetime import datetime, timezone, timedelta
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

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
from ...models.loyalty_program import LoyaltyProgram as LoyaltyProgramModel
from ...schemas.reward import RedeemStampsRequest, CustomerRedemption

router = APIRouter()


# Owner CRUD for programs
@router.post("/", response_model=LoyaltyProgram)
def create_program(
    program: LoyaltyProgramCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    try:
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
    except Exception as e:
        print(f"Error in create_program: {e}")
        import traceback
        traceback.print_exc()
        # Check if it's a duplicate name error
        if "uq_loyalty_programs_merchant_name" in str(e):
            raise HTTPException(status_code=400, detail="Program name already exists for this merchant")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/", response_model=List[LoyaltyProgram])
def read_programs(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    from ...services.auth import get_user_by_email
    from ...services.merchant import get_merchants_by_owner
    from ...models.user import UserRole
    try:
        user = get_user_by_email(db, current_user)
        role_value = getattr(user.role, "value", user.role) if user else None
        if not user or role_value not in ("merchant", UserRole.MERCHANT.value):
            raise HTTPException(status_code=403, detail="Not authorized")
        merchants = get_merchants_by_owner(db, user.id)
        if not merchants:
            return []
        merchant = merchants[0]
        return get_loyalty_programs_by_merchant(db, merchant.id)
    except Exception as e:
        print(f"Error in read_programs: {e}")
        import traceback
        traceback.print_exc()
        return []


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


# Customer redeem
@router.post("/{program_id}/redeem")
def redeem_stamps(
    program_id: UUID,
    request: RedeemStampsRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    from ...services.auth import get_user_by_email
    from ...services.membership import get_membership_by_customer_and_program, redeem_stamps_with_code

    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    membership = get_membership_by_customer_and_program(db, user.id, program_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    # Get redeem rule to check max value
    program = membership.program
    if program.logic_type == 'points':
        # For points programs, allow partial redeem but check balance
        if request.amount > membership.current_balance:
            raise HTTPException(status_code=400, detail=f"Cannot redeem more than {membership.current_balance} points")
    else:
        # For punch card programs, must redeem full amount
        # Use the same logic as frontend to determine required amount
        import json

        def parse_rule(rule):
            if isinstance(rule, str):
                try:
                    return json.loads(rule)
                except json.JSONDecodeError:
                    return {}
            return rule or {}

        parsed_redeem_rule = parse_rule(program.redeem_rule)
        parsed_earn_rule = parse_rule(program.earn_rule)

        required_stamps = (
            getattr(program, 'stamps_required', None) or
            parsed_redeem_rule.get('stamps_needed') or
            parsed_redeem_rule.get('threshold') or
            parsed_redeem_rule.get('reward_threshold') or
            parsed_redeem_rule.get('max_value') or
            parsed_earn_rule.get('stamps_needed') or
            parsed_earn_rule.get('threshold') or
            getattr(program, 'reward_threshold', None) or
            10
        )
        if request.amount != required_stamps:
            raise HTTPException(status_code=400, detail=f"Must redeem exactly {required_stamps} stamps for this program")

    result = redeem_stamps_with_code(db, membership.id, request.amount, request.idempotency_key)
    if not result:
        raise HTTPException(status_code=400, detail="Insufficient balance to redeem this reward")

    return result


@router.get("/{program_id}/redemptions", response_model=List[CustomerRedemption])
def get_redemptions_for_customer(
    program_id: UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
 ):
    try:
        from ...services.auth import get_user_by_email
        from ...services.membership import get_membership_by_customer_and_program
        from ...models.reward import RedeemCode

        user = get_user_by_email(db, current_user)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        membership = get_membership_by_customer_and_program(db, user.id, program_id)
        if not membership:
            raise HTTPException(status_code=404, detail="Membership not found")

        # Temporarily return empty
        return []
    except Exception as e:
        print(f"Error in get_redemptions_for_customer: {e}")
        import traceback
        traceback.print_exc()
        return []
