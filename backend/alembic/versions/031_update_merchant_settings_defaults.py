"""set merchant_settings defaults and add indexes

Revision ID: 031
Revises: 030
Create Date: 2025-11-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '031'
down_revision: Union[str, None] = '030'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "UPDATE merchant_settings SET avg_spend_per_visit_kes = 0 WHERE avg_spend_per_visit_kes IS NULL"
    )
    op.execute(
        "UPDATE merchant_settings SET baseline_visits_per_customer_per_period = 0 WHERE baseline_visits_per_customer_per_period IS NULL"
    )
    op.execute(
        "UPDATE merchant_settings SET avg_reward_cost_kes = 0 WHERE avg_reward_cost_kes IS NULL"
    )

    op.alter_column(
        "merchant_settings",
        "avg_spend_per_visit_kes",
        existing_type=sa.Numeric(12, 2),
        nullable=False,
        server_default=sa.text("0"),
    )
    op.alter_column(
        "merchant_settings",
        "baseline_visits_per_customer_per_period",
        existing_type=sa.Numeric(6, 2),
        nullable=False,
        server_default=sa.text("0"),
    )
    op.alter_column(
        "merchant_settings",
        "avg_reward_cost_kes",
        existing_type=sa.Numeric(12, 2),
        nullable=False,
        server_default=sa.text("0"),
    )

    op.create_index(
        "ix_stamps_merchant_issued_at", "stamps", ["merchant_id", "issued_at"], unique=False
    )
    op.create_index(
        "ix_rewards_merchant_redeemed_at",
        "rewards",
        ["merchant_id", "redeemed_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_rewards_merchant_redeemed_at", table_name="rewards")
    op.drop_index("ix_stamps_merchant_issued_at", table_name="stamps")

    op.alter_column(
        "merchant_settings",
        "avg_reward_cost_kes",
        existing_type=sa.Numeric(12, 2),
        nullable=True,
        server_default=None,
    )
    op.alter_column(
        "merchant_settings",
        "baseline_visits_per_customer_per_period",
        existing_type=sa.Numeric(6, 2),
        nullable=True,
        server_default=None,
    )
    op.alter_column(
        "merchant_settings",
        "avg_spend_per_visit_kes",
        existing_type=sa.Numeric(12, 2),
        nullable=True,
        server_default=None,
    )
