import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from modules.settings.model import AppSettings


class SettingsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create(self, user_id: uuid.UUID) -> AppSettings:
        row = self.db.scalars(select(AppSettings).where(AppSettings.user_id == user_id)).first()
        if row is None:
            row = AppSettings(user_id=user_id)
            self.db.add(row)
            self.db.commit()
            self.db.refresh(row)
        return row

    def update(self, row: AppSettings, alert_email: str | None) -> AppSettings:
        row.alert_email = alert_email
        self.db.commit()
        self.db.refresh(row)
        return row

    def get_for_user(self, user_id: uuid.UUID) -> AppSettings | None:
        """Read-only lookup used by the notification scheduler — doesn't create a row if none exists."""
        return self.db.scalars(select(AppSettings).where(AppSettings.user_id == user_id)).first()
