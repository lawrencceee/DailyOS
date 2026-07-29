"""
Declarative base shared by every SQLAlchemy model in every module.

Every model.py across modules/* imports Base from here and inherits from it.
This is also the object Alembic's env.py points at for autogenerate, so a
model defined in any module is automatically picked up in migrations.
"""
from sqlalchemy.orm import declarative_base

Base = declarative_base()
