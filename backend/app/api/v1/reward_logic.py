import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from ...api.deps import get_current_user
from ...core.security import verify_jws_token
from ...db.session import get_db
from ...models import (
    CustomerProgramMembership,
    LoyaltyProgram,
    Merchant,
    Reward,
    RewardStatus,
    UserRole,
)
from ...schemas.customer_program_membership import (
    CustomerProgramMembership as EnrollmentSchema,
    CustomerProgramMembershipCreate,
)
from ...schemas.reward import RedeemRequest, Reward as RewardSchema, StampIssueRequest
from ...services.auth import get_user_by_email
from ...services.membership import (
    create_membership,
    get_membership,
    get_membership_by_customer_and_program,
)
from ...services.merchant import get_merchants_by_owner
from ...services.reward_service import (
    ensure_reward_for_cycle,
    expire_reward as expire_reward_service,
    get_reward_state,
    get_stamps_in_cycle,
    issue_stamp as issue_stamp_service,
    redeem_reward as redeem_reward_service,
)
from ...core.timezone import to_local, now_local, format_local, now_local_iso
from ..v1.qr import _claim_nonce_or_raise, check_geofence, redis_client
from ..v1.websocket import get_websocket_manager

router = APIRouter()


class EnrollmentRequest(BaseModel):
    qr_token: str
    lat: Optional[float] = None
    lng: Optional[float] = None


class RewardResponse(BaseModel):
    reward: RewardSchema
    stamps_in_cycle: int
    stamps_required: int


def _require_user(db: Session, current_user: str):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/programs/{program_id}/enroll")
def enroll_in_program(
    program_id: uuid.UUID,
    request: EnrollmentRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = _require_user(db, current_user)
    if user.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only customers can enroll")

    payload = verify_jws_token(request.qr_token)
    if payload.get("type") != "join":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid QR token type")
    if payload.get("program_id") != str(program_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="QR token does not match program")
    exp_ts = payload.get("exp")
    if exp_ts and datetime.now(timezone.utc).timestamp() > exp_ts:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="QR code expired")

    nonce = payload.get("nonce")
    if nonce:
        _claim_nonce_or_raise(db, nonce)
        try:
            redis_client.setex(nonce, 60, "used")
        except Exception:
            pass

    program: LoyaltyProgram | None = (
        db.query(LoyaltyProgram)
        .options(joinedload(LoyaltyProgram.merchant).joinedload(Merchant.locations))
        .filter(LoyaltyProgram.id == program_id, LoyaltyProgram.is_active.is_(True))
        .first()
    )
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

    if request.lat is not None and request.lng is not None and program.merchant.locations:
        location = program.merchant.locations[0]
        if not check_geofence(request.lat, request.lng, location.lat, location.lng):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Customer not near merchant location")

    membership = get_membership_by_customer_and_program(db, user.id, program_id)
    if not membership:
        membership = create_membership(
            db,
            CustomerProgramMembershipCreate(
                customer_user_id=user.id,
                program_id=program_id,
                merchant_id=program.merchant_id,
            ),
        )

    reward = ensure_reward_for_cycle(db, membership, program)
    db.commit()
    db.refresh(reward)

    return {
        "enrollment": EnrollmentSchema.model_validate(membership),
        "reward": RewardSchema.model_validate(reward),
    }


