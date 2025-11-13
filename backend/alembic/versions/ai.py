"""add missing columns to ledger_entries

Revision ID: ai
Revises: ah
Create Date: 2025-11-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'ai'
down_revision: Union[str, None] = 'ah'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename tx_ref to tx_id
    op.alter_column('ledger_entries', 'tx_ref', new_column_name='tx_id', existing_type=sa.String(), existing_nullable=True)
    # Add issued_by_staff_id
    op.add_column('ledger_entries', sa.Column('issued_by_staff_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(None, 'ledger_entries', 'users', ['issued_by_staff_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint(None, 'ledger_entries', type_='foreignkey')
    op.drop_column('ledger_entries', 'issued_by_staff_id')
    op.alter_column('ledger_entries', 'tx_id', new_column_name='tx_ref', existing_type=sa.String(), existing_nullable=True)