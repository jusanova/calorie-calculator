from app.database import engine, get_schema_engine, normalize_database_url
from app.main import allowed_origins


def test_normalize_database_url_adds_psycopg_driver():
    assert normalize_database_url("postgres://u:p@h/db") == "postgresql+psycopg://u:p@h/db"
    assert (
        normalize_database_url("postgresql://u:p@h/db?sslmode=require")
        == "postgresql+psycopg://u:p@h/db?sslmode=require"
    )


def test_normalize_database_url_keeps_other_urls():
    assert normalize_database_url("postgresql+psycopg://u:p@h/db") == "postgresql+psycopg://u:p@h/db"
    assert normalize_database_url("sqlite://") == "sqlite://"


def test_schema_engine_defaults_to_app_engine(monkeypatch):
    monkeypatch.delenv("DATABASE_URL_UNPOOLED", raising=False)
    assert get_schema_engine() is engine


def test_schema_engine_uses_direct_url_when_set(monkeypatch):
    monkeypatch.setenv("DATABASE_URL_UNPOOLED", "postgresql://u:p@direct-host/db")
    schema_engine = get_schema_engine()
    assert schema_engine is not engine
    assert schema_engine.url.host == "direct-host"
    assert schema_engine.url.drivername == "postgresql+psycopg"


def test_allowed_origins_default(monkeypatch):
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)
    assert allowed_origins() == ["http://localhost:5173"]


def test_allowed_origins_from_env(monkeypatch):
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://user.github.io/, http://localhost:5173")
    assert allowed_origins() == ["https://user.github.io", "http://localhost:5173"]
