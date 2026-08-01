from fastapi import APIRouter

from modules.task.controller import router as task_router
from modules.settings.controller import router as settings_router
from modules.user.controller import router as auth_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(task_router)
api_router.include_router(settings_router)
