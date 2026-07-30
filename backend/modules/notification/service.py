"""
Business logic for deadline reminders.

Runs on a schedule (see scheduler.py), not in response to a request —
checks which tasks have crossed the "1 day left" or "1 hour left"
threshold since the last check, and sends an email for each one exactly
once (tracked via Task.notified_day_before_at / notified_hour_before_at).
"""
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from core.config import settings
from modules.task.repository import TaskRepository
from modules.settings.repository import SettingsRepository
from modules.notification.email_service import send_email

logger = logging.getLogger(__name__)

ONE_DAY = timedelta(days=1)
ONE_HOUR = timedelta(hours=1)


class ReminderService:
    def __init__(self, db: Session):
        self.repository = TaskRepository(db)
        self.settings_repository = SettingsRepository(db)

    def check_and_send_reminders(self) -> None:
        alert_email = self._resolve_alert_email()
        if not alert_email:
            logger.info("No alert email configured yet (settings table empty and no ALERT_EMAIL_TO) — skipping check")
            return

        now = datetime.now(timezone.utc)
        # Window tolerance = how often the scheduler runs. A task
        # "crosses" the 1-day threshold sometime between this check and
        # the previous one (~15 minutes ago), so the window is what
        # catches it without needing to run continuously.
        window = timedelta(minutes=settings.reminder_check_interval_minutes)

        candidates = self.repository.get_with_deadline_in_range(now, now + ONE_DAY + window)

        for task in candidates:
            remaining = task.deadline - now

            if task.notified_day_before_at is None and self._crossed(remaining, ONE_DAY, window):
                self._remind(task, "1 day", "notified_day_before_at", now, alert_email)

            if task.notified_hour_before_at is None and self._crossed(remaining, ONE_HOUR, window):
                self._remind(task, "1 hour", "notified_hour_before_at", now, alert_email)

    def _resolve_alert_email(self) -> str | None:
        # The settings-table value (set via the UI) takes precedence;
        # ALERT_EMAIL_TO is only a fallback for before anyone's visited
        # the settings dialog yet.
        row = self.settings_repository.get_or_create()
        return row.alert_email or settings.alert_email_to or None

    @staticmethod
    def _crossed(remaining: timedelta, threshold: timedelta, window: timedelta) -> bool:
        """True if `remaining` just dropped to/below `threshold` within the last check window."""
        return threshold - window <= remaining <= threshold

    def _remind(self, task, label: str, field: str, now: datetime, alert_email: str) -> None:
        send_email(
            subject=f'DailyOS reminder: "{task.title}" is due in {label}',
            body=(
                f'Your task "{task.title}" is due at '
                f"{task.deadline.strftime('%a, %d %b %Y %H:%M %Z')}.\n\n"
                f"Status: {task.status.value}\nPriority: {task.priority.value}\n\n"
                f"{task.description or ''}"
            ),
            to_email=alert_email,
        )
        self.repository.mark_notified(task, field, now)
        logger.info("Sent %s reminder for task %s (%s)", label, task.id, task.title)
