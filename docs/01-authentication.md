# Module 01 — Authentication & Role-Based Access Control

## Overview
The authentication system supports 4 distinct roles with different login mechanisms and access levels.

## Roles

| Role | Login Method | Access Scope |
|------|--------------|--------------|
| 👑 Super Admin | Email + Password | Full system (all branches) |
| 👨‍💼 Admin | Email + Password | Own branch only |
| 👨‍🏫 Teacher | Email + Password | Own assigned subjects |
| 🎓 Student | Reg No + DOB | Own attendance only (read-only) |

## Authentication Flow

### Login Request
```
POST /api/login
Content-Type: application/json

{
  "role": "admin",
  "email": "cse.admin@rrsdce.edu",
  "password": "admin123"
}
```

### Student Login (special)
```
POST /api/login
Content-Type: application/json

{
  "role": "student",
  "reg_no": "23105125023",
  "dob": "2005-08-15"
}
```

### Response
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "role": "admin",
  "name": "Ramesh Kumar",
  "user_id": 1,
  "branch_name": "Computer Science & Engineering",
  "branch_code": "CSE"
}
```

## Security Implementation

### Password Hashing
- Algorithm: **bcrypt** (cost factor 12)
- 72-byte password limit handled with truncation
- Never store plain-text passwords

### Token (JWT)
- Algorithm: HS256
- Expiry: 30 days
- Payload: `{id, role, exp}`
- Stored in AsyncStorage on mobile

### Role-Based Middleware
```python
@app.get("/api/admin/students")
def list_students(current=Depends(auth.require_role("admin"))):
    # Only accessible by admin role
    admin = current["user"]
    ...
```

## Frontend Integration

### Save Auth
```js
import { saveAuth } from '../lib/api';
await saveAuth(response.data);
// Saves: token, role, name, user_id, branch_name, branch_code
```

### API Interceptor
```js
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## DOB Bug Fix

**Problem:** Android DateTimePicker was converting local date to UTC, causing off-by-one errors (e.g. selecting 16/10/2005 → sent as 17/10/2005).

**Solution:** Custom `toLocalDateString()` formatter that uses local timezone:
```js
export const toLocalDateString = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
```

## Best Practices
- Change default passwords on first login
- Use strong passwords (min 8 chars)
- Never share tokens
- Logout on shared devices
