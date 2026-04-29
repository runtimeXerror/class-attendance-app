import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Production:
#   - Set DATABASE_URL on Render (e.g. Supabase Postgres pooler URL).
#   - Format from Supabase: postgresql://postgres.<ref>:<pwd>@<host>:6543/postgres
#     (use the "Transaction" pooler URL — port 6543 — for serverless / Render).
# Local dev: falls back to ./attendance.db (sqlite).
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./attendance.db")

# Supabase / Heroku sometimes hand out "postgres://" — SQLAlchemy 2.x
# requires "postgresql://".
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
engine_kwargs = {"pool_pre_ping": True}

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # Postgres on Supabase pooler — keep pool small + recycle so connections
    # don't go stale during Render's idle/wake cycles.
    engine_kwargs.update({
        "pool_size": 5,
        "max_overflow": 5,
        "pool_recycle": 300,
    })

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
