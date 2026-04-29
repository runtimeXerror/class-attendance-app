# Module 07 — Attendance Management

## Overview

Core module — real-time attendance marking with an in-app calendar
(marked-attendance dots), back-date editing, and an "All-Absent removes
the day" gesture for fixing mistakes.

## Features

- Mark attendance for any date (past or current)
- Default state: all students marked Present
- **All Present / All Absent** large buttons (animated toast confirms)
- Tap individual student to toggle P ↔ A
- Re-editable — teacher can modify previous records
- **All-Absent submit deletes the day** — wrongly-marked days disappear
  from the calendar dots and from Excel/PDF exports
- Auto-saves to database, instantly visible to students
- **Calendar with marked-attendance dots** — dates that already have
  records show a faded circle + dot

## Flow

```
Teacher Login
    ↓
My Subjects Dashboard
    ↓
Tap "Mark" on a subject
    ↓
Mark screen: subject name + course code + date pill
    ↓
Tap date pill → custom in-app calendar opens
    ↓
(Days with existing marks show faded circle + dot)
    ↓
Pick a date (today by default; back-date allowed)
    ↓
Student List (auto-loaded; existing marks pre-filled)
    ↓
Toggle / All-Present / All-Absent
    ↓
Submit
    ├─ Has at least one P → records replaced for that date
    └─ Every student is A → records DELETED, day removed
    ↓
Calendar dots refresh; students see the update on refresh
```

## API Endpoints

### Mark / Edit
```
POST /api/teacher/attendance/mark
POST /api/teacher/attendance/edit       # used when re-opening a past date

Body:
{
  "subject_id": 1,
  "class_date": "2026-04-29",
  "marks": [
    { "student_id": 1, "status": "P" },
    { "student_id": 2, "status": "A" }
  ]
}
```

Response when at least one P:
```json
{ "success": true, "count": 42 }
```

Response when ALL marks are 'A' (the day is removed):
```json
{ "success": true, "count": 0, "deleted_day": true }
```

### Get records for one date
```
GET /api/teacher/attendance/{subject_id}?class_date=2026-04-29
```

### Get every date with marks (for calendar dots)
```
GET /api/teacher/attendance/{subject_id}/dates
→ { "dates": ["2026-04-25", "2026-04-26", ...] }
```

The mobile app calls this on screen mount and after every successful
submit so the calendar reflects reality immediately.

### Subject dashboard (analytics)
```
GET /api/teacher/dashboard/{subject_id}
→ {
    "subject": {...},
    "total_classes": 12,
    "recent_dates": [...],   # last 10 dates
    "all_dates":    [...],   # every class date (used by clickable card)
    "students": [{ "student_id", "name", "percentage", "present", "total", ... }]
}
```

## Database Schema

```sql
attendance_records (
  id                    INT PK,
  student_id            INT FK → students,
  subject_id            INT FK → subjects,
  class_date            DATE NOT NULL,
  status                VARCHAR NOT NULL  -- 'P' or 'A'
  marked_by_teacher_id  INT FK → teachers,
  marked_at             DATETIME
)

UNIQUE (student_id, subject_id, class_date)
```

When `Class Attendance` is deployed against Supabase Postgres
(`DATABASE_URL` set on Render), this schema is created automatically
on first boot via `Base.metadata.create_all()` in `startup.py`.

## UI Components

- **Date pill** — opens the in-app calendar (`AttendanceCalendar.js`).
- **Calendar:** month nav, weekday header, day grid, faded circle +
  dot on marked dates, today border, selected fill, future days
  disabled, legend at bottom.
- **Stats Bar:** 3 cards (Present green / Absent red / Total blue).
- **Bulk buttons:** All Present / All Absent — both with animated toast.
- **Student Row:** green = Present, red = Absent. Tap to toggle.
- **Submit Button:** animated, shows loading state. Modal "tick" success.

## Logic

- **Pre-fill:** if attendance exists for the picked date, those marks load.
- **Re-marking:** old records for `(subject, date)` are deleted, new marks
  inserted in one transaction.
- **All-Absent rule:** when nothing is marked Present, the records are
  deleted and nothing is inserted — the date disappears from the
  calendar and from exports.
- **Permissions:** only the assigned teacher of a subject can read/write
  its attendance — every endpoint enforces `Subject.teacher_id == teacher.id`.

## Validation

- Teacher must own the subject (backend checks `teacher_id`).
- Date cannot be in the future (frontend: `maxDate={new Date()}` in
  the calendar).
- Student must be enrolled in the subject (read endpoint already filters).

## Threshold colours (used in dashboard + student app)

| Pct | Status |
|-----|--------|
| ≥ 75 | Safe (green) |
| 60 – 75 | Warning (yellow) |
| < 60 | Critical (red) |

## Real-time Visibility

When the teacher submits:
- Calendar refetches `/dates` → dots update instantly.
- Students see the update on next dashboard pull-to-refresh.
- Per-subject percentage auto-recalculates.
- Status pill colour follows the table above.
