# 📚 Module-wise Documentation

Complete technical documentation for Class Attendance App v1.0.

## Modules

| # | Module | File |
|---|--------|------|
| 1 | Authentication & Role-Based Access | [01-authentication.md](./01-authentication.md) |
| 2 | Super Admin Panel | [02-superadmin-module.md](./02-superadmin-module.md) |
| 3 | Branch Admin Panel | [03-admin-module.md](./03-admin-module.md) |
| 4 | Teacher Portal | [04-teacher-module.md](./04-teacher-module.md) |
| 5 | Student Portal | [05-student-module.md](./05-student-module.md) |
| 6 | Database Schema | [06-database-schema.md](./06-database-schema.md) |
| 7 | Attendance Management | [07-attendance-module.md](./07-attendance-module.md) |
| 8 | Excel Export | [08-excel-export.md](./08-excel-export.md) |

## Quick Reference

### Tech Stack
- **Backend:** FastAPI, SQLAlchemy, SQLite, bcrypt, python-jose (JWT), openpyxl
- **Mobile:** React Native, Expo Router, Axios, AsyncStorage, DateTimePicker

### Roles
1. **Super Admin** — Top level (Vishal)
2. **Branch Admin** — Lab Assistant per branch
3. **Teacher** — Marks attendance
4. **Student** — Views attendance only

### Architecture Pattern
- RESTful API with JWT bearer auth
- Role-based permission checks at each endpoint
- Scoped queries (admin sees only their branch, teacher sees only their subjects)
- Auto-enrollment: student added → enrolled in all current-semester subjects of their branch

### Key Security Features
- Passwords hashed with bcrypt (72-byte safe)
- JWT tokens with 30-day expiry
- Student login uses Reg No + DOB (no password exposure)
- All API endpoints behind auth (except login & public batch/branch list)

---

© 2026 RRSDCE Begusarai • Developed by Vishal Kumar
