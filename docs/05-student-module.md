# Module 05 — Student Module

## Overview
Students have **read-only** access to view their own attendance across all enrolled subjects.

## Unique Login Method
Students login using **Registration Number + Date of Birth** — no password needed. This keeps things simple:
- No password to forget
- DOB is always available to student
- College has DOB on record anyway
- Credentials given to student at admission

## Dashboard

### Welcome Hero
Shows student info as badges:
- Name
- Registration Number
- Chips: Branch code, Semester, Section, Batch

### Overall Attendance Card
Big prominent display of overall % across all subjects:
- **≥ 75%** — Green "✓ Safe"
- **50-75%** — Yellow "⚠ Warning"
- **< 50%** — Red "⚠ Low"

Shows "Across N subjects" as subtitle.

### Subject-wise Breakdown
Each subject card shows:
- Subject code badge
- Subject name
- Stats: Present / Absent / Total classes
- Percentage badge (color-coded)

## Features

### Pull-to-refresh
Students can pull down to refresh attendance data — useful when teacher just marked a class.

### Read-only
Students **cannot**:
- Mark their own attendance
- Edit records
- See other students' data

Students **can**:
- View own attendance
- See percentage per subject
- Track trends over time

## API Endpoints

### GET `/api/student/attendance`
Returns complete attendance summary.

**Response:**
```json
{
  "student": {
    "reg_no": "23105125023",
    "name": "Vishal Kumar",
    "semester": 5,
    "section": "A",
    "batch": "2023-27",
    "branch": "Computer Science & Engineering",
    "branch_code": "CSE"
  },
  "subjects": [
    {
      "subject_id": 1,
      "subject_name": "Artificial Intelligence",
      "subject_code": "CS501",
      "semester": 5,
      "total_classes": 28,
      "present": 23,
      "absent": 5,
      "percentage": 82.14
    }
  ]
}
```

### GET `/api/student/attendance/{subject_id}/details`
(Optional, for future) Detailed date-wise records for a subject.

## Use Cases

### Daily check
Student opens app after each class to verify attendance was marked correctly.

### Before exams
Student checks if attendance meets 75% threshold for exam eligibility.

### Semester planning
See which subjects have low attendance, prioritize attending those.

## Future Enhancements

- **Dispute mechanism** — If student thinks attendance is wrong, raise ticket for teacher to review
- **Notifications** — Push alert when new class marked ("AI class marked — Present ✅")
- **Predictions** — "Attend next 3 classes to maintain 75%"
- **Class rank** — See your rank in branch based on attendance
- **Export** — Download own attendance as PDF

## UX Notes

- All data is real-time (refreshed on every dashboard open)
- Color coding helps quick mental parsing
- Chips for metadata are compact and scannable
- No overwhelming graphs — clean and purposeful

## For Students: How to Check

1. Open Class Attendance app
2. Select "Student" role
3. Enter Registration Number (e.g. 23105125023)
4. Select Date of Birth from picker
5. Tap "Sign In"
6. Dashboard shows everything at a glance

## Troubleshooting Login

**"Invalid Reg No or DOB"** means:
- Reg No typo (double-check)
- DOB in records doesn't match (contact admin)
- Account not created yet (wait for admin to add)

**Solution:** Contact your Branch Admin (Lab Assistant) to verify your record.
