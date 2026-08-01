import uuid

from sqlalchemy.orm import Session

from modules.settings.repository import SettingsRepository
from modules.settings.model import AppSettings


class SettingsService:
    def __init__(self, db: Session):
        self.repository = SettingsRepository(db)

    def get_settings(self, user_id: uuid.UUID) -> AppSettings:
        return self.repository.get_or_create(user_id)

    def update_settings(self, user_id: uuid.UUID, alert_email: str | None) -> AppSettings:
        row = self.repository.get_or_create(user_id)
        return self.repository.update(row, alert_email)
