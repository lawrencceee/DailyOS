"""
Application entrypoint.

Wires together config, logging, CORS, the versioned API router, and a
health check. Business logic never lives here — this file only builds
and configures the FastAPI app object.
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.logging import configure_logging
from api.v1.router import api_router

configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    description="DailyOS backend API — modular monolith, v1 (Task module only).",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=settings.cors_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "app": settings.app_name, "env": settings.app_env}


@app.on_event("startup")
def on_startup():
    logger.info("%s starting up in '%s' mode", settings.app_name, settings.app_env)
