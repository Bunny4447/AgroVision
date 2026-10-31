import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Support full connection string from cloud providers (Railway, Render, TiDB, Aiven, etc.)
raw_db_url = os.getenv("DATABASE_URL") or os.getenv("MYSQL_URL")

if raw_db_url:
    # Ensure PyMySQL driver dialect is used for MySQL
    if raw_db_url.startswith("mysql://"):
        DATABASE_URL = raw_db_url.replace("mysql://", "mysql+pymysql://", 1)
    elif raw_db_url.startswith("mysql+pymysql://"):
        DATABASE_URL = raw_db_url
    else:
        DATABASE_URL = raw_db_url

    # Ensure utf8mb4 charset
    if "charset=" not in DATABASE_URL:
        sep = "&" if "?" in DATABASE_URL else "?"
        DATABASE_URL = f"{DATABASE_URL}{sep}charset=utf8mb4"
else:
    # Fallback to discrete environment variables (local / custom)
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "12345678")
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
    MYSQL_DB = os.getenv("MYSQL_DB", "agrovision_db")
    DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4"

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
