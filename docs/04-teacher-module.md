# Module 04 — Teacher Module

## Overview
Teachers mark daily attendance for their assigned subjects and export Excel reports at semester end.

## Dashboard

### Welcome Card
Shows teacher name with branch code, e.g. "Welcome back, Prof. Shubham Kumar 👨‍🏫"

### Subject Cards
Each assigned subject is displayed as a card with:
- **Code Badge** (e.g. "CS501")
- **Semester Badge** (e.g. "SEM 5")
- Subject Name
- Batch info (e.g. "Batch 2023-27")
- Two action buttons:
  - 📝 **Mark Attendance** — Opens marking screen
  - 📊 **Export** — Download Excel

### API Endpoint
- `GET /api/teacher/subjects` — Returns only subjects assigned to this teacher

## Mark Attendance Flow

### Screen Layout
1. **Subject bar** with title + date picker (timezone-safe)
2. **Stats row** — Present / Absent / Total (color-coded)
3. **"Mark All Present" button** — Quick-toggle for high attendance days
4. **Student list** — tap to toggle P ↔ A
5. **Submit button** — Save attendance

### Smart Features
- **Auto-load existing data** — If attendance was already marked for this date, loads existing marks
- **Default all present** — Most students are usually present, so this is the default
- **Re-marking supported** — Teacher can re-mark a date, old records replaced

### Visual Feedback
- Present row: Green background, green badge with "P"
- Absent row: Red background, red badge with "A"
- Tap anywhere on row to toggle

### API Endpoints
- `GET /api/teacher/subjects/{subject_id}/students` — List enrolled students
- `GET /api/teacher/attendance/{subject_id}?class_date=YYYY-MM-DD` — Existing records
- `POST /api/teacher/attendance/mark` — Submit batch marks

### Mark Request Body
```json
{
  "subject_id": 1,
  "class_date": "2026-04-18",
  "marks": [
    {"student_id": 1, "status": "P"},
    {"student_id": 2, "status": "A"},
    ...
  ]
}
```

## Excel Export

### Endpoint
`GET /api/teacher/export/{subject_id}`

### Report Format
- Title row with subject name + code
- Columns: S.No, Reg No, Name, Section, [date columns], Present, Total, %
- P cells: Green fill, A cells: Red fill
- Auto-calculated totals per student

### Use Case
Teacher downloads Excel at semester end to submit to HOD / college ERP.

## Date Picker Fix

**Important:** Both login and attendance marking use `toLocalDateString()` to avoid the Android DOB bug where UTC conversion gave off-by-one dates.

## Best Practices
- Mark attendance **during class** or immediately after
- Don't leave default "all present" without reviewing
- Use "Mark All Present" only when genuinely everyone is present
- Export Excel periodically (weekly/monthly) as backup
- Remind students to verify their attendance via student app

## Common Tasks

### First class of semester
1. Login
2. See assigned subjects in dashboard
3. Open first subject → Mark Attendance
4. Today's date auto-selected
5. Review list, mark absentees
6. Submit

### End of semester
1. Open subject
2. Tap "Export" → Excel downloads
3. Submit to HOD

### Editing past attendance
1. Open subject → Mark Attendance
2. Change date to past date using date picker
3. Edit marks → Submit
4. Old records replaced with new ones
