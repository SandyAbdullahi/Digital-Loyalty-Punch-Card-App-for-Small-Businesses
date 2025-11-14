"""add theme customization fields for merchant settings

Revision ID: 032
Revises: 031
Create Date: 2025-11-15 15:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "032"
down_revision: Union[str, None] = "031"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "merchant_settings",
        sa.Column(
            "theme_primary_color",
            sa.String(length=16),
            nullable=False,
            server_default=sa.text("'#00C896'"),
        ),
    )
    op.add_column(
        "merchant_settings",
        sa.Column(
            "theme_secondary_color",
            sa.String(length=16),
            nullable=False,
            server_default=sa.text("'#2196F3'"),
        ),
    )
    op.add_column(
        "merchant_settings",
        sa.Column(
            "theme_accent_color",
            sa.String(length=16),
            nullable=False,
            server_default=sa.text("'#FF5252'"),
        ),
    )
    op.add_column(
        "merchant_settings",
        sa.Column(
            "theme_background_color",
            sa.String(length=16),
            nullable=False,
            server_default=sa.text("'#F5F5F5'"),
        ),
    )
    op.add_column(
        "merchant_settings",
        sa.Column(
            "theme_mode",
            sa.String(length=16),
            nullable=False,
            server_default=sa.text("'light'"),
        ),
    )


def downgrade() -> None:
    op.drop_column("merchant_settings", "theme_mode")
    op.drop_column("merchant_settings", "theme_background_color")
    op.drop_column("merchant_settings", "theme_accent_color")
    op.drop_column("merchant_settings", "theme_secondary_color")
    op.drop_column("merchant_settings", "theme_primary_color")
