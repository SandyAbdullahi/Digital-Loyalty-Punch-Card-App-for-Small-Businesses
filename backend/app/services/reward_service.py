import base64
import hashlib
import hmac
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import and_, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..core.config import settings
from ..models import (
    AuditLog,
    CustomerProgramMembership,
    LedgerEntry,
    LedgerEntryType,
    LoyaltyProgram,
    Reward,
    RewardStatus,
    Stamp,
)


def _as_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def _log_audit(
    db: Session,
    *,
    actor_type: str,
    actor_id: uuid.UUID | None,
    action: str,
    entity: str,
    entity_id: uuid.UUID,
    details: Optional[dict] = None,
) -> None:
    audit = AuditLog(
        actor_type=actor_type,
        actor_id=actor_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        details=details or {},
    )
    db.add(audit)


def generate_voucher_code(reward_id: uuid.UUID, customer_id: uuid.UUID, cycle: int) -> str:
    """Generate a base32 HMAC voucher code."""
    secret = settings.SECRET_KEY.encode()
    data = f"{reward_id}:{customer_id}:{cycle}".encode()
    digest = hmac.new(secret, data, hashlib.sha256).digest()
    return base64.b32encode(digest).decode("utf-8")[:12]


def get_current_reward(db: Session, enrollment_id: uuid.UUID) -> Reward | None:
    return (
        db.query(Reward)
        .filter(Reward.enrollment_id == enrollment_id)
        .order_by(Reward.cycle.desc())
        .first()
    )


def ensure_reward_for_cycle(
    db: Session,
    enrollment: CustomerProgramMembership,
    program: LoyaltyProgram,
) -> Reward:
    reward = (
        db.query(Reward)
        .filter(
            Reward.enrollment_id == enrollment.id,
            Reward.cycle == enrollment.current_cycle,
        )
        .first()
    )
    if reward:
        return reward

    reward = Reward(
        enrollment_id=enrollment.id,
        program_id=program.id,
        merchant_id=program.merchant_id,
        customer_id=enrollment.customer_user_id,
        cycle=enrollment.current_cycle,
    )
    db.add(reward)
    db.flush()
    return reward


def get_stamps_in_cycle(db: Session, enrollment_id: uuid.UUID, cycle: int) -> int:
    return (
        db.query(func.count(Stamp.id))
        .filter(Stamp.enrollment_id == enrollment_id, Stamp.cycle == cycle)
        .scalar()
        or 0
    )


def transition_reward_to_redeemable(
    db: Session,
    *,
    reward: Reward,
    program: LoyaltyProgram,
) -> Reward:
    if reward.status != RewardStatus.INACTIVE:
        return reward

    reward.status = RewardStatus.REDEEMABLE
    reward.reached_at = datetime.now(timezone.utc)
    reward.voucher_code = generate_voucher_code(reward.id, reward.customer_id, reward.cycle)
    if program.reward_expiry_days:
        reward.redeem_expires_at = reward.reached_at + timedelta(days=program.reward_expiry_days)
    _log_audit(
        db,
        actor_type="system",
        actor_id=None,
        action="reward.reached",
        entity="reward",
        entity_id=reward.id,
        details={
            "cycle": reward.cycle,
            "program_id": str(program.id),
            "merchant_id": str(program.merchant_id),
        },
    )
    db.flush()
    return reward


def _start_next_cycle_if_allowed(
    db: Session,
    *,
    enrollment: CustomerProgramMembership,
    program: LoyaltyProgram,
) -> Optional[Reward]:
    if not program.allow_repeat_cycles:
        return None

    enrollment.current_cycle += 1
    enrollment.current_balance = 0
    db.flush()
    next_reward = Reward(
        enrollment_id=enrollment.id,
        program_id=program.id,
        merchant_id=program.merchant_id,
        customer_id=enrollment.customer_user_id,
        cycle=enrollment.current_cycle,
    )
    db.add(next_reward)
    db.flush()
    return next_reward


