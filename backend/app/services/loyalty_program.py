import json
from sqlalchemy.orm import Session
from uuid import UUID

from ..models.loyalty_program import LoyaltyProgram
from ..schemas.loyalty_program import LoyaltyProgramCreate, LoyaltyProgramUpdate


def get_loyalty_program(db: Session, program_id: UUID) -> LoyaltyProgram | None:
    return db.query(LoyaltyProgram).filter(LoyaltyProgram.id == program_id).first()


def get_loyalty_programs_by_merchant(db: Session, merchant_id: UUID) -> list[LoyaltyProgram]:
    return db.query(LoyaltyProgram).filter(LoyaltyProgram.merchant_id == merchant_id).all()


def create_loyalty_program(db: Session, program: LoyaltyProgramCreate, merchant_id: UUID) -> LoyaltyProgram:
    db_program = LoyaltyProgram(
        merchant_id=merchant_id,
        name=program.name,
        description=program.description,
        logic_type=program.logic_type,
        earn_rule=json.dumps(program.earn_rule),
        redeem_rule=json.dumps(program.redeem_rule),
        terms=program.terms,
        stamp_icon=program.stamp_icon,
    )
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program


def update_loyalty_program(db: Session, program_id: UUID, program_update: LoyaltyProgramUpdate) -> LoyaltyProgram | None:
    db_program = db.query(LoyaltyProgram).filter(LoyaltyProgram.id == program_id).first()
    if db_program:
        update_data = program_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field in ['earn_rule', 'redeem_rule']:
                setattr(db_program, field, json.dumps(value))
            else:
                setattr(db_program, field, value)
        db.commit()
        db.refresh(db_program)
    return db_program


def delete_loyalty_program(db: Session, program_id: UUID) -> bool:
    db_program = db.query(LoyaltyProgram).filter(LoyaltyProgram.id == program_id).first()
    if db_program:
        db.delete(db_program)
        db.commit()
        return True
    return False


def get_public_loyalty_programs(db: Session) -> list[LoyaltyProgram]:
    return db.query(LoyaltyProgram).filter(LoyaltyProgram.is_active == True).all()