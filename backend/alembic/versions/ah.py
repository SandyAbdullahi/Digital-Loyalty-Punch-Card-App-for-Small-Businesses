"""add customer_id to ledger_entries

Revision ID: ah
Revises: ag
Create Date: 2025-11-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'ah'
down_revision: Union[str, None] = 'ag'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('ledger_entries', sa.Column('customer_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(None, 'ledger_entries', 'users', ['customer_id'], ['id'])
    # Populate customer_id from memberships
    op.execute(
        """
        UPDATE ledger_entries
        SET customer_id = customer_program_memberships.customer_user_id
        FROM customer_program_memberships
        WHERE ledger_entries.membership_id = customer_program_memberships.id
        """
    )
    op.alter_column('ledger_entries', 'customer_id', nullable=False)


def downgrade() -> None:
    op.drop_constraint(None, 'ledger_entries', type_='foreignkey')
    op.drop_column('ledger_entries', 'customer_id')