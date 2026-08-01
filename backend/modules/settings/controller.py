from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.session import get_db
from modules.settings.schema import SettingsResponse, SettingsUpdate
from modules.settings.service import SettingsService
from modules.user.dependencies import get_current_user
from modules.user.model import User

router = APIRouter(prefix="/settings", tags=["settings"])


def get_settings_service(db: Session = Depends(get_db)) -> SettingsService:
    return SettingsService(db)


@router.get("", response_model=SettingsResponse)
def get_settings(
    service: SettingsService = Depends(get_settings_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_settings(current_user.id)


@router.put("", response_model=SettingsResponse)
def update_settings(
    payload: SettingsUpdate,
    service: SettingsService = Depends(get_settings_service),
    current_user: User = Depends(get_current_user),
):
    return service.update_settings(current_user.id, payload.alert_email)
