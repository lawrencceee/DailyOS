"""
Pydantic schemas for the Task module — the request/response contracts
of the API. These are deliberately separate from the SQLAlchemy model:
the ORM model describes what's stored, the schema describes what's
exposed over HTTP. That separation is what lets you change one without
breaking the other (e.g. hiding an internal column from API consumers).
"""
import uuid
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict

from modules.task.model import TaskStatus, TaskPriority


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    deadline: datetime | None = None


class TaskCreate(TaskBase):
    """Payload for POST /tasks. All fields required except the optional ones above."""
    pass


class TaskUpdate(BaseModel):
    """
    Payload for PUT /tasks/{id}.

    All fields optional so a client can send a partial-looking payload;
    the service layer decides how missing fields are handled (see
    service.py for the "no-op on None" convention used here).
    """
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    deadline: datetime | None = None


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
