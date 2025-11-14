"""add max_redemptions_per_day to loyalty_programs

Revision ID: aj
Revises: ai
Create Date: 2025-11-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aj'
down_revision: Union[str, None] = 'ai'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('loyalty_programs', sa.Column('max_redemptions_per_day', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('loyalty_programs', 'max_redemptions_per_day')