"""
Email delivery for the notification module.

This is the only file that knows *how* an email actually gets sent
(SMTP host/port/auth). Everything else in this module works with plain
subject/body strings and calls send_email() — if you later swap SMTP
for a provider API (Resend, SendGrid, Postmark), this is the only file
that changes.
"""
import logging
import smtplib
from email.mime.text import MIMEText

from core.config import settings

logger = logging.getLogger(__name__)


def send_email(subject: str, body: str, to_email: str | None = None) -> None:
    recipient = to_email or settings.alert_email_to
    if not settings.email_configured or not recipient:
        # Fails loudly in logs rather than crashing the scheduler loop —
        # missing email config shouldn't take down the whole app, just
        # mean reminders silently don't send until it's configured.
        logger.warning(
            "Email not sent (SMTP not configured, or no recipient set via app settings / ALERT_EMAIL_TO): %s",
            subject,
        )
        return

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.alert_email_from or settings.smtp_username
    msg["To"] = recipient

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(msg)

    logger.info("Sent email to %s: %s", recipient, subject)
