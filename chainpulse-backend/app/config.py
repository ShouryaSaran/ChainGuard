import os
from urllib.parse import urlparse, urlunparse

from dotenv import load_dotenv
from pydantic import BaseModel


load_dotenv()


def _to_bool(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _running_in_docker() -> bool:
    # Standard marker file present in Linux containers.
    return os.path.exists("/.dockerenv")


def _normalize_service_host(url: str, service_hosts: set[str]) -> str:
    """Map docker-compose service hostnames to localhost for local runs."""
    if _running_in_docker() or not url:
        return url

    parsed = urlparse(url)
    if parsed.hostname not in service_hosts:
        return url

    host = parsed.hostname or ""
    port = f":{parsed.port}" if parsed.port else ""
    auth = ""
    if parsed.username:
        auth = parsed.username
        if parsed.password:
            auth += f":{parsed.password}"
        auth += "@"

    netloc = f"{auth}localhost{port}"
    return urlunparse((parsed.scheme, netloc, parsed.path, parsed.params, parsed.query, parsed.fragment))


class Settings(BaseModel):
    DATABASE_URL: str = _normalize_service_host(
        os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/chainpulse"),
        {"db", "postgres"},
    )
    REDIS_URL: str = _normalize_service_host(
        os.getenv("REDIS_URL", "redis://redis:6379/0"),
        {"redis"},
    )
    NEWS_API_KEY: str = os.getenv("NEWS_API_KEY", "")
    OPENROUTE_API_KEY: str = os.getenv("OPENROUTE_API_KEY", "")
    DEBUG: bool = _to_bool(os.getenv("DEBUG", "false"))


settings = Settings()
