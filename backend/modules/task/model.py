"""
SQLAlchemy ORM model for the Task module.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base


class TaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Every query in repository.py takes user_id and filters on this —
    # that's what actually makes tasks private to their owner. The
    # column itself only sets the boundary; nothing enforces it unless
    # every repository method remembers to filter by it, which is why
    # get_by_id (below) deliberately requires user_id too, not just the
    # task's own id — otherwise a user could load another user's task
    # just by guessing/incrementing a UUID (extremely unlikely to guess,
    # but "unlikely to guess" isn't the same guarantee as "impossible to
    # access without owning it").
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus, name="task_status", values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        nullable=False,
        default=TaskStatus.TODO,
    )
    priority: Mapped[TaskPriority] = mapped_column(
        Enum(TaskPriority, name="task_priority", values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        nullable=False,
        default=TaskPriority.MEDIUM,
    )
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    notified_day_before_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notified_hour_before_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
