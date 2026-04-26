# Backend — College Attendance System

FastAPI + SQLite backend.

## Setup (one time)

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python seed.py
```

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend available at: http://localhost:8000
API docs (auto): http://localhost:8000/docs

## Test Credentials (after seed)

**Admin:** admin@rrsdce.edu / admin123
**Teacher:** teacher@rrsdce.edu / teacher123
**Student:** 23105125023 / 2005-08-15 (Vishal)

## API Endpoints

- POST /api/login
- POST /api/admin/teachers
- GET /api/admin/teachers
- POST /api/admin/students
- GET /api/admin/students
- POST /api/admin/subjects
- GET /api/admin/subjects
- GET /api/teacher/subjects
- GET /api/teacher/subjects/{id}/students
- POST /api/teacher/attendance/mark
- GET /api/teacher/attendance/{subject_id}
- GET /api/teacher/export/{subject_id}
- GET /api/student/attendance
- GET /api/student/attendance/{subject_id}/details
