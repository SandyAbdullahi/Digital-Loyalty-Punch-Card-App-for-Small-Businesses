from sqlalchemy.orm import Session
from uuid import UUID

from ..models.customer_program_membership import CustomerProgramMembership
from ..models.ledger_entry import LedgerEntry, LedgerEntryType
from ..schemas.customer_program_membership import CustomerProgramMembershipCreate
from ..schemas.ledger_entry import LedgerEntryCreate


def get_membership(db: Session, membership_id: UUID) -> CustomerProgramMembership | None:
    return db.query(CustomerProgramMembership).filter(CustomerProgramMembership.id == membership_id).first()


def get_membership_by_customer_and_program(db: Session, customer_user_id: UUID, program_id: UUID) -> CustomerProgramMembership | None:
    return db.query(CustomerProgramMembership).filter(
        CustomerProgramMembership.customer_user_id == customer_user_id,
        CustomerProgramMembership.program_id == program_id
    ).first()


def create_membership(db: Session, membership: CustomerProgramMembershipCreate) -> CustomerProgramMembership:
    db_membership = CustomerProgramMembership(
        customer_user_id=membership.customer_user_id,
        program_id=membership.program_id,
        current_balance=membership.current_balance,
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
    db_entry = LedgerEntry(
        membership_id=entry.membership_id,
        entry_type=entry.entry_type,
        amount=entry.amount,
        tx_ref=entry.tx_ref,
        device_fingerprint=entry.device_fingerprint,
        notes=entry.notes,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def earn_stamps(db: Session, membership_id: UUID, amount: int, tx_ref: str | None = None, device_fingerprint: str | None = None) -> CustomerProgramMembership | None:
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
            tx_ref=tx_ref,
            device_fingerprint=device_fingerprint,
        ))
    return membership


def redeem_stamps(db: Session, membership_id: UUID, amount: int, tx_ref: str | None = None, device_fingerprint: str | None = None) -> CustomerProgramMembership | None:
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
            tx_ref=tx_ref,
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