def _reset_reward_to_inactive(reward: Reward) -> None:
    reward.status = RewardStatus.INACTIVE
    reward.reached_at = None
    reward.voucher_code = None
    reward.redeem_expires_at = None
    reward.redeemed_at = None
    reward.redeemed_by_staff_id = None


def revoke_last_stamp(
    db: Session,
    *,
    enrollment_id: uuid.UUID,
    staff_id: Optional[uuid.UUID],
) -> CustomerProgramMembership:
    enrollment = (
        db.query(CustomerProgramMembership)
        .filter(CustomerProgramMembership.id == enrollment_id)
        .first()
    )
    if not enrollment:
        raise ValueError("Enrollment not found")

    program = db.query(LoyaltyProgram).filter(LoyaltyProgram.id == enrollment.program_id).first()
    if not program or not program.is_active:
        raise ValueError("Program not available")

    stamp = (
        db.query(Stamp)
        .filter(
            Stamp.enrollment_id == enrollment_id,
            Stamp.cycle == enrollment.current_cycle,
        )
        .order_by(Stamp.issued_at.desc())
        .first()
    )
    if not stamp:
        raise ValueError("No stamps to revoke")

    db.delete(stamp)
    enrollment.current_balance = max(0, enrollment.current_balance - 1)

    ledger_entry = LedgerEntry(
        membership_id=enrollment.id,
        merchant_id=program.merchant_id,
        program_id=program.id,
        customer_id=enrollment.customer_user_id,
        entry_type=LedgerEntryType.ADJUST,
        amount=-1,
        tx_id=stamp.tx_id,
        issued_by_staff_id=staff_id,
        issued_at=datetime.now(timezone.utc),
        notes="manual_revoke",
    )
    db.add(ledger_entry)

    _log_audit(
        db,
        actor_type="staff" if staff_id else "system",
        actor_id=staff_id,
        action="stamp.revoked",
        entity="stamp",
        entity_id=stamp.id,
        details={
            "program_id": str(program.id),
            "enrollment_id": str(enrollment.id),
            "cycle": stamp.cycle,
        },
    )

    reward = ensure_reward_for_cycle(db, enrollment, program)
    stamps_count = get_stamps_in_cycle(db, enrollment.id, reward.cycle)
    if reward.status == RewardStatus.REDEEMABLE and stamps_count < (program.stamps_required or 0):
        _reset_reward_to_inactive(reward)

    db.commit()
    db.refresh(enrollment)
    return enrollment


def issue_stamp(
    db: Session,
    *,
    enrollment_id: uuid.UUID,
    tx_id: str,
    staff_id: Optional[uuid.UUID],
) -> Stamp:
    enrollment = (
        db.query(CustomerProgramMembership)
        .filter(CustomerProgramMembership.id == enrollment_id)
        .first()
    )
    if not enrollment:
        raise ValueError("Enrollment not found")

    # Check idempotency
    existing_stamp = db.query(Stamp).filter(Stamp.tx_id == tx_id).first()
    if existing_stamp:
        return existing_stamp

    program = db.query(LoyaltyProgram).filter(LoyaltyProgram.id == enrollment.program_id).first()
    if not program or not program.is_active:
        raise ValueError("Program not available")

    reward = ensure_reward_for_cycle(db, enrollment, program)

    if reward.status == RewardStatus.REDEEMABLE:
        raise ValueError("Cannot issue stamps when reward is redeemable")

    enrollment.current_balance += 1

    stamp = Stamp(
        enrollment_id=enrollment.id,
        program_id=program.id,
        merchant_id=program.merchant_id,
        customer_id=enrollment.customer_user_id,
        tx_id=tx_id,
        issued_by_staff_id=staff_id,
        issued_at=datetime.now(timezone.utc),
        cycle=reward.cycle,
    )
    db.add(stamp)

    note = "scan_punch" if tx_id and tx_id.startswith("scan_") else "manual_issue"
    # Mirror ledger entry for analytics/notifications
    ledger_entry = LedgerEntry(
        membership_id=enrollment.id,
        merchant_id=program.merchant_id,
        program_id=program.id,
        customer_id=enrollment.customer_user_id,
        entry_type=LedgerEntryType.EARN,
        amount=1,
        tx_id=tx_id,
        issued_by_staff_id=staff_id,
        issued_at=stamp.issued_at,
        notes=note,
    )
    db.add(ledger_entry)

    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        existing = (
            db.query(Stamp)
            .filter(Stamp.program_id == program.id, Stamp.tx_id == tx_id)
            .first()
        )
        if not existing:
            raise
        return existing

    enrollment.last_visit_at = stamp.issued_at
    _log_audit(
        db,
        actor_type="staff" if staff_id else "system",
        actor_id=staff_id,
        action="stamp.issued",
        entity="stamp",
        entity_id=stamp.id,
        details={
            "program_id": str(program.id),
            "enrollment_id": str(enrollment.id),
            "cycle": reward.cycle,
        },
    )

    stamps_count = get_stamps_in_cycle(db, enrollment.id, reward.cycle)
    if stamps_count >= program.stamps_required:
        transition_reward_to_redeemable(db, reward=reward, program=program)

    db.commit()
    db.refresh(stamp)
    db.refresh(enrollment)
    return stamp


