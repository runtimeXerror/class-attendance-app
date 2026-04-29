# Make Login Instant (Keep Backend Warm)

Render's free plan **sleeps the dyno after 15 minutes of inactivity**.
The first request after a sleep wakes it up but takes 30–50 seconds.
That is the "login takes 2–3 minutes" symptom — axios was timing out
and retrying through a full cold boot.

The app already attacks this from three sides. Pick the level of
warmth you need.

## Built-in (already in code)

These run on every install of the app — no setup required.

### 1. Multi-endpoint parallel warmup
`warmupBackend()` in `mobile-app/lib/api.js` fires **two parallel
pings** (`/healthz` and `/`) and races them. Whichever lands first
wins, but both contribute to waking the dyno.

Called from:

- `app/_layout.js` — when the app process starts
- `app/index.js` — when the user lands on the role-picker
- `app/login.js` — when the login screen mounts
- The axios retry interceptor — re-fires on every timeout retry

A 30-second internal cooldown prevents redundant pings. Pass
`force=true` to bypass (the retry interceptor does this).

### 2. In-app keep-alive ping (the "jugad")
`startKeepAlive()` registers a **4-minute interval** that hits
`/healthz`. As long as **any** user has the app open, the dyno is
hit roughly every 4 minutes — well under the 15-minute sleep
threshold — so it never sleeps.

The interval is started once from `_layout.js` on app launch and
stopped on unmount (which never happens for the root layout, so it
runs for the whole session).

### 3. Aggressive axios retry
- First attempt: **12 s** timeout (warm-server case finishes in <1 s).
- Retries: **25 s** timeout (covers a real cold start).
- Each retry triggers a fresh `warmupBackend(true)` so the dyno wakes
  in parallel with the in-flight request.
- 2 retries max → worst case ~62 s, typical warm <1 s.

### 4. Lightweight `/healthz` endpoint
`backend/app/main.py` exposes:

```python
@app.get("/healthz")
def healthz():
    return {"ok": True}
```

No DB read, no auth, no body work — just enough to count as activity
on Render's idle timer.

## External (recommended for 24×7 warmth)

Built-in #2 only works while a user has the app open. If your last
user closes the app at 10 PM and the next opens at 8 AM, the first
person sees a cold start. To prevent that, set up an external pinger.

### Option A — UptimeRobot (free, 2 min setup)
1. https://uptimerobot.com → free account.
2. **+ New Monitor** → HTTP(s).
3. URL: `https://<your-render-app>.onrender.com/healthz`
4. Interval: **5 min** (free tier minimum).
5. Save. UptimeRobot now hits `/healthz` every 5 min globally.

### Option B — cron-job.org
1. Sign up → **Create cronjob**.
2. URL: `https://<your-render-app>.onrender.com/healthz`
3. Schedule: every 10 min.

### Option C — Render paid plan
$7/mo Starter plan = no idle sleep. No pinger required.

## Verifying

1. Wait 30+ minutes without using the app or pinging it.
2. Hit `/healthz` from a browser — should return `{"ok":true}` in <1 s.
3. If it takes 30 s+, the external pinger (UptimeRobot) is not running
   correctly *and* no one has the app open.

If the in-app keep-alive is the only thing running, the server stays
warm only while at least one user has the app foregrounded /
backgrounded with the JS thread alive — i.e. RN apps that are not
fully killed.

## Tuning

| What | Where | Default |
|---|---|---|
| Splash min duration | `app/_layout.js` `minDuration={…}` | 700 ms |
| Keep-alive interval | `lib/api.js` `startKeepAlive(ms)` | 240000 (4 min) |
| First-attempt timeout | `lib/api.js` `axios.create({ timeout })` | 12000 |
| Retry timeout | `lib/api.js` interceptor `config.timeout` | 25000 |
| Max retries | `lib/api.js` interceptor (`< 2`) | 2 |
| Warmup cooldown | `lib/api.js` `_lastWarm` check | 30000 (30 s) |

## End-to-end timing

| Scenario | Expected login time |
|---|---|
| Server warm (UptimeRobot OR another user just used app) | < 1 s |
| Server cold, user opens app and waits ~10 s on splash + role pick before login | ~ 1–3 s (warmup overlapped) |
| Server cold, user opens app and immediately logs in | 12–25 s (one timeout + retry — first retry wakes the dyno) |
| Network down | Fails after 12 + 25 + 25 ≈ 62 s with the friendly retry message |
