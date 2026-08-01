import logging
import smtplib
from email.mime.text import MIMEText

from core.config import settings

logger = logging.getLogger(__name__)


def send_email(subject: str, body: str, to_email: str | None = None) -> None:
    recipient = to_email or settings.alert_email_to
    if not settings.email_configured or not recipient:
        logger.warning(
            "Email not sent (SMTP not configured, or no recipient set): %s",
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
