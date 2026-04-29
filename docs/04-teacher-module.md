# Module 04 — Teacher Module

## Overview
Teachers mark daily attendance for their assigned subjects, view a
clickable analytics dashboard, and export Excel/PDF reports at semester
end.

## Dashboard (subject list)

### Welcome Card
Shows teacher name + branch code + profile image (tap to upload).

### Subject Cards
Each assigned subject shows:
- **Code Badge** (e.g. "CS501")
- Semester / Batch / credits / session
- Action row: **Mark · Dashboard · Excel · PDF**

### API
- `GET /api/teacher/subjects` — only subjects assigned to this teacher

## Subject Dashboard (`/teacher/dashboard-subject`)

Tapping **Dashboard** on any subject card opens the analytics dashboard.

### Summary stats (row 1) — clickable
| Card | What happens on tap |
|---|---|
| **Classes Taken** | Modal listing every class date — tap a date to view/edit that day's marks |
| **Students** | Modal listing every enrolled student with their attendance % |
| **Avg** | Plain number (not clickable) |

### Status breakdown (row 2) — clickable
Each pill opens a modal filtered to that group:

| Pill | Threshold |
|---|---|
| ✓ Safe | percentage **≥ 75 %** |
| ⚠ Warning | **60 % ≤ pct < 75 %** |
| ✗ Critical | **pct < 60 %** |

The same thresholds drive the per-row colour badge in the full student
list below.

### Recent Classes strip
Last 10 dates as horizontal chips. Tap one to back-date edit that day.

### API
- `GET /api/teacher/dashboard/{subject_id}` — returns:
  ```json
  {
    "subject": { ... },
    "total_classes": 12,
    "recent_dates": ["2026-04-29", ...],   // last 10
    "all_dates":    ["2026-04-29", ...],   // every class date (used by the modal)
    "students": [{ "student_id", "name", "percentage", ... }]
  }
  ```

## Mark Attendance Flow

### Screen header
- Subject name (large)
- Course code pill **left**
- Today's date pill **right** — tap to open the **calendar picker**

### Calendar picker
Custom in-app calendar (`components/AttendanceCalendar.js`).

- Month nav (←/→), weekday header, day grid.
- **Days with attendance already marked** show a faded `primaryLight`
  circle background **and a small dot** below the date number.
- **Today** has a thin primary-colour border (when not selected).
- **Selected day** is filled with the primary colour.
- Future days are disabled.
- Footer legend shows "Attendance marked (N)".

The marked-dates list is fetched from
`GET /api/teacher/attendance/{subject_id}/dates` on screen mount AND
again after every successful submit, so dots reflect reality
immediately.

### Mark screen body
1. Stats row — Present / Absent / Total (live count).
2. **All Present / All Absent** large buttons (with confirm toast).
3. Student list — tap any row to toggle P ↔ A.
4. **Submit Attendance**.

### Submit behaviour
Endpoint:
- `POST /api/teacher/attendance/mark` — for today's date
- `POST /api/teacher/attendance/edit` — for back-date edits

Both endpoints **first delete** any existing rows for the date, then
re-insert. There is one important exception:

> **All-Absent rule** — if every student is marked Absent, the server
> deletes the day's rows and **inserts nothing**. The day disappears
> from the calendar dots and from Excel/PDF exports. This is the
> "undo a wrongly-marked day" gesture: select the date, hit *All
> Absent*, submit.

### Request body
```json
{
  "subject_id": 1,
  "class_date": "2026-04-29",
  "marks": [
    {"student_id": 1, "status": "P"},
    {"student_id": 2, "status": "A"}
  ]
}
```

### Smart features
- **Auto-load existing marks** for the picked date.
- **Default all present** for fresh dates (most days everyone shows up).
- **Re-marking** safe — old records replaced atomically.
- **Past-date marking** allowed up to today; future dates disabled.

## Exports — Excel + PDF

| Endpoint | Output |
|---|---|
| `GET /api/teacher/export/{subject_id}` | Branded `.xlsx` |
| `GET /api/teacher/export-pdf/{subject_id}` | Branded `.pdf` (A3 landscape) |

Both files include:
- Title bar (subject name + report)
- Sub bar (semester, branch, batch, duration, total classes)
- Grouped rows: Back-Year batches → Lateral Entry → Regular
- Date columns with P/A colour fills
- Per-student totals + COUNTIF formulas (Excel) / pre-computed (PDF)
- **Footer with IST timestamp** — `Generated: DD MMM YYYY, HH:MM AM/PM`
  reflects the moment the file was generated (server is UTC, footer
  helper `now_ist()` adds +5:30).

## Date / Timezone notes

- Dates passed between app and API use `YYYY-MM-DD` (`toLocalDateString`)
  to avoid the Android UTC off-by-one bug.
- Human-facing timestamps in Excel/PDF use IST via the `now_ist()`
  helper in `backend/app/main.py`.

## Best Practices
- Mark **during class** so dots appear in real time on the calendar.
- Use *All Present* / *All Absent* for the obvious cases — saves taps.
- Use the **calendar dots** to spot missing class days at a glance.
- Use **dashboard pills** to drill into Critical students before
  exam-eligibility cut-offs.
- Periodic Excel exports as backup.

## Common Tasks

### First class of semester
1. Login → subject → **Mark**.
2. Today auto-selected, default all-present.
3. Review, mark absentees, submit.

### Mid-semester analytics
1. Subject → **Dashboard**.
2. Tap **Critical** pill → list of below-60 % students.
3. Tap **Classes Taken** to verify class count.

### Editing past attendance
1. Subject → **Mark** → tap date pill → calendar.
2. Pick the date (dot will be visible if it has marks).
3. Existing marks pre-load; edit and submit.

### Removing a wrongly-marked day
1. Pick the date.
2. Tap **All Absent** → Submit.
3. Day's records deleted; calendar dot disappears; day no longer in Excel/PDF.

### End of semester
1. Subject card → **Excel** / **PDF**.
2. Save to device or share.
3. Footer shows IST time of download.
