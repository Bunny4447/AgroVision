import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Support full connection string from cloud providers (TiDB Cloud, Aiven, Render, Neon, Supabase, Railway)
raw_db_url = os.getenv("DATABASE_URL") or os.getenv("MYSQL_URL")

engine_kwargs = {
    "pool_pre_ping": True,
    "echo": False
}

if raw_db_url:
    # 1. MySQL dialect
    if raw_db_url.startswith("mysql://"):
        DATABASE_URL = raw_db_url.replace("mysql://", "mysql+pymysql://", 1)
    elif raw_db_url.startswith("mysql+pymysql://"):
        DATABASE_URL = raw_db_url
    # 2. PostgreSQL dialect (Render / Neon / Supabase)
    elif raw_db_url.startswith("postgres://"):
        DATABASE_URL = raw_db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif raw_db_url.startswith("postgresql://"):
        DATABASE_URL = raw_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    # 3. SQLite
    elif raw_db_url.startswith("sqlite://"):
        DATABASE_URL = raw_db_url
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    else:
        DATABASE_URL = raw_db_url

    if "mysql" in DATABASE_URL and "charset=" not in DATABASE_URL:
        sep = "&" if "?" in DATABASE_URL else "?"
        DATABASE_URL = f"{DATABASE_URL}{sep}charset=utf8mb4"
else:
    # Local MySQL configuration
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "12345678")
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
    MYSQL_DB = os.getenv("MYSQL_DB", "agrovision_db")
    DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4"

try:
    engine = create_engine(DATABASE_URL, **engine_kwargs)
    # Quick probe to test connectivity
    with engine.connect() as conn:
        pass
except Exception as e:
    # Automatic self-healing fallback to SQLite if cloud/local MySQL is unavailable
    data_dir = Path(__file__).resolve().parent.parent / "data"
    data_dir.mkdir(exist_ok=True)
    sqlite_url = f"sqlite:///{data_dir / 'agrovision.db'}"
    print(f"[Database Probe Notice] Could not connect to primary DB. Auto-fallback to SQLite: {sqlite_url}")
    DATABASE_URL = sqlite_url
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
