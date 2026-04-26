# 🎓 Class Attendance Management System — v1.2.0

**Mobile-first role-based attendance tracking for engineering colleges**

Built by **Vishal Kumar** (Full Stack) + **Ayush Kumar** (Frontend + Testing) · RRSDCE Begusarai

---

## ✨ What's New in v1.2.0

### Latest Patch (Finalization)
- 🎬 **Right→Left slide animation** on every screen transition (native, smooth)
- ⬇️ **Excel download actually works** — uses `expo-file-system` + `expo-sharing`, opens native share sheet
- 🏷️ **Student subject cards** — `Semester • 5` / `Credit • 3.0` shown as rounded chip boxes (clean look)
- ✅❌ **Teacher Mark All** — labels now clear "✅ Mark All Present" / "❌ Mark All Absent" + animated toast feedback shows count
- 🔙 **Login back arrow** — single clean `‹` symbol, no box bg (no more overlap with logo)
- 🎨 **Navbar logo** — removed white semi-transparent background (logo shows clearly on dark blue bar)
- 🧭 **Super Admin drill header** — 3-column fixed layout, back button, centered title, `+` slot — no more shifting/overlap

### UI / UX
- 🎨 **Custom app logo** (grad-cap + checklist) on icon, splash, all screens
- ⌨️ **Typewriter animation** on home — types/deletes role taglines, settles on "Simple. Smart. Seamless."
- 🏠 **Home redesign** — 2×2 role picker cards, no login form on home
- 🔐 **Dedicated `/login?role=xxx`** page per role with proper back button
- 🍔 **Hamburger "Home"** item at top of drawer
- 🧭 **30-day persistent login** — no repeat login for a month
- 📱 **Google password autosave** hints via `autoComplete` + `textContentType`

### Super Admin
- 🔍 **Search bar** in every drill-down (branches/admins/teachers/students/subjects/batches)
- 📅 **Batch display** fixed — "Session: 2026-30" label with current semester below

### Branch Admin
- 📝 Teacher form order: **Name → Email → Phone** (default credentials info removed)
- 🎯 Teacher creation auto-generates random password + **auto-emails it** (if SMTP configured)

### Teacher
- 👤 **Profile page** at `/teacher/profile` — tap avatar to zoom, "+" to upload from gallery, built-in crop/rotate, initials fallback (strips Prof./Dr./Mrs.)
- 📋 **Mark attendance** heading redesigned — Course code pill + Today's date pill
- ⏪ **Back-date edit** — tap any recent class date → opens Mark with pre-filled existing marks → submit replaces
- 🎨 Green "All Present" + Red "All Absent" buttons already had animation

### Student
- 📊 **Visual bar chart** in Analysis tab — Present/Absent with target 75% indicator line
- 👨‍🏫 **Teacher name** shown on subject cards + detail heading
- ⚠️ **"N more classes needed for 75%"** warning on cards below 75%
- 🕒 **Real-time timestamps** — every P/A record shows when teacher marked it ("🕒 24 Apr, 10:30 AM")
- 💳 **Credits** shown per subject

### Backend
- 📧 **SMTP email integration** (optional) — auto-sends credentials on admin/teacher creation
- 🔒 `SECRET_KEY` loaded from env var
- 🐳 **Dockerfile**, **railway.json**, **render.yaml** for one-click deploy
- 📦 **EAS build config** for APK generation

---

## 🚀 Quick Setup (Local Development)

### Backend
```bash
cd backend
python -m venv venv
# Activate:
#   Windows cmd:     venv\Scripts\activate
#   Git Bash / Mac:  source venv/bin/activate
pip install -r requirements.txt
python seed.py
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Mobile App
```bash
cd mobile-app
npm install --legacy-peer-deps
npx expo start --lan --clear
```

Find your local IP with `ipconfig` / `ifconfig` → app auto-detects OR edit `mobile-app/lib/api.js` `API_URL`.

---

## 🔐 Test Credentials

| Role | Login | Password |
|------|-------|----------|
| Super Admin | `vishal@rrsdce.edu` | `vishal123` |
| CSE Admin | `cse.admin@rrsdce.edu` | `admin123` |
| CE Admin | `ce.admin@rrsdce.edu` | `admin123` |
| Teacher (CE) | `lakshmi.kant@rrsdce.edu` | `teacher123` |
| Teacher (CSE) | `rajiv.ranjan@rrsdce.edu` | `teacher123` |
| Student (CSE) | `23105125023` | DOB `2005-08-15` |
| Student (CE) | `23101125004` | DOB `2005-03-22` |

Full roster: **6 branches · 37 teachers · 269 students · 50 subjects · 2225 enrollments**

---

## 🌐 DEPLOY BACKEND (free 24×7 hosting)

### Option A — Railway (recommended, easiest)
1. Push code to GitHub (see GitHub section below)
2. Go to [railway.app](https://railway.app) → Sign up with GitHub
3. "New Project" → "Deploy from GitHub repo" → select your repo → pick `backend` folder
4. Add environment variables:
   - `SECRET_KEY` = generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - (optional) `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` for email
5. Railway auto-builds using `Dockerfile`. Done in 2-3 minutes!
6. Copy your URL (like `https://your-app.up.railway.app`)
7. In `mobile-app/lib/api.js` set `API_URL` to this URL
8. Rebuild APK (see below) and share

