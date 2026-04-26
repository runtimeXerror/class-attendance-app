# Module 07 — Attendance Management

## Overview

Core module — real-time attendance marking with date picker, P/A toggle, and batch+subject filtering.

## Features

- Mark attendance for any date (past or current)
- Default state: all students marked Present
- One-tap "Mark All Present" button
- Tap individual student to toggle P ↔ A
- Re-editable — teacher can modify previous records
- Auto-saves to database, instantly visible to students

## Flow

```
Teacher Login
    ↓
My Subjects Dashboard
    ↓
Tap "Mark Attendance" on a subject
    ↓
Date Picker (default today)
    ↓
Student List (auto-loaded from enrollments)
    ↓
All students default to Present (green)
    ↓
Tap students who are absent → toggles to Red (A)
    ↓
Statistics bar: Present / Absent / Total
    ↓
Submit → saved to DB
    ↓
Students see update in real-time
```

## API Endpoints

### Mark Attendance
```
POST /api/teacher/attendance/mark
Body: {
  subject_id: 1,
  class_date: "2026-04-18",
  marks: [
    { student_id: 1, status: "P" },
    { student_id: 2, status: "A" },
    ...
  ]
}
```

### Get Attendance by Date
```
GET /api/teacher/attendance/{subject_id}?class_date=2026-04-18
```

### Get All Attendance for Subject
```
GET /api/teacher/attendance/{subject_id}
```

## Database Schema

```sql
attendance_records (
  id              INT PK,
  student_id      INT FK → students,
  subject_id      INT FK → subjects,
  class_date      DATE NOT NULL,
  status          VARCHAR NOT NULL  -- 'P' or 'A'
  marked_by_teacher_id INT FK → teachers,
  marked_at       DATETIME
)

UNIQUE (student_id, subject_id, class_date)
```

## UI Components

- **Date Picker:** Opens native calendar. Shows today by default.
- **Stats Bar:** 3 cards (Present green / Absent red / Total blue)
- **Student Row:** 
  - Green background + P badge = Present
  - Red background + A badge = Absent
  - Tap anywhere on row to toggle
- **Submit Button:** Animated, shows loading state

## Logic

- Pre-fill: If attendance already exists for selected date, those marks load (editing mode)
- Re-marking: Old records for same (subject, date) are deleted, new marks saved
- Permissions: Only the assigned teacher can mark/edit attendance for a subject

## Validation

- Teacher must own the subject (backend checks `teacher_id`)
- Date cannot be in future (frontend: `maximumDate={new Date()}`)
- Student must be enrolled in subject

## Real-time Visibility

As soon as teacher submits:
- Student pulls latest attendance on dashboard refresh
- Percentage auto-recalculates
- Color coding updates (>=75% green, 50-75% yellow, <50% red)
