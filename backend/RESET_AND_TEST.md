# 🔧 If "Invalid credentials" error

## Step 1: Reset DB and re-seed
```bash
cd backend
# Windows cmd:
del attendance.db
# Git Bash / Mac / Linux:
rm -f attendance.db

python seed.py
```

## Step 2: Test the credentials match exactly

Copy-paste **EXACTLY** (no extra spaces):

| Role | Email / Reg No | Password / DOB |
|------|---------------|----------------|
| Super Admin | `vishal@rrsdce.edu` | `vishal123` |
| CSE Admin | `cse.admin@rrsdce.edu` | `admin123` |
| CE Admin | `ce.admin@rrsdce.edu` | `admin123` |
| Teacher | `rajiv.ranjan@rrsdce.edu` | `teacher123` |
| Student CSE | `23105125023` | `2005-08-15` |
| Student CE | `23101125004` | `2005-03-22` |

## Step 3: Common typos to check
- Email is all lowercase (`vishal@rrsdce.edu` NOT `Vishal@RRSDCE.edu`)
- No space before/after email
- Password is `vishal123` (lowercase v)
- DOB format: `YYYY-MM-DD` (use date picker — don't type manually)

## Step 4: Still failing? Direct test via curl
```bash
# While backend is running on port 8000
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"role\": \"superadmin\", \"email\": \"vishal@rrsdce.edu\", \"password\": \"vishal123\"}"
```

Should return `{"access_token": "...", "role": "superadmin", ...}`.
