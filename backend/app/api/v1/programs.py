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
from ...schemas.reward import RedeemRequest, CustomerRedemption

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


# Customer redeem
@router.post("/{program_id}/redeem")
def redeem_stamps(
    program_id: UUID,
    request: RedeemRequest,
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
    if program.redeem_rule:
        import json
        try:
            redeem_rule = json.loads(program.redeem_rule) if isinstance(program.redeem_rule, str) else program.redeem_rule
            max_value = redeem_rule.get("max_value", 10)  # Default 10
            if request.amount > max_value:
                raise HTTPException(status_code=400, detail=f"Cannot redeem more than {max_value} stamps at once")
        except (json.JSONDecodeError, TypeError):
            pass  # Use default

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
    from ...services.auth import get_user_by_email
    from ...services.membership import get_membership_by_customer_and_program
    from ...models.redeem_code import RedeemCode

    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    membership = get_membership_by_customer_and_program(db, user.id, program_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    codes = (
        db.query(RedeemCode)
        .options(joinedload(RedeemCode.program).joinedload(LoyaltyProgramModel.merchant))
        .filter(RedeemCode.membership_id == membership.id)
        .order_by(desc(RedeemCode.created_at))
        .limit(30)
        .all()
    )

    now_utc = datetime.now(timezone.utc)
    redemptions: List[CustomerRedemption] = []

    for code in codes:
        created_at = code.created_at or datetime.utcnow()
        if created_at.tzinfo is None or created_at.tzinfo.utcoffset(created_at) is None:
            # Database stores times in UTC+3, convert to UTC
            utc_time = created_at - timedelta(hours=3)
            created_at = utc_time.replace(tzinfo=timezone.utc)

        expires_at = code.expires_at
        if expires_at is not None and (expires_at.tzinfo is None or expires_at.tzinfo.utcoffset(expires_at) is None):
            # Database stores times in UTC+3, convert to UTC
            utc_time = expires_at - timedelta(hours=3)
            expires_at = utc_time.replace(tzinfo=timezone.utc)

        used_at = code.used_at
        if used_at is not None and (used_at.tzinfo is None or used_at.tzinfo.utcoffset(used_at) is None):
            # Database stores times in UTC+3, convert to UTC
            utc_time = used_at - timedelta(hours=3)
            used_at = utc_time.replace(tzinfo=timezone.utc)

        is_used = str(code.is_used).lower() == "true"
        if is_used:
            status = "redeemed"
        elif expires_at and expires_at < now_utc:
            status = "expired"
        else:
            status = "claimed"

        program_obj = getattr(code, "program", None)
        merchant_obj = getattr(program_obj, "merchant", None) if program_obj else None
        program_name = (
            getattr(program_obj, "name", None)
            or getattr(program_obj, "display_name", None)
            or "Programme"
        )
        merchant_name = (
            getattr(merchant_obj, "display_name", None)
            or getattr(merchant_obj, "legal_name", None)
            or "Merchant"
        )
        reward_description = getattr(program_obj, "reward_description", None) if program_obj else None

        amount_raw = (code.amount or "0").strip() or "0"
        try:
            stamps_redeemed = int(amount_raw)
        except ValueError:
            stamps_redeemed = None

        redemptions.append(
            CustomerRedemption(
                id=str(code.id),
                code=code.code,
                status=status,
                amount=amount_raw,
                created_at=created_at.isoformat(),
                expires_at=expires_at.isoformat() if expires_at else None,
                used_at=used_at.isoformat() if used_at else None,
                program_name=program_name,
                merchant_name=merchant_name,
                reward_description=reward_description,
                stamps_redeemed=stamps_redeemed,
            )
        )

    return redemptions
