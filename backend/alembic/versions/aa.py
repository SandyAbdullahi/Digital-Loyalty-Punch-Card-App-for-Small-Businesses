"""reward logic tables and enrollment columns

Revision ID: aa
Revises: a9
Create Date: 2025-11-11 14:30:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'aa'
down_revision: Union[str, None] = 'a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("actor_type", sa.String(), nullable=False),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(), nullable=False),
        sa.Column("entity", sa.String(), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("details", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "rewards",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("enrollment_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("program_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("merchant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="inactive"),
        sa.Column("reached_at", sa.DateTime(), nullable=True),
        sa.Column("voucher_code", sa.String(length=32), nullable=True),
        sa.Column("redeem_expires_at", sa.DateTime(), nullable=True),
        sa.Column("redeemed_at", sa.DateTime(), nullable=True),
        sa.Column("redeemed_by_staff_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("audit", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("cycle", sa.Integer(), nullable=False, server_default="1"),
        sa.ForeignKeyConstraint(["customer_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["enrollment_id"], ["customer_program_memberships.id"]),
        sa.ForeignKeyConstraint(["merchant_id"], ["merchants.id"]),
        sa.ForeignKeyConstraint(["program_id"], ["loyalty_programs.id"]),
        sa.UniqueConstraint("voucher_code"),
        sa.UniqueConstraint("enrollment_id", "cycle", name="uq_rewards_enrollment_cycle"),
    )

    op.create_table(
        "stamps",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("enrollment_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("program_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("merchant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tx_id", sa.String(length=64), nullable=False),
        sa.Column("issued_by_staff_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("issued_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("cycle", sa.Integer(), nullable=False, server_default="1"),
        sa.ForeignKeyConstraint(["customer_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["enrollment_id"], ["customer_program_memberships.id"]),
        sa.ForeignKeyConstraint(["merchant_id"], ["merchants.id"]),
        sa.ForeignKeyConstraint(["program_id"], ["loyalty_programs.id"]),
        sa.UniqueConstraint("program_id", "tx_id", name="uq_stamps_program_tx"),
    )

    with op.batch_alter_table("customer_program_memberships") as batch_op:
        batch_op.add_column(sa.Column("merchant_id", postgresql.UUID(as_uuid=True), nullable=True))
        batch_op.add_column(sa.Column("joined_via", sa.String(), nullable=True, server_default="qr"))
        batch_op.add_column(sa.Column("last_visit_at", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("current_cycle", sa.Integer(), nullable=False, server_default="1"))

    op.execute(
        """
        UPDATE customer_program_memberships AS m
        SET merchant_id = p.merchant_id
        FROM loyalty_programs AS p
        WHERE m.program_id = p.id AND m.merchant_id IS NULL
        """
    )

    with op.batch_alter_table("customer_program_memberships") as batch_op:
        batch_op.alter_column("merchant_id", nullable=False)
        batch_op.alter_column("joined_via", server_default=None)

    op.create_unique_constraint(
        "uq_membership_customer_program",
        "customer_program_memberships",
        ["customer_user_id", "program_id"],
    )
    op.create_index(
        "ix_customer_program_memberships_program_joined",
        "customer_program_memberships",
        ["program_id", "joined_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_customer_program_memberships_program_joined", table_name="customer_program_memberships")
    op.drop_constraint("uq_membership_customer_program", "customer_program_memberships", type_="unique")
    with op.batch_alter_table("customer_program_memberships") as batch_op:
        batch_op.drop_column("current_cycle")
        batch_op.drop_column("last_visit_at")
        batch_op.drop_column("joined_via")
        batch_op.drop_column("merchant_id")

    op.drop_table("stamps")
    op.drop_table("rewards")
    op.drop_table("audit_logs")
