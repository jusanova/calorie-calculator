from app.database import normalize_database_url
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


def test_allowed_origins_default(monkeypatch):
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)
    assert allowed_origins() == ["http://localhost:5173"]


def test_allowed_origins_from_env(monkeypatch):
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://user.github.io/, http://localhost:5173")
    assert allowed_origins() == ["https://user.github.io", "http://localhost:5173"]
