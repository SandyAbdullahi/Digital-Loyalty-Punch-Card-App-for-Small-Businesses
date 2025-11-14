"""add expires_at to loyalty_programs

Revision ID: al
Revises: ak
Create Date: 2025-11-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'al'
down_revision: Union[str, None] = 'ak'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('loyalty_programs', sa.Column('expires_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('loyalty_programs', 'expires_at')