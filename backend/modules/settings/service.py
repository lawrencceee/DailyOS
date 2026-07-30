"""
Business logic for application settings — thin today (just the one
alert_email preference), but this is the seam where future settings
(reminder lead times, additional notification channels, etc.) would get
validated or coordinated without touching the controller or repository.
"""
from sqlalchemy.orm import Session

from modules.settings.repository import SettingsRepository
from modules.settings.model import AppSettings


class SettingsService:
    def __init__(self, db: Session):
        self.repository = SettingsRepository(db)

    def get_settings(self) -> AppSettings:
        return self.repository.get_or_create()

    def update_settings(self, alert_email: str | None) -> AppSettings:
        row = self.repository.get_or_create()
        return self.repository.update(row, alert_email)
