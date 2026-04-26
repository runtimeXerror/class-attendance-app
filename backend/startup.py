"""
Production startup script for Render deployment.

What it does:
1. Creates the SQLite DB file + parent directory if they don't exist
2. Creates all tables (idempotent)
3. Seeds initial data ONLY if the database is empty (first deploy)
   On subsequent deploys, your data is PRESERVED.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app import models


def ensure_disk_dir():
    """Render's persistent disk is mounted at /var/data — make sure the dir exists."""
    db_url = os.getenv("DATABASE_URL", "sqlite:///./attendance.db")
    if db_url.startswith("sqlite:///"):
        path = db_url.replace("sqlite:///", "", 1)
        if path.startswith("/"):
            parent = os.path.dirname(path)
        else:
            parent = os.path.dirname(os.path.abspath(path))
        if parent and not os.path.exists(parent):
            os.makedirs(parent, exist_ok=True)
            print(f"[startup] Created data directory: {parent}")


def is_db_empty():
    """Returns True if no super admins are registered yet."""
    db = SessionLocal()
    try:
        return db.query(models.SuperAdmin).count() == 0
    except Exception:
        return True
    finally:
        db.close()


def main():
    print("=" * 60)
    print("[startup] Class Attendance backend starting...")
    print("=" * 60)

    ensure_disk_dir()

    print("[startup] Creating database tables (if not exist)...")
    Base.metadata.create_all(bind=engine)
    print("[startup] Tables ready.")

    if is_db_empty():
        print("[startup] Database is empty — running initial seed...")
        try:
            import seed
            print("[startup] Initial seed complete.")
        except Exception as e:
            print(f"[startup] WARNING: Seed failed: {e}")
            print("[startup] Continuing anyway.")
    else:
        print("[startup] Database has data — skipping seed (preserving existing data).")

    print("=" * 60)
    print("[startup] Ready. Starting server...")
    print("=" * 60)


if __name__ == "__main__":
    main()
