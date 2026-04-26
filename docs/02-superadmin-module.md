# Module 02 — Super Admin Module

## Overview
Super Admin is the highest authority in the system (held by developer/HOD). Manages branch admins across all departments.

## Responsibilities
- Create Branch Admins (Lab Assistants) for any department
- Manage batches (academic year ranges)
- View system-wide statistics
- Monitor overall usage

## Dashboard Features
- Welcome hero with "👑 Super Administrator" badge
- 6 stat cards (Branches, Admins, Teachers, Students, Subjects, Batches)
- Branch list with codes
- Add Branch Admin action

## API Endpoints

### GET `/api/superadmin/stats`
Returns system-wide counts.

**Response:**
```json
{
  "total_branches": 6,
  "total_admins": 2,
  "total_teachers": 5,
  "total_students": 120,
  "total_subjects": 25,
  "total_batches": 4
}
```

### GET `/api/superadmin/admins`
Returns list of all branch admins across branches.

### POST `/api/superadmin/admins`
Create a new branch admin.

**Body:**
```json
{
  "email": "ece.admin@rrsdce.edu",
  "password": "secure123",
  "name": "Suresh Kumar (ECE Lab Assistant)",
  "branch_id": 2,
  "phone": "9876543210"
}
```

### POST `/api/superadmin/batches`
Create a batch (e.g. 2025-29).

**Body:**
```json
{
  "start_year": 2025,
  "end_year": 2029
}
```

## Use Cases

### Initial Setup (First Time)
1. Super Admin logs in (default: `vishal@rrsdce.edu` / `vishal123`)
2. Sees 6 pre-seeded branches (CSE, ECE, EE, ME, CE, IT)
3. Sees 4 pre-seeded batches (2022-26, 2023-27, 2024-28, 2025-29)
4. Creates Branch Admin for each branch (one-by-one)
5. Shares credentials with respective lab assistants
6. Each lab assistant takes over their branch

### Adding New Admin Later
1. Super Admin → Dashboard → "Add Branch Admin"
2. Fill form: Name, Email, Password, Branch, Phone
3. Save → Share credentials securely
4. New admin can now login with their credentials

## Security Notes
- Super Admin account should have a **very strong password**
- Should be held by only 1-2 people (developer + HOD)
- Password should be changed periodically
- Never share credentials in plain text (use secure channel)

## Recommended Practices
- Keep Super Admin list minimal
- Document who has super admin access
- Audit trail of admin creation
- Multi-factor authentication (future)
