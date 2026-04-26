# Module 03 — Branch Admin Module (Lab Assistant)

## Overview
Branch Admin is typically the **Lab Assistant** of each department. They manage day-to-day data operations for their specific branch.

## Flow: Batch-First Approach

Unlike typical admin panels, this one is **batch-aware** — the admin first selects which batch (academic year) they're working with, then manages students/teachers/subjects for that batch.

```
Login → Branch Dashboard → Select Batch → Manage [Students/Teachers/Subjects]
```

## Dashboard

### Welcome Section
Shows "Welcome, {Name}" with branch name displayed prominently:
```
Welcome back,
Ramesh Kumar 👋
Computer Science & Engineering (CSE)
```

### Batch Selection Grid
Displays all active batches (e.g. 2022-26, 2023-27, 2024-28, 2025-29) as cards.
User taps a batch to activate it — highlighted card shows active state.

### Action Tiles
After batch selection, 3 tiles appear:
1. **Students** — Manage student records
2. **Teachers** — Add/manage teachers
3. **Subjects** — Create & assign subjects

## Student Management

### List Screen
- Filtered by selected batch
- Shows: Avatar, Name, Reg No, Sem/Section/Type
- Pull-to-refresh support
- Empty state with helpful icon

### Add Student Form
| Field | Required | Notes |
|-------|----------|-------|
| Registration Number | ✓ | Unique across system |
| Full Name | ✓ | |
| Date of Birth | ✓ | Timezone-safe |
| Batch | ✓ | Pre-filled from context |
| Current Semester | ✓ | Numeric |
| Section | | Default: A |
| Student Type | | regular / lateral_entry / back_year |
| Phone | | Optional |

### API Endpoints
- `GET /api/admin/students?batch_id=X&semester=Y`
- `POST /api/admin/students`

## Teacher Management

### Features
- List shows active/inactive status
- Default password: `teacher@123` (teacher must change on first login)
- Email must be unique

### API Endpoints
- `GET /api/admin/teachers` — Only teachers in admin's branch
- `POST /api/admin/teachers` — Create teacher account

## Subject Management

### Features
- Batch-filtered list
- Each subject has: Code, Name, Semester, Assigned Teacher
- Creating a subject **auto-enrolls** all students of that batch+semester

### Add Subject Form
| Field | Required |
|-------|----------|
| Code | ✓ (e.g. CS501) |
| Name | ✓ (e.g. Artificial Intelligence) |
| Batch | ✓ (from context) |
| Semester | ✓ |
| Teacher | ✓ (pick from list) |

### API Endpoints
- `GET /api/admin/subjects?batch_id=X`
- `POST /api/admin/subjects`

## Access Control
- Admin can only see/modify data within their own branch
- Backend enforces this via `branch_id` filter in every query
- Cannot access super admin endpoints

## Typical Workflow (New Semester)

1. Login
2. Select current academic batch (e.g. 2023-27)
3. Add new subjects for current semester
4. Assign teachers to subjects
5. New students (if any) added
6. Students auto-enrolled in subjects
7. Teachers can start marking attendance

## Tips for Lab Assistants
- Add all teachers first, then create subjects (can assign at creation time)
- Double-check DOB while adding students (used for student login)
- Keep Reg Numbers consistent with college ERP format
- For back-year students, create them in the batch they're currently repeating with
