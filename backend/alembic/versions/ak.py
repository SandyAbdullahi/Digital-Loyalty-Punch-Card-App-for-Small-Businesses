"""add customer_stats table

Revision ID: ak
Revises: aj
Create Date: 2025-11-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ak'
down_revision: Union[str, None] = 'aj'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('customer_stats',
        sa.Column('customer_id', sa.UUID(), nullable=False),
        sa.Column('total_revenue', sa.Numeric(precision=10, scale=2), nullable=False, default=0.0),
        sa.Column('total_visits', sa.Integer(), nullable=False, default=0),
        sa.Column('rewards_redeemed', sa.Integer(), nullable=False, default=0),
        sa.Column('last_visit_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('customer_id')
    )


def downgrade() -> None:
    op.drop_table('customer_stats')