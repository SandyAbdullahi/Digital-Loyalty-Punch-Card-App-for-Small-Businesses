"""Add description, website, phone to merchants

Revision ID: a4
Revises: a3
Create Date: 2025-11-04 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'a4'
down_revision: Union[str, None] = 'a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("merchants", sa.Column("address", sa.String(), nullable=True))
    op.add_column("merchants", sa.Column("description", sa.String(), nullable=True))
    op.add_column("merchants", sa.Column("website", sa.String(), nullable=True))
    op.add_column("merchants", sa.Column("phone", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("merchants", "address")
    op.drop_column("merchants", "description")
    op.drop_column("merchants", "website")
    op.drop_column("merchants", "phone")