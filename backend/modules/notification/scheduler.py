import logging

from apscheduler.schedulers.background import BackgroundScheduler

from core.config import settings
from database.session import SessionLocal
from modules.notification.service import ReminderService

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def _run_reminder_check() -> None:
    db = SessionLocal()
    try:
        ReminderService(db).check_and_send_reminders()
    except Exception:
        logger.exception("Reminder check failed")
    finally:
        db.close()


def start_scheduler() -> None:
    scheduler.add_job(
        _run_reminder_check,
        "interval",
        minutes=settings.reminder_check_interval_minutes,
        id="task_deadline_reminders",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Reminder scheduler started (every %s minutes)", settings.reminder_check_interval_minutes)


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
