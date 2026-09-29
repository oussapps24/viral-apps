# 1. Supabase: database, file storage, customer logins

Supabase does three jobs:

| Job | What | Local testing | Live |
|---|---|---|---|
| **Database** | Postgres: templates, cards, orders, customers, admins | Your Docker Postgres | Client's Supabase |
| **File storage** | `card-photos` (private: buyers' photos), `site-assets` (public: admin uploads) | `.storage/` folder on disk | Client's Supabase buckets |
| **Customer logins** | Signup, login, sessions, password reset emails (Supabase Auth) | A free Supabase project of yours | Client's Supabase |

Logins always need a real Supabase project, even locally. Plain Postgres doesn't have an auth service, and we don't use the Supabase CLI.

The browser never talks to Supabase. All calls go through the app's server, so there's no Supabase code in the browser, no Edge Functions, and no Supabase security policies to maintain. The admin panel has its own separate login (see `06-admin-and-secrets.md`).

---

## Testing

### 1. Database: Docker

`docker-compose.yml` runs Postgres 16 on port 5432.

```bash
docker compose up -d
npm run db:migrate
npm run db:seed
```

Wipe and start over any time:

```bash
docker compose down -v && docker compose up -d
rm -rf .storage
npm run db:migrate && npm run db:seed
```

Browse the data: `npm run db:studio`.

### 2. Logins: a free Supabase project (about 2 minutes)

1. supabase.com → New project (your own account, free plan). Any name and region; set a throwaway database password. You won't use its database.
2. **Turn email confirmation off:** Authentication → Sign In / Providers → **Email** → switch off **Confirm email** → Save. New accounts can then buy straight away.
3. **Allow localhost links** (used by password reset emails): Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: add `http://localhost:3000/**`
4. **Keys:** Project Settings → API. Copy the Project URL and the **anon** / publishable key.

### 3. `.env.local`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pixilove
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/pixilove

SUPABASE_URL=https://<your-test-project>.supabase.co
SUPABASE_ANON_KEY=<anon or publishable key>
SUPABASE_SERVICE_ROLE_KEY=
```

With `SUPABASE_SERVICE_ROLE_KEY` empty, uploads go to the local `.storage/` folder. Your data stays in Docker; only logins go through the test project.

Accounts you create while testing appear in that project under Authentication → Users. After wiping the Docker database, those logins still work: the app re-creates the customer record the next time they log in or buy.

Password reset emails from a free project only reach people on the project's team (so: you), and at most 2 an hour. See `03-email.md`.

### Free project pausing

Free projects pause after about 7 days of low activity. If logins suddenly fail, open the project in the dashboard and click Restore.

---

**Going live?** See [`docs/live/`](../live/README.md).
