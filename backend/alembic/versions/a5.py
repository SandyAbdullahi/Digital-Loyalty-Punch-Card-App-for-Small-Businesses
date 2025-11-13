"""Add name to locations

Revision ID: a5
Revises: a4
Create Date: 2025-11-05 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'a5'
down_revision: Union[str, None] = 'a4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("locations", sa.Column("name", sa.String(), nullable=False))


def downgrade() -> None:
    op.drop_column("locations", "name")