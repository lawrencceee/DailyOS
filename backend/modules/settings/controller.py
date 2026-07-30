"""
HTTP layer for application settings. No auth guard here — matches the
rest of the app, which doesn't have user accounts yet either.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.session import get_db
from modules.settings.schema import SettingsResponse, SettingsUpdate
from modules.settings.service import SettingsService

router = APIRouter(prefix="/settings", tags=["settings"])


def get_settings_service(db: Session = Depends(get_db)) -> SettingsService:
    return SettingsService(db)


@router.get("", response_model=SettingsResponse)
def get_settings(service: SettingsService = Depends(get_settings_service)):
    return service.get_settings()


@router.put("", response_model=SettingsResponse)
def update_settings(payload: SettingsUpdate, service: SettingsService = Depends(get_settings_service)):
    return service.update_settings(payload.alert_email)
