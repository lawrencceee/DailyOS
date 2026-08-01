import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from modules.task.model import Task, TaskStatus
from modules.task.schema import TaskCreate, TaskUpdate


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Task]:
        stmt = (
            select(Task)
            .where(Task.user_id == user_id)
            .order_by(Task.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get_by_id(self, user_id: uuid.UUID, task_id: uuid.UUID) -> Task | None:
        # Filtering by user_id here (not just task_id) is what actually
        # prevents one user from loading another's task by id — a 404
        # is returned either way, so there's no way to distinguish
        # "doesn't exist" from "exists but isn't yours."
        stmt = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        return self.db.scalars(stmt).first()

    def get_with_deadline_in_range(self, start: datetime, end: datetime) -> list[Task]:
        """
        Used by the notification scheduler, which runs across ALL
        users' tasks (not scoped to one user_id) — it needs the task's
        user_id itself to look up which user's alert email to use.
        """
        stmt = select(Task).where(
            Task.deadline.isnot(None),
            Task.deadline >= start,
            Task.deadline <= end,
            Task.status != TaskStatus.DONE,
        )
        return list(self.db.scalars(stmt).all())

    def create(self, user_id: uuid.UUID, data: TaskCreate) -> Task:
        task = Task(user_id=user_id, **data.model_dump())
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
        setattr(task, field, when)
        self.db.commit()