@router.post("/enrollments/{enrollment_id}/stamps")
def issue_stamp(
    enrollment_id: uuid.UUID,
    request: StampIssueRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = _require_user(db, current_user)
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No merchant access")

    enrollment = get_membership(db, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    if enrollment.merchant_id not in {m.id for m in merchants}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot issue stamp for this merchant")

    try:
        stamp = issue_stamp_service(
            db,
            enrollment_id=enrollment_id,
            tx_id=request.tx_id,
            staff_id=request.issued_by_staff_id or user.id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    reward = get_reward_state(db, enrollment_id)
    program = db.query(LoyaltyProgram).filter(LoyaltyProgram.id == enrollment.program_id).first()
    stamps_in_cycle = get_stamps_in_cycle(db, enrollment_id, reward.cycle if reward else enrollment.current_cycle)

    return {
        "stamp": {
            "id": str(stamp.id),
            "txId": stamp.tx_id,
            "issuedAt": format_local(stamp.issued_at) or now_local_iso(),
            "cycle": stamp.cycle,
        },
        "reward": RewardSchema.model_validate(reward) if reward else None,
        "stampsInCycle": stamps_in_cycle,
        "stampsRequired": program.stamps_required if program else None,
    }


@router.get("/enrollments/{enrollment_id}/reward", response_model=RewardResponse)
def get_reward(
    enrollment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = _require_user(db, current_user)
    enrollment = get_membership(db, enrollment_id)
    if not enrollment or enrollment.customer_user_id != user.id and user.role != UserRole.MERCHANT:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")

    program = db.query(LoyaltyProgram).filter(LoyaltyProgram.id == enrollment.program_id).first()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

    reward = get_reward_state(db, enrollment_id)
    if not reward:
        reward = ensure_reward_for_cycle(db, enrollment, program)

    stamps_in_cycle = get_stamps_in_cycle(db, enrollment_id, reward.cycle)
    return RewardResponse(
        reward=RewardSchema.model_validate(reward),
        stamps_in_cycle=stamps_in_cycle,
        stamps_required=program.stamps_required if program else 0,
    )


@router.post("/rewards/{reward_id}/redeem")
def redeem_reward(
    reward_id: uuid.UUID,
    request: RedeemRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = _require_user(db, current_user)
    merchants = get_merchants_by_owner(db, user.id)
    if not merchants:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No merchant access")

    reward: Reward | None = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
    if reward.merchant_id not in {m.id for m in merchants}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot redeem for this merchant")
    if request.voucher_code and reward.voucher_code != request.voucher_code:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Voucher code mismatch")

    if reward.status == RewardStatus.REDEEMED:
        return {
            "reward": RewardSchema.model_validate(reward),
            "alreadyRedeemed": True,
        }

    try:
        updated = redeem_reward_service(
            db,
            reward_id=reward_id,
            staff_id=request.redeemed_by_staff_id or user.id,
            merchant_id=reward.merchant_id,
        )
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    except TimeoutError:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Reward expired")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))

    program = (
        db.query(LoyaltyProgram)
        .options(joinedload(LoyaltyProgram.merchant))
        .filter(LoyaltyProgram.id == updated.program_id)
        .first()
    )
    enrollment = (
        db.query(CustomerProgramMembership)
        .filter(CustomerProgramMembership.id == updated.enrollment_id)
        .first()
    )
    current_balance = enrollment.current_balance if enrollment else 0

    ws_manager = get_websocket_manager()
    try:
        ws_manager.broadcast_reward_status_sync(
            str(updated.customer_id),
            {
                "reward_id": str(updated.id),
                "program_id": str(updated.program_id),
                "status": updated.status,
                "timestamp": format_local(updated.redeemed_at) or now_local_iso(),
            },
        )
        ws_manager.broadcast_stamp_update_sync(
            str(updated.customer_id),
            str(updated.program_id),
            current_balance,
        )
        if program and program.merchant:
            ws_manager.broadcast_merchant_reward_update_sync(
                str(program.merchant.owner_user_id),
                {
                    "reward_id": str(updated.id),
                    "status": updated.status,
                    "program_id": str(updated.program_id),
                    "timestamp": format_local(updated.redeemed_at) or now_local_iso(),
                },
            )
            ws_manager.broadcast_merchant_customer_update_sync(
                str(program.merchant.owner_user_id),
                {
                    "customer_id": str(updated.customer_id),
                    "program_id": str(updated.program_id),
                    "program_name": program.name,
                    "new_balance": current_balance,
                    "timestamp": format_local(updated.redeemed_at) or now_local_iso(),
                },
            )
    except Exception as exc:
        print(f"Failed to broadcast reward redemption: {exc}")

    return {
        "reward": RewardSchema.model_validate(updated),
        "alreadyRedeemed": False,
    }


@router.post("/rewards/{reward_id}/request")
def request_reward_redeem(
    reward_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = _require_user(db, current_user)
    if user.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only customers can request redeem")

    reward: Reward | None = (
        db.query(Reward)
        .filter(Reward.id == reward_id, Reward.customer_id == user.id)
        .first()
    )
    if not reward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
    if reward.status != RewardStatus.REDEEMABLE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reward not redeemable")

    program = (
        db.query(LoyaltyProgram)
        .options(joinedload(LoyaltyProgram.merchant))
        .filter(LoyaltyProgram.id == reward.program_id)
        .first()
    )
    if not program or not program.merchant:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Program not available")

    ws_manager = get_websocket_manager()
    try:
        customer_name = user.name or user.email.split("@")[0]
        ws_manager.broadcast_redeem_notification_sync(
            str(program.merchant.owner_user_id),
            customer_name,
            program.name or "Program",
            program.stamps_required or 0,
            reward.voucher_code or reward.id.hex,
            str(reward.id),
        )
    except Exception as exc:
        print(f"Failed to broadcast reward request: {exc}")

    return {"reward": RewardSchema.model_validate(reward), "notified": True}


@router.post("/rewards/{reward_id}/expire")
def expire_reward_endpoint(
    reward_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = _require_user(db, current_user)
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    reward: Reward | None = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")

    updated = expire_reward_service(db, reward)
    return {"reward": RewardSchema.model_validate(updated)}
