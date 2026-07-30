"""
Repository layer for AppSettings.

Since this is a single-row table, get_or_create() is the only read
path — there's no listing or filtering, just "the one settings row,"
created on first access rather than requiring a separate seed step.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from modules.settings.model import AppSettings


class SettingsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create(self) -> AppSettings:
        row = self.db.scalars(select(AppSettings)).first()
        if row is None:
            row = AppSettings()
            self.db.add(row)
            self.db.commit()
            self.db.refresh(row)
        return row

    def update(self, row: AppSettings, alert_email: str | None) -> AppSettings:
        row.alert_email = alert_email
        self.db.commit()
        self.db.refresh(row)
        return row
