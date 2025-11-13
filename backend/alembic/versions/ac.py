"""add missing columns to loyalty_programs and ledger_entries

Revision ID: ac
Revises: ab
Create Date: 2025-11-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'ac'
down_revision: Union[str, None] = 'ab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add columns to loyalty_programs
    op.add_column('loyalty_programs', sa.Column('reward_description', sa.Text(), nullable=True))
    op.add_column('loyalty_programs', sa.Column('reward_value_hint_kes', sa.Numeric(precision=12, scale=2), nullable=True))
    op.add_column('loyalty_programs', sa.Column('reward_expiry_days', sa.Integer(), nullable=True))
    op.add_column('loyalty_programs', sa.Column('allow_repeat_cycles', sa.Boolean(), nullable=True, default=True))

    # Add column to ledger_entries
    op.add_column('ledger_entries', sa.Column('issued_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('ledger_entries', 'issued_at')
    op.drop_column('loyalty_programs', 'allow_repeat_cycles')
    op.drop_column('loyalty_programs', 'reward_expiry_days')
    op.drop_column('loyalty_programs', 'reward_value_hint_kes')
    op.drop_column('loyalty_programs', 'reward_description')