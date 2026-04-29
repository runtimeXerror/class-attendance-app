# Persistent Database Setup (Supabase + Render)

The Render free plan **has no persistent disk**, so the default sqlite
database is wiped on every restart/redeploy. That is why students,
teachers and attendance records "disappear" by themselves.

To fix this, point the backend at a free Supabase Postgres database.

## 1. Create the Supabase project

1. Go to https://supabase.com → sign in → **New Project**.
2. Pick a name (e.g. `class-attendance`), set a strong DB password, choose
   the region closest to Render (Singapore for `ap-southeast-1`).
3. Wait ~1 minute for provisioning.

## 2. Copy the connection string

1. In the project, open **Project Settings → Database → Connection string**.
2. Pick the **Transaction pooler** (port `6543`). It looks like:

   ```
   postgresql://postgres.<projectref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

3. Replace `<password>` with the DB password you chose in step 1.

> Always use the **pooler** URL (port 6543). The direct URL (port 5432)
> opens too many connections under Render and Supabase will throttle.

## 3. Set the env var on Render

1. Open your Render service → **Environment** tab → **Add Environment Variable**.
2. Key: `DATABASE_URL`
3. Value: the pooler URL from step 2.
4. Click **Save Changes**. Render will redeploy automatically.

`render.yaml` already declares `DATABASE_URL` with `sync: false`, so the
secret only lives in the Render dashboard — never in git.

## 4. Verify it worked

After the redeploy:

1. Hit `https://<your-render-url>/` — should return `{"status":"ok",...}`.
2. Log in as the superadmin (default credentials are seeded on first
   start — see `seed.py`).
3. Add a teacher / student / mark attendance.
4. In the Render dashboard, click **Manual Deploy → Clear build cache & deploy**.
5. After redeploy, log back in — your data should still be there.

If it is, persistence is working. If not, check **Logs** for
`[startup] Tables ready.` followed by your queries hitting Supabase.

## How it works

- `backend/app/database.py` reads `DATABASE_URL` from env. It auto-rewrites
  `postgres://` → `postgresql://` (Supabase historically used the older
  scheme) and tunes the connection pool for Render's wake/sleep cycle.
- `startup.py` calls `Base.metadata.create_all()` on every boot — this
  is idempotent. New tables added in code show up automatically.
- Initial seeding only runs when the DB is empty (no superadmins).
  Subsequent deploys preserve everything.

## Migrating from sqlite

If you already have data in the local sqlite file (`backend/attendance.db`),
copy it across once with `pgloader` or by re-creating the data through the
admin UI. There is no automatic migration — sqlite → Postgres requires
schema-level conversion.
