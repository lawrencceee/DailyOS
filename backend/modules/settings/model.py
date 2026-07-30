"""
SQLAlchemy model for application-wide settings.

This is intentionally a single-row table — there's no user auth yet, so
"settings" means one global set of preferences, not per-user ones. If
auth is added later (modules/user/), this would naturally split into a
per-user settings table with a user_id foreign key; nothing above the
repository layer would need to change to accommodate that.
"""
import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base


class AppSettings(Base):
    __tablename__ = "app_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_email: Mapped[str | None] = mapped_column(String(320), nullable=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
