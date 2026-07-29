"""
Application-wide logging configuration.

Called once at startup from main.py. Every module then does:
    import logging
    logger = logging.getLogger(__name__)
so log lines are attributable to the module that emitted them.
"""
import logging
import sys

from core.config import settings


def configure_logging() -> None:
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.handlers = [handler]

    # Quiet down noisy third-party loggers unless we're debugging.
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.log_level.upper() == "DEBUG" else logging.WARNING
    )
