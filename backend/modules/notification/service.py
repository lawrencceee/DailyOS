"""
Business logic for deadline reminders.

Runs on a schedule (see scheduler.py), across ALL users' tasks in one
pass — unlike the Task API (which is scoped per-user via
get_current_user), this background job legitimately needs to see every
user's tasks, since it has to check all of them regardless of who owns
which. For each task, the recipient is resolved from THAT task's
owner's settings row, not a single shared address — that's the piece
that changed when settings became per-user.
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
        now = datetime.now(timezone.utc)
        window = timedelta(minutes=settings.reminder_check_interval_minutes)

        candidates = self.repository.get_with_deadline_in_range(now, now + ONE_DAY + window)

        for task in candidates:
            remaining = task.deadline - now

            if task.notified_day_before_at is None and self._crossed(remaining, ONE_DAY, window):
                self._maybe_remind(task, "1 day", "notified_day_before_at", now)

            if task.notified_hour_before_at is None and self._crossed(remaining, ONE_HOUR, window):
                self._maybe_remind(task, "1 hour", "notified_hour_before_at", now)

    @staticmethod
    def _crossed(remaining: timedelta, threshold: timedelta, window: timedelta) -> bool:
        return threshold - window <= remaining <= threshold

    def _maybe_remind(self, task, label: str, field: str, now: datetime) -> None:
        # Resolved per task-owner, not globally — this is the one place
        # that changed when settings became per-user. A user who hasn't
        # set an alert email yet simply doesn't get reminders (no
        # fallback to a shared address, since that address would belong
        # to someone else entirely in a multi-user app).
        user_settings = self.settings_repository.get_for_user(task.user_id)
        alert_email = user_settings.alert_email if user_settings else None
        if not alert_email:
            return

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
        logger.info("Sent %s reminder for task %s (user %s)", label, task.id, task.user_id)
