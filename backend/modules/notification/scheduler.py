"""
Wires the reminder check to run on a schedule inside the same process
as the FastAPI app.

Uses APScheduler's BackgroundScheduler: no new infrastructure (no
message queue, no separate worker service) — appropriate for a
single-instance personal project. Worth knowing: if this app ever ran
as multiple replicas, each instance would run its own scheduler
independently and you'd get duplicate emails. Splitting this into a
separate scheduled job (e.g. a Render Cron Job) is the fix if/when
that becomes a real concern — this project's own spec already
earmarks that class of infrastructure ("message queues... added in
later iterations").
"""
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
        # A failed check shouldn't crash the scheduler thread or the
        # app — log it and try again on the next scheduled run.
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
