# Module 06 — Database Schema

## Overview
SQLAlchemy ORM with SQLite (dev) / Supabase PostgreSQL (prod).

## Entity Relationship

```
SuperAdmin
    ↓ (creates)
Branch (6) ──→ Admin (Branch-wise Lab Assistants)
    ↓
    ├──→ Teacher
    ├──→ Student ──→ Batch
    └──→ Subject ──→ Teacher
              ↓
           Enrollment (Student ↔ Subject)
              ↓
           AttendanceRecord (Student, Subject, Date)
```

## Tables

### super_admins
```sql
id INTEGER PRIMARY KEY
email VARCHAR UNIQUE NOT NULL
password_hash VARCHAR NOT NULL
name VARCHAR NOT NULL
created_at TIMESTAMP
```

### branches
```sql
id INTEGER PRIMARY KEY
name VARCHAR NOT NULL        -- "Computer Science & Engineering"
code VARCHAR UNIQUE NOT NULL -- "CSE"
```

### admins (Branch Admins / Lab Assistants)
```sql
id INTEGER PRIMARY KEY
email VARCHAR UNIQUE NOT NULL
password_hash VARCHAR NOT NULL
name VARCHAR NOT NULL
branch_id INTEGER FK branches
phone VARCHAR
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP
```

### teachers
```sql
id INTEGER PRIMARY KEY
email VARCHAR UNIQUE NOT NULL
password_hash VARCHAR NOT NULL
name VARCHAR NOT NULL
phone VARCHAR
branch_id INTEGER FK branches
created_by_admin_id INTEGER FK admins
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP
```

### batches
```sql
id INTEGER PRIMARY KEY
name VARCHAR UNIQUE NOT NULL  -- "2023-27"
start_year INTEGER NOT NULL   -- 2023
end_year INTEGER NOT NULL     -- 2027
is_active BOOLEAN DEFAULT true
```

### students
```sql
id INTEGER PRIMARY KEY
reg_no VARCHAR UNIQUE NOT NULL   -- "23105125023"
name VARCHAR NOT NULL
date_of_birth DATE NOT NULL      -- used for login
branch_id INTEGER FK branches
batch_id INTEGER FK batches
current_semester INTEGER
section VARCHAR DEFAULT "A"
student_type VARCHAR             -- "regular" | "lateral_entry" | "back_year"
phone VARCHAR
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP
```

### subjects
```sql
id INTEGER PRIMARY KEY
code VARCHAR NOT NULL             -- "CS501"
name VARCHAR NOT NULL             -- "Artificial Intelligence"
branch_id INTEGER FK branches
batch_id INTEGER FK batches
semester INTEGER NOT NULL
teacher_id INTEGER FK teachers
```

### enrollments
```sql
id INTEGER PRIMARY KEY
student_id INTEGER FK students
subject_id INTEGER FK subjects
UNIQUE (student_id, subject_id)
```

### attendance_records
```sql
id INTEGER PRIMARY KEY
student_id INTEGER FK students
subject_id INTEGER FK subjects
class_date DATE NOT NULL
status VARCHAR NOT NULL            -- "P" | "A"
marked_by_teacher_id INTEGER FK teachers
marked_at TIMESTAMP
UNIQUE (student_id, subject_id, class_date)
```

## Relationships

- **1 Branch → N Admins, Teachers, Students, Subjects**
- **1 Batch → N Students, N Subjects**
- **1 Teacher → N Subjects**
- **N Students ↔ N Subjects** (via Enrollment)
- **1 Student + 1 Subject + 1 Date → 1 AttendanceRecord**

## Constraints & Rules

### Unique constraints
- `reg_no` across students
- `email` across each role table
- `(student_id, subject_id)` in enrollments (student can't enroll twice in same subject)
- `(student_id, subject_id, class_date)` in attendance (only one record per student per subject per date)

### Data integrity
- Cascading deletes NOT enabled — use `is_active` flag for soft deletes
- Foreign keys enforced
- DateTime timestamps auto-set on creation

## Common Queries

### Get all students in CSE batch 2023-27
```sql
SELECT * FROM students
WHERE branch_id = 1 AND batch_id = 2 AND is_active = true
ORDER BY reg_no;
```

### Teacher's subject list
```sql
SELECT s.*, b.name AS batch_name
FROM subjects s
JOIN batches b ON b.id = s.batch_id
WHERE s.teacher_id = ?;
```

### Student attendance summary
```sql
SELECT
  s.name AS subject_name,
  COUNT(DISTINCT a.class_date) AS total_classes,
  SUM(CASE WHEN a.status = 'P' AND a.student_id = ? THEN 1 ELSE 0 END) AS present
FROM subjects s
LEFT JOIN attendance_records a ON a.subject_id = s.id
WHERE s.id IN (SELECT subject_id FROM enrollments WHERE student_id = ?)
GROUP BY s.id;
```

## Seed Data

On first run, `seed.py` creates:
- 1 Super Admin (Vishal)
- 6 Branches
- 4 Batches
- 1 CSE Admin
- 1 Teacher
- 5 Sample Students
- 3 Subjects
- All enrollments

## Migration Strategy

### SQLite → Supabase
1. Export SQLite data
2. Create Supabase project
3. Update `SQLALCHEMY_DATABASE_URL` in `database.py` to Supabase PostgreSQL URL
4. Run migrations (Alembic recommended for production)

### Future schema changes
Use Alembic for migrations once in production:
```bash
alembic init alembic
alembic revision --autogenerate -m "Add dispute_requests table"
alembic upgrade head
```

## Indexes (for performance)

Primary keys are auto-indexed. Additional recommended indexes:
- `students.reg_no` (login lookup)
- `students.branch_id`
- `subjects.teacher_id`
- `attendance_records.(subject_id, class_date)`
- `attendance_records.student_id`