def redeem_reward(
    db: Session,
    *,
    reward_id: uuid.UUID,
    staff_id: uuid.UUID,
    merchant_id: uuid.UUID,
) -> Reward:
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise ValueError("Reward not found")
    if reward.merchant_id != merchant_id:
        raise PermissionError("Wrong merchant")
    if reward.status == RewardStatus.REDEEMED:
        return reward
    if reward.status != RewardStatus.REDEEMABLE:
        raise ValueError("Reward not redeemable")
    expires_at = _as_utc(reward.redeem_expires_at)
    if expires_at and datetime.now(timezone.utc) > expires_at:
        raise TimeoutError("Reward expired")

    reward.status = RewardStatus.REDEEMED
    reward.redeemed_at = datetime.now(timezone.utc)
    reward.redeemed_by_staff_id = staff_id
    _log_audit(
        db,
        actor_type="staff",
        actor_id=staff_id,
        action="reward.redeemed",
        entity="reward",
        entity_id=reward.id,
        details={"cycle": reward.cycle},
    )

    enrollment = (
        db.query(CustomerProgramMembership)
        .filter(CustomerProgramMembership.id == reward.enrollment_id)
        .first()
    )
    program = db.query(LoyaltyProgram).filter(LoyaltyProgram.id == reward.program_id).first()
    if enrollment and program:
        _start_next_cycle_if_allowed(db, enrollment=enrollment, program=program)

    db.commit()
    db.refresh(reward)
    return reward


def expire_reward(db: Session, reward: Reward) -> Reward:
    if reward.status != RewardStatus.REDEEMABLE:
        return reward
    expires_at = _as_utc(reward.redeem_expires_at)
    if expires_at and datetime.now(timezone.utc) <= expires_at:
        return reward

    reward.status = RewardStatus.EXPIRED
    _log_audit(
        db,
        actor_type="system",
        actor_id=None,
        action="reward.expired",
        entity="reward",
        entity_id=reward.id,
        details={"cycle": reward.cycle},
    )

    enrollment = (
        db.query(CustomerProgramMembership)
        .filter(CustomerProgramMembership.id == reward.enrollment_id)
        .first()
    )
    program = db.query(LoyaltyProgram).filter(LoyaltyProgram.id == reward.program_id).first()
    if enrollment and program:
        _start_next_cycle_if_allowed(db, enrollment=enrollment, program=program)

    db.commit()
    db.refresh(reward)
    return reward


def get_reward_state(db: Session, enrollment_id: uuid.UUID) -> Reward | None:
    return (
        db.query(Reward)
        .filter(
            Reward.enrollment_id == enrollment_id,
        )
        .order_by(Reward.cycle.desc())
        .first()
    )
