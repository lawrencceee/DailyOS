"""
Repository layer for Task.

The ONLY place in the codebase that writes SQLAlchemy queries against
the Task table. It knows nothing about HTTP, status codes, or business
rules — it just does CRUD against a Session and returns ORM objects
(or None). The service layer is the only caller.
"""
import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from modules.task.model import Task, TaskStatus
from modules.task.schema import TaskCreate, TaskUpdate


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Task]:
        stmt = select(Task).order_by(Task.created_at.desc()).offset(skip).limit(limit)
        return list(self.db.scalars(stmt).all())

    def get_by_id(self, task_id: uuid.UUID) -> Task | None:
        return self.db.get(Task, task_id)

    def get_with_deadline_in_range(self, start: datetime, end: datetime) -> list[Task]:
        """
        Tasks with a deadline in [start, end], excluding done tasks —
        used by the notification module to find candidates for a
        reminder without loading every task in the table.
        """
        stmt = select(Task).where(
            Task.deadline.isnot(None),
            Task.deadline >= start,
            Task.deadline <= end,
            Task.status != TaskStatus.DONE,
        )
        return list(self.db.scalars(stmt).all())

    def create(self, data: TaskCreate) -> Task:
        task = Task(**data.model_dump())
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update(self, task: Task, data: TaskUpdate) -> Task:
        updates = data.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(task, field, value)
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task) -> None:
        self.db.delete(task)
        self.db.commit()

    def mark_notified(self, task: Task, field: str, when: datetime) -> None:
        """Sets notified_day_before_at or notified_hour_before_at and commits."""
        setattr(task, field, when)
        self.db.commit()
