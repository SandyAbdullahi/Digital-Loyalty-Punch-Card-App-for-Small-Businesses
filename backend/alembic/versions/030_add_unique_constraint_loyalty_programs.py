"""add unique constraint to loyalty_programs

Revision ID: 030
Revises: 02908266fff9
Create Date: 2025-11-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '030'
down_revision: Union[str, None] = '02908266fff9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint('uq_loyalty_programs_merchant_name', 'loyalty_programs', ['merchant_id', 'name'])


def downgrade() -> None:
    op.drop_constraint('uq_loyalty_programs_merchant_name', 'loyalty_programs', type_='unique')