**Cost:** $5 free credit/month → covers hundreds of users easily. Paid tier ~₹400/mo if exceeded.

### Option B — Render (also free)
1. Push to GitHub
2. [render.com](https://render.com) → New Web Service → Connect repo
3. Root directory: `backend`
4. Render auto-reads `render.yaml`
5. Add same env vars as above

**Free tier:** 750 hrs/month (enough for always-on small apps).

---

## 📱 BUILD APK (share with teachers/friends without Play Store)

### One-time setup
```bash
cd mobile-app
npm install -g eas-cli
eas login           # Sign up at expo.dev (free)
```

### Every APK build
```bash
eas build --platform android --profile preview
```

In 10-15 minutes you'll get a download link. Share link via WhatsApp/Email → friend taps → installs → runs.

**Important:** Before building, make sure `mobile-app/lib/api.js` points to your **deployed** backend URL (not `localhost`). Otherwise APK won't work outside your WiFi.

### iPhone?
Requires Apple Developer ($99/year). Skip for now — Android APK works for everyone testing.

---

## 📤 UPLOAD TO GITHUB

```bash
cd class-attendance-app-v1.2
git init
git add .
git commit -m "v1.2.0: initial commit"
```

1. Create new repo at [github.com/new](https://github.com/new) (private or public)
2. Copy the push commands GitHub shows, e.g.:
   ```bash
   git remote add origin https://github.com/yourname/class-attendance.git
   git branch -M main
   git push -u origin main
   ```

The `.gitignore` automatically excludes `.env`, `node_modules`, `*.db`, `venv`, APK files.

---

## 📧 EMAIL SETUP (optional but recommended)

For auto-sending credentials when admin creates a teacher:

1. Enable 2FA on your Gmail
2. Create App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Copy the 16-character password
4. Add to backend env (Railway dashboard or `.env` local file):
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=yourname@gmail.com
   SMTP_PASSWORD=abcd-efgh-ijkl-mnop
   SMTP_FROM=yourname@gmail.com
   ```
5. Restart backend. Now every admin/teacher creation auto-emails credentials!

Without SMTP: credentials just show in UI alert (admin shares manually — still works fine).

---

## 🛡️ SECURITY CHECKLIST (before going live)

### Must do
- [x] `SECRET_KEY` from env (already implemented)
- [x] Passwords hashed with bcrypt (already done)
- [x] JWT tokens with 30-day expiry (done)
- [x] All password fields hashed on DB
- [ ] Set strong `SECRET_KEY` in Railway/Render env
- [ ] Enable HTTPS (Railway/Render give free SSL automatically ✓)
- [ ] Test rate limiting — consider adding `slowapi` for brute-force protection

### Should do
- [ ] Change default passwords in production (use `/api/auth/change-password`)
- [ ] Monitor logs for suspicious login attempts
- [ ] Regular DB backups (Railway has auto-backup option)
- [ ] Add CORS whitelist for production (currently allows all origins for dev)

### What to tell teachers if they ask "is data secure?"
> "Data is stored on a secure cloud server with HTTPS encryption. Passwords are hashed (not stored as plain text). Sessions expire in 30 days. Only authenticated users can access data — each role sees only what they're allowed to see. All personal data is college-owned and used only for attendance tracking."

---

## 📁 Project Structure

```
class-attendance-app-v1.2/
├── backend/                 # FastAPI + SQLite
│   ├── app/
│   │   ├── main.py          # ~40 API endpoints
│   │   ├── models.py        # DB schema
│   │   ├── schemas.py       # Request/response models
│   │   ├── auth.py          # JWT + bcrypt (SECRET_KEY from env)
│   │   ├── email_utils.py   # SMTP credential sender
│   │   └── database.py
│   ├── seed.py              # 269 students + 37 teachers + 50 subjects
│   ├── Dockerfile           # For Docker / Railway
│   ├── railway.json         # Railway config
│   ├── render.yaml          # Render config
│   ├── .env.example         # Copy → .env → fill secrets
│   └── requirements.txt
│
├── mobile-app/              # React Native + Expo SDK 54, React 19, RN 0.81.5
│   ├── app/
│   │   ├── index.js                     # Home — logo + typewriter + 2×2 roles
│   │   ├── login.js                     # Dedicated login page (role param)
│   │   ├── about.js                     # Team — square-rounded photos
│   │   ├── about-app.js
│   │   ├── privacy.js, disclaimer.js
│   │   ├── superadmin/dashboard.js      # 3×2 clickable cards + search
│   │   ├── admin/
│   │   │   ├── dashboard.js
│   │   │   ├── students.js, teachers.js
│   │   │   └── subjects.js
│   │   ├── teacher/
│   │   │   ├── dashboard.js             # Profile pic + 3-button row
│   │   │   ├── mark.js                  # Mark All P/A + success card + back-date edit
│   │   │   ├── dashboard-subject.js     # Attendance overview
│   │   │   └── profile.js               # NEW — image upload
│   │   └── student/
│   │       ├── dashboard.js             # Teacher name + 75% hint
│   │       └── subject.js               # Bar chart + timestamps
│   ├── components/
│   │   ├── AppLogo.js                   # NEW — reusable logo
│   │   ├── Typewriter.js                # NEW — type-delete animation
│   │   ├── SearchBar.js                 # NEW — filter component
│   │   ├── VerifiedBadge.js             # X-style starburst
│   │   ├── Navbar.js
│   │   └── Animated.js
│   ├── lib/
│   │   ├── api.js                       # Auto-IP detection, 30-day auth
│   │   ├── theme.js                     # Modern blue-black palette
│   │   └── ThemeContext.js
│   ├── assets/
│   │   ├── logo.png                     # App icon/splash
│   │   └── devs/                        # Put vishal.jpg, ayush.jpg here
│   ├── app.json                         # Expo config
│   ├── eas.json                         # APK build config
│   └── package.json                     # React 19 + RN 0.81.5 + Expo 54
│
└── .gitignore
```

---

## 📘 API Endpoints Summary

### Public
- `POST /api/login` · `GET /api/branches` · `GET /api/batches`

### Super Admin
- `GET /api/superadmin/stats`
- `GET/POST/PATCH/DELETE /api/superadmin/admins`
- `GET/POST/PATCH/DELETE /api/superadmin/branches`
- `GET/POST/PATCH/DELETE /api/superadmin/batches`
- `GET /api/superadmin/all-{teachers,students,subjects}`

### Branch Admin
- CRUD for teachers, students, subjects
- Teacher creation returns auto-password + auto-emails (if SMTP set)

### Teacher
- `GET /api/teacher/me` *(NEW in v1.2)*
- `GET /api/teacher/subjects` · `GET /api/teacher/subjects/{id}/students`
- `POST /api/teacher/attendance/mark` · `POST /api/teacher/attendance/edit`
- `GET /api/teacher/dashboard/{subject_id}` · `GET /api/teacher/export/{id}`
- `PATCH /api/teacher/profile` (now supports `profile_image`)

### Student
- `GET /api/student/attendance` — list with `teacher_name`, `credits`, `classes_needed_for_75`
- `GET /api/student/attendance/{subject_id}` — detail with marked_at timestamps

---

## 🎯 DEPLOY ROADMAP

1. **Push to GitHub** → `git init && git add . && git commit -m "v1.2.0" && git push`
2. **Deploy backend to Railway** → env vars set → get public URL
3. **Update `mobile-app/lib/api.js` `API_URL`** → point to Railway URL
4. **Build APK** → `eas build --platform android --profile preview` → get download link
5. **Share APK** via WhatsApp/Email to teachers
6. **Collect feedback** → iterate
7. (Later) Pay ₹2100 one-time → upload to Google Play Console → public launch

**Total upfront cost: ₹0** (free tiers handle 100+ users easily)

---

## 👨‍💻 Team

**Vishal Kumar** — Project Lead · Full Stack · [LinkedIn](https://www.linkedin.com/in/thecuriousvishal/)
**Ayush Kumar** — Frontend + Testing

*Design to Development*

---

**Version:** 1.2.0 · © 2026 RRSDCE Begusarai
