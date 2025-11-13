"""add stamps_required to loyalty_programs

Revision ID: ab
Revises: aa
Create Date: 2025-11-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab'
down_revision: Union[str, None] = 'aa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('loyalty_programs', sa.Column('stamps_required', sa.Integer(), nullable=True, server_default='10'))
    op.execute("UPDATE loyalty_programs SET stamps_required = 10 WHERE stamps_required IS NULL")
    op.alter_column('loyalty_programs', 'stamps_required', nullable=False)


def downgrade() -> None:
    op.drop_column('loyalty_programs', 'stamps_required')