from pydantic import BaseModel, EmailStr, ConfigDict


class SettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    alert_email: str | None = None


class SettingsUpdate(BaseModel):
    alert_email: EmailStr | None = None
