"""
Pydantic schemas for application settings — the request/response
contracts, separate from the ORM model for the same reason as the Task
module: the model describes what's stored, this describes what's
exposed over HTTP.
"""
from pydantic import BaseModel, EmailStr, ConfigDict


class SettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    alert_email: str | None = None


class SettingsUpdate(BaseModel):
    # EmailStr validates the format at the API boundary — an invalid
    # address is rejected with a 422 before it ever reaches the database
    # or a failed SMTP send later.
    alert_email: EmailStr | None = None
