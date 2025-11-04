"""Add name to locations

Revision ID: 20251105_add_name_to_locations
Revises: 20251104_add_merchant_fields
Create Date: 2025-11-05 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20251105_add_name_to_locations"
down_revision: Union[str, None] = "20251104_add_merchant_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("locations", sa.Column("name", sa.String(), nullable=False))


def downgrade() -> None:
    op.drop_column("locations", "name")