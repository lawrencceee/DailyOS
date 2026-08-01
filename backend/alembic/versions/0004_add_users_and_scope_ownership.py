"""add users table, scope tasks/settings to owner

Revision ID: 0004
Revises: 0003
Create Date: 2026-08-01

This migration adds authentication to an app that already has real
data in it (existing tasks, one global settings row). Adding a
required (NOT NULL) user_id column to a table that already has rows
can't be done in one step — there's no value to put in that column for
rows that already exist. The strategy here:

  1. Add user_id as NULLABLE first.
  2. Create one "legacy" account to own whatever's already there, using
     credentials read from environment variables (LEGACY_OWNER_EMAIL /
     LEGACY_OWNER_PASSWORD) so there's actually a way to log into that
     account afterward — rather than leaving old data permanently
     orphaned. Set these two env vars before running this migration if
     you have existing tasks you want to keep.
  3. If those env vars aren't set, any pre-existing rows are deleted
     instead (a deliberate "start fresh" choice, not a silent one).
  4. Only then is the column made NOT NULL, once every row actually has
     a value.
"""
import os
import uuid

import bcrypt
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.add_column("tasks", sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("app_settings", sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True))

    bind = op.get_bind()
    legacy_email = os.environ.get("LEGACY_OWNER_EMAIL")
    legacy_password = os.environ.get("LEGACY_OWNER_PASSWORD")

    if legacy_email and legacy_password:
        legacy_user_id = uuid.uuid4()
        hashed = bcrypt.hashpw(legacy_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        bind.execute(
            sa.text("INSERT INTO users (id, email, hashed_password) VALUES (:id, :email, :hashed)"),
            {"id": legacy_user_id, "email": legacy_email, "hashed": hashed},
        )
        bind.execute(
            sa.text("UPDATE tasks SET user_id = :uid WHERE user_id IS NULL"),
            {"uid": legacy_user_id},
        )
        bind.execute(
            sa.text("UPDATE app_settings SET user_id = :uid WHERE user_id IS NULL"),
            {"uid": legacy_user_id},
        )
    else:
        bind.execute(sa.text("DELETE FROM tasks WHERE user_id IS NULL"))
        bind.execute(sa.text("DELETE FROM app_settings WHERE user_id IS NULL"))

    op.alter_column("tasks", "user_id", nullable=False)
    op.alter_column("app_settings", "user_id", nullable=False)

    op.create_foreign_key("fk_tasks_user_id", "tasks", "users", ["user_id"], ["id"])
    op.create_foreign_key("fk_app_settings_user_id", "app_settings", "users", ["user_id"], ["id"])
    op.create_index("ix_tasks_user_id", "tasks", ["user_id"])
    op.create_unique_constraint("uq_app_settings_user_id", "app_settings", ["user_id"])


def downgrade() -> None:
    op.drop_constraint("uq_app_settings_user_id", "app_settings", type_="unique")
    op.drop_index("ix_tasks_user_id", table_name="tasks")
    op.drop_constraint("fk_app_settings_user_id", "app_settings", type_="foreignkey")
    op.drop_constraint("fk_tasks_user_id", "tasks", type_="foreignkey")
    op.drop_column("app_settings", "user_id")
    op.drop_column("tasks", "user_id")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
