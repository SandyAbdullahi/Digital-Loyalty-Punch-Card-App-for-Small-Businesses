"""add remaining columns to loyalty_programs

Revision ID: ad
Revises: ac
Create Date: 2025-11-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ad'
down_revision: Union[str, None] = 'ac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('loyalty_programs', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('loyalty_programs', sa.Column('updated_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('loyalty_programs', 'updated_at')
    op.drop_column('loyalty_programs', 'created_at')