"""Add description, website, phone to merchants

Revision ID: 20251104_add_merchant_fields
Revises: 20231103_add_avatar_url
Create Date: 2025-11-04 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20251104_add_merchant_fields"
down_revision: Union[str, None] = "20231103_add_avatar_url"
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