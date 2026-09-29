# 4. Hosting (Vercel)

Vercel runs the whole app:

- the pages
- the admin panel
- the Stripe webhook (`/api/webhooks/stripe` runs as a serverless function)
- the daily cleanup job

There is no separate backend to host.

---

## Testing

### Option A: don't deploy

`npm run dev` on your machine is the whole site. This is enough to test everything, including payments with Stripe test mode.

To check a production build locally:

```bash
npm run build
ALLOW_LOCAL_STORAGE=1 npm start
```

`ALLOW_LOCAL_STORAGE=1` is only needed because production builds refuse to save uploads to disk. Never set it on Vercel.

### Option B: a test copy on your own Vercel

Useful for showing the client a link, or opening the site on your phone.

1. Push the repo to your GitHub (private).
2. vercel.com → Add New → Project → import the repo. Framework: Next.js. Leave the build settings alone.
3. Environment variables:
   - **Database, storage and logins:** your own free Supabase project, used for all three (Vercel can't reach the Docker database on your laptop). Set `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, create both buckets, and add `https://<project>.vercel.app/**` to its Auth Redirect URLs.
   - `STRIPE_SECRET_KEY=sk_test_…`, and `STRIPE_WEBHOOK_SECRET` (a placeholder if you skip the webhook).
   - `ADMIN_SESSION_SECRET`, `CRON_SECRET`: any random values.
   - `NEXT_PUBLIC_SITE_URL=https://<project>.vercel.app`
4. Deploy. Run `npm run db:migrate`, `npm run db:seed` and `npm run admin:create` from your machine against that Supabase project.

The Hobby (free) plan is fine for a private test. It's for non-commercial use only, so the real shop must run on the client's Pro team.

---

**Going live?** See [`docs/live/`](../live/README.md).
