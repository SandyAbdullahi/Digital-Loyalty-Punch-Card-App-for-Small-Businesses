from sqlalchemy.orm import Session, joinedload, joinedload
from uuid import UUID
from datetime import datetime, timedelta, timezone
import secrets

from ..models.customer_program_membership import CustomerProgramMembership, JoinedVia
from ..models.loyalty_program import LoyaltyProgram
from ..models.ledger_entry import LedgerEntry, LedgerEntryType
from ..models.reward import Reward
from ..schemas.customer_program_membership import CustomerProgramMembershipCreate, CustomerProgramMembershipWithDetails
from ..schemas.ledger_entry import LedgerEntryCreate
from ..core.config import settings


def get_membership(db: Session, membership_id: UUID) -> CustomerProgramMembership | None:
    return db.query(CustomerProgramMembership).options(joinedload(CustomerProgramMembership.program)).filter(CustomerProgramMembership.id == membership_id).first()


def get_membership_by_customer_and_program(db: Session, customer_user_id: UUID, program_id: UUID) -> CustomerProgramMembership | None:
    return db.query(CustomerProgramMembership).options(joinedload(CustomerProgramMembership.program)).filter(
        CustomerProgramMembership.customer_user_id == customer_user_id,
        CustomerProgramMembership.program_id == program_id
    ).first()


def get_memberships_by_customer(db: Session, customer_user_id: UUID) -> list[CustomerProgramMembership]:
    return db.query(CustomerProgramMembership).filter(
        CustomerProgramMembership.customer_user_id == customer_user_id
    ).all()


def get_memberships_with_details_by_customer(db: Session, customer_user_id: UUID) -> list[CustomerProgramMembershipWithDetails]:
    return db.query(CustomerProgramMembership).options(
        joinedload(CustomerProgramMembership.program).joinedload(LoyaltyProgram.merchant)
    ).filter(
        CustomerProgramMembership.customer_user_id == customer_user_id
    ).all()


def create_membership(db: Session, membership: CustomerProgramMembershipCreate) -> CustomerProgramMembership:
    # Always derive merchant/program relationships server-side for integrity
    program = db.query(LoyaltyProgram).filter(LoyaltyProgram.id == membership.program_id).first()
    if not program:
        raise ValueError("Program not found for enrollment")

    db_membership = CustomerProgramMembership(
        customer_user_id=membership.customer_user_id,
        program_id=membership.program_id,
        merchant_id=membership.merchant_id or program.merchant_id,
        joined_via=membership.joined_via or JoinedVia.QR,
        current_balance=membership.current_balance,
        current_cycle=membership.current_cycle,
    )
    db.add(db_membership)
    db.commit()
    db.refresh(db_membership)
    return db_membership


def update_membership_balance(db: Session, membership_id: UUID, new_balance: int) -> CustomerProgramMembership | None:
    membership = db.query(CustomerProgramMembership).filter(CustomerProgramMembership.id == membership_id).first()
    if membership:
        old_balance = membership.current_balance
        membership.current_balance = new_balance
        db.commit()
        db.refresh(membership)
        # Note: Ledger entry should be created separately
    return membership


