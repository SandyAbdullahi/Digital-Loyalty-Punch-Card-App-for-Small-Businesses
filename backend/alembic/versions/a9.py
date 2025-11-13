"""add analytics fields to programs, ledger_entries, and analytics_snapshots table

Revision ID: a9
Revises: a8
Create Date: 2025-11-10 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a9'
down_revision: Union[str, None] = 'a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create analytics_snapshots table
    op.create_table('analytics_snapshots',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('merchant_id', sa.UUID(), nullable=False),
    sa.Column('period_start', sa.DateTime(), nullable=False),
    sa.Column('period_end', sa.DateTime(), nullable=False),
    sa.Column('total_customers_enrolled', sa.Integer(), nullable=False),
    sa.Column('visits_by_enrolled_customers', sa.Integer(), nullable=False),
    sa.Column('rewards_redeemed', sa.Integer(), nullable=False),
    sa.Column('baseline_visits_estimate', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('estimated_extra_visits', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('estimated_extra_revenue_kes', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('net_incremental_revenue_kes', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['merchant_id'], ['merchants.id'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('analytics_snapshots')