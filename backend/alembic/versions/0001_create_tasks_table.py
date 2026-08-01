"""create tasks table

Revision ID: 0001
Revises:
Create Date: 2026-07-16

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

task_status = postgresql.ENUM("todo", "in_progress", "done", name="task_status")
task_priority = postgresql.ENUM("low", "medium", "high", name="task_priority")


def upgrade() -> None:
    bind = op.get_bind()
    task_status.create(bind, checkfirst=True)
    task_priority.create(bind, checkfirst=True)

    op.create_table(
        "tasks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", postgresql.ENUM("todo", "in_progress", "done", name="task_status", create_type=False), nullable=False),
        sa.Column("priority", postgresql.ENUM("low", "medium", "high", name="task_priority", create_type=False), nullable=False),
        sa.Column("deadline", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("tasks")
    task_priority.drop(op.get_bind(), checkfirst=True)
    task_status.drop(op.get_bind(), checkfirst=True)