def create_ledger_entry(db: Session, entry: LedgerEntryCreate) -> LedgerEntry:
    # Fetch membership to get merchant_id, program_id, customer_id
    membership = db.query(CustomerProgramMembership).filter(CustomerProgramMembership.id == entry.membership_id).first()
    if not membership:
        raise ValueError("Membership not found")

    program = membership.program
    merchant_id = program.merchant_id
    program_id = program.id
    customer_id = membership.customer_user_id

    db_entry = LedgerEntry(
        membership_id=entry.membership_id,
        merchant_id=merchant_id,
        program_id=program_id,
        customer_id=customer_id,
        entry_type=entry.entry_type,
        amount=entry.amount,
        tx_id=entry.tx_id,
        device_fingerprint=entry.device_fingerprint,
        notes=entry.notes,
        created_at=datetime.utcnow(),
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def earn_stamps(
    db: Session,
    membership_id: UUID,
    amount: int,
    tx_id: str | None = None,
    device_fingerprint: str | None = None,
    notes: str | None = None,
) -> CustomerProgramMembership | None:
    membership = get_membership(db, membership_id)
    if membership:
        membership.current_balance += amount
        db.commit()
        db.refresh(membership)
        # Write to ledger
        create_ledger_entry(db, LedgerEntryCreate(
            membership_id=membership_id,
            entry_type=LedgerEntryType.EARN,
            amount=amount,
            tx_id=tx_id,
            device_fingerprint=device_fingerprint,
            notes=notes,
        ))
    return membership


def redeem_stamps(db: Session, membership_id: UUID, amount: int, tx_id: str | None = None, device_fingerprint: str | None = None) -> CustomerProgramMembership | None:
    membership = get_membership(db, membership_id)
    if membership and membership.current_balance >= amount:
        membership.current_balance -= amount
        db.commit()
        db.refresh(membership)
        # Write to ledger
        create_ledger_entry(db, LedgerEntryCreate(
            membership_id=membership_id,
            entry_type=LedgerEntryType.REDEEM,
            amount=amount,
            tx_id=tx_id,
            device_fingerprint=device_fingerprint,
        ))
    return membership


def adjust_balance(db: Session, membership_id: UUID, adjustment: int, notes: str | None = None, device_fingerprint: str | None = None) -> CustomerProgramMembership | None:
    membership = get_membership(db, membership_id)
    if membership:
        membership.current_balance += adjustment
        db.commit()
        db.refresh(membership)
        # Write to ledger
        create_ledger_entry(db, LedgerEntryCreate(
            membership_id=membership_id,
            entry_type=LedgerEntryType.ADJUST,
            amount=adjustment,
            device_fingerprint=device_fingerprint,
            notes=notes,
        ))
    return membership


def redeem_stamps_with_code(db: Session, membership_id: UUID, amount: int, idempotency_key: str | None = None, device_fingerprint: str | None = None) -> dict | None:
    """Redeem stamps and generate a redeem code valid for 10 minutes."""
    try:
        membership = get_membership(db, membership_id)
        if not membership or membership.current_balance < amount:
            return None

        # Check idempotency if provided
        if idempotency_key:
            existing_code = db.query(Reward).filter(
                Reward.enrollment_id == membership_id,
                Reward.voucher_code.like(f"%{idempotency_key}%")  # Simple check, could be improved
            ).first()
            if existing_code:
                # Return existing code if not expired
                expires_at_existing = existing_code.redeem_expires_at
                now = datetime.now()
                if expires_at_existing and expires_at_existing > now:
                    return {
                        "code": existing_code.voucher_code,
                        "expires_at": expires_at_existing.isoformat(),
                        "amount": str(amount),  # Placeholder
                        "status": "claimed",
                    }
                else:
                    return None  # Expired, don't allow retry

        # Generate JTI redeem code
        jti = secrets.token_urlsafe(16)  # 22 chars
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=600)

        # Atomic balance reduction and cycle increment
        membership.current_balance -= amount
        membership.current_cycle += 1
        db.commit()
        db.refresh(membership)

        # Create reward
        reward = Reward(
            enrollment_id=membership_id,
            program_id=membership.program_id,
            customer_id=membership.customer_user_id,
            merchant_id=membership.program.merchant_id,
            voucher_code=jti,
            redeem_expires_at=expires_at,
            status="redeemable",
            cycle=membership.current_cycle - 1  # The cycle for this reward
        )
        db.add(reward)
        db.commit()
        db.refresh(reward)

        # Write to ledger
        create_ledger_entry(db, LedgerEntryCreate(
            membership_id=membership_id,
            entry_type=LedgerEntryType.REDEEM,
            amount=amount,
            tx_id=jti,
            device_fingerprint=device_fingerprint,
        ))

        reward_description = getattr(membership.program, "reward_description", None)

        # Broadcast notification to merchant
        try:
            from .websocket import get_websocket_manager

            ws_manager = get_websocket_manager()
            customer_name = getattr(membership.customer, "name", None) or (
                getattr(membership.customer, "email", "Customer").split("@")[0]
            )
            program_name = getattr(membership.program, "name", "Program")
            merchant_user_id = str(membership.program.merchant.owner_user_id)

            ws_manager.broadcast_redeem_notification_sync(
                merchant_user_id,
                customer_name,
                program_name,
                amount,
                jti,
            )
        except Exception as e:
            # Don't fail the redeem if WebSocket broadcast fails
            print(f"Failed to broadcast redeem notification: {e}")

        return {
            "code": reward.voucher_code,
            "expires_at": expires_at.isoformat(),
            "amount": str(amount),
            "status": "claimed",
        }
    except Exception as e:
        print(f"Error in redeem_stamps_with_code: {e}")
        import traceback
        traceback.print_exc()
        return None
