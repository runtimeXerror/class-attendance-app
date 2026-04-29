# Make Login Instant (Keep Backend Warm)

The Render free plan **sleeps the server after 15 minutes of inactivity**.
The first request after a sleep wakes it up but takes 30–50 seconds. That
is exactly the "login takes 2–3 minutes" symptom — the request is timing
out and retrying through the cold start.

The mobile app already pre-warms the backend on launch (`warmupBackend()`
in `lib/api.js`), so by the time the user types credentials the server is
usually awake. To make this even more reliable — and to make the very
first request of the session fast as well — set up an external pinger.

## Option A — UptimeRobot (recommended, free, 2 min setup)

1. Go to https://uptimerobot.com → sign up for a free account.
2. Click **+ New Monitor**.
3. Settings:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** class-attendance-backend
   - **URL:** `https://<your-render-app>.onrender.com/`
   - **Monitoring Interval:** 5 minutes (free tier minimum)
4. Save. UptimeRobot will hit `/` every 5 min, which keeps Render from
   ever sleeping the server.

The endpoint `/` returns `{"status":"ok"}` and does no DB work, so the
constant pinging is essentially free for both Render and Supabase.

## Option B — cron-job.org

1. https://cron-job.org → sign up.
2. **Create cronjob** → URL = `https://<your-render-app>.onrender.com/`
3. Schedule: every 10 minutes.

## Option C — Render paid plan

The $7/mo Starter plan has no idle sleep. Login becomes instant
permanently with no pinger required.

## Verifying

1. Wait 30+ minutes without using the app or pinging it.
2. Hit `/` from a browser. If it returns within ~1s, the server is warm.
   If it takes 30s+, the pinger is not configured correctly.

## Not enough? Inside the app

`warmupBackend()` is called in:

- `app/_layout.js` (when the app process starts)
- `app/index.js` (when the user lands on the role-picker)
- `app/login.js` (when the login screen mounts)

Combined with UptimeRobot, login latency on a working network drops from
60–180s to under a second.
