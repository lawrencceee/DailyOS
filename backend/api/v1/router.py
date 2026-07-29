"""
Aggregates all module routers into a single v1 API router.

When a new module (Calendar, Notes, Finance...) is added, its controller
router gets one line here — main.py never has to change.
"""
from fastapi import APIRouter

from modules.task.controller import router as task_router

api_router = APIRouter()
api_router.include_router(task_router)
