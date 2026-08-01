import logging
import uuid

from sqlalchemy.orm import Session

from modules.task.model import Task
from modules.task.repository import TaskRepository
from modules.task.schema import TaskCreate, TaskUpdate

logger = logging.getLogger(__name__)


class TaskNotFoundError(Exception):
    def __init__(self, task_id: uuid.UUID):
        self.task_id = task_id
        super().__init__(f"Task {task_id} not found")


class TaskService:
    def __init__(self, db: Session):
        self.repository = TaskRepository(db)

    def list_tasks(self, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Task]:
        return self.repository.get_all(user_id, skip=skip, limit=limit)

    def get_task(self, user_id: uuid.UUID, task_id: uuid.UUID) -> Task:
        task = self.repository.get_by_id(user_id, task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task

    def create_task(self, user_id: uuid.UUID, data: TaskCreate) -> Task:
        task = self.repository.create(user_id, data)
        logger.info("Created task %s (%s) for user %s", task.id, task.title, user_id)
        return task

    def update_task(self, user_id: uuid.UUID, task_id: uuid.UUID, data: TaskUpdate) -> Task:
        task = self.get_task(user_id, task_id)
        task = self.repository.update(task, data)
        logger.info("Updated task %s", task.id)
        return task

    def delete_task(self, user_id: uuid.UUID, task_id: uuid.UUID) -> None:
        task = self.get_task(user_id, task_id)
        self.repository.delete(task)
        logger.info("Deleted task %s", task_id)
