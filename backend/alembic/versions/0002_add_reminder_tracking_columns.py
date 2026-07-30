"""add reminder notification tracking columns

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-29

"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tasks", sa.Column("notified_day_before_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("tasks", sa.Column("notified_hour_before_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("tasks", "notified_hour_before_at")
    op.drop_column("tasks", "notified_day_before_at")
