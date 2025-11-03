"""Add avatar_url to users

Revision ID: 20231103_add_avatar_url
Revises: 20231102_add_user_profile_fields
Create Date: 2025-11-03 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20231103_add_avatar_url"
down_revision: Union[str, None] = "20231102_add_user_profile_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("avatar_url", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "avatar_url")