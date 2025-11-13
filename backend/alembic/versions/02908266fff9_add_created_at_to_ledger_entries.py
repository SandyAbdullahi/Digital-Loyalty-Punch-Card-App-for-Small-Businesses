"""add created_at to ledger_entries

Revision ID: 02908266fff9
Revises: ai
Create Date: 2025-11-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '02908266fff9'
down_revision: Union[str, None] = 'ai'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Since the column already exists, make it not null
    op.alter_column('ledger_entries', 'created_at', nullable=False, server_default=sa.text('now()'))


def downgrade() -> None:
    op.alter_column('ledger_entries', 'created_at', nullable=True)