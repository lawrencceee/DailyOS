"""
Centralized application configuration.

Uses pydantic-settings so config is loaded once, validated, and typed —
instead of scattering os.getenv() calls across the codebase. Any module
that needs a setting imports `settings` from here.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DailyOS"
    app_env: str = "development"
    log_level: str = "INFO"

    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:5173"
    # Matches http(s)://localhost, 127.0.0.1, or any private-network IPv4
    # (10.x, 172.16-31.x, 192.168.x) on the Vite dev port. This is what
    # lets a phone on the same Wi-Fi hit the API without hardcoding a
    # specific LAN IP that changes across networks. For a real deployment,
    # set this to "" and rely on cors_origins (an exact allowlist) instead.
    cors_origin_regex: str = (
        r"^https?://(localhost|127\.0\.0\.1|"
        r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
        r"172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|"
        r"192\.168\.\d{1,3}\.\d{1,3})"
        r":5173$"
    )

    database_url: str = "postgresql+psycopg2://dailyos:dailyos@db:5432/dailyos"

    # Notification module (modules/notification/) — sends a reminder
    # email when a task's deadline is ~1 day and ~1 hour away. Empty
    # strings by default so the scheduler can detect "not configured yet"
    # and skip sending rather than crashing on missing credentials; see
    # backend/.env.example for how to fill these in with a real provider.
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    alert_email_from: str = ""
    alert_email_to: str = ""
    reminder_check_interval_minutes: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def email_configured(self) -> bool:
        # Recipient is no longer required here — it's resolved at send
        # time from the settings table (with alert_email_to as a
        # fallback default if the settings row has nothing set yet).
        return bool(self.smtp_host and self.smtp_username and self.smtp_password)


@lru_cache
def get_settings() -> Settings:
    # lru_cache turns this into a singleton: settings are parsed once per process.
    return Settings()


settings = get_settings()
