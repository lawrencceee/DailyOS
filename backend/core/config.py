from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DailyOS"
    app_env: str = "development"
    log_level: str = "INFO"

    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:5173"
    cors_origin_regex: str = (
        r"^https?://(localhost|127\.0\.0\.1|"
        r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
        r"172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|"
        r"192\.168\.\d{1,3}\.\d{1,3})"
        r":5173$"
    )

    database_url: str = "postgresql+psycopg2://dailyos:dailyos@db:5432/dailyos"

    # Auth (modules/user/) — JWT signing. jwt_secret_key MUST be
    # overridden with a real random secret in any deployed environment;
    # the default here is only safe for local dev, never production.
    jwt_secret_key: str = "dev-only-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Notification module
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    alert_email_from: str = ""
    alert_email_to: str = ""
    reminder_check_interval_minutes: int = 15

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def email_configured(self) -> bool:
        return bool(self.smtp_host and self.smtp_username and self.smtp_password)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
