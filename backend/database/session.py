"""
Database engine and session factory.

get_db() is a FastAPI dependency: each request gets its own SQLAlchemy
Session, which is closed automatically when the request finishes — even
if an exception is raised. Controllers depend on get_db(); nothing above
the repository layer should import `engine` or `SessionLocal` directly.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
