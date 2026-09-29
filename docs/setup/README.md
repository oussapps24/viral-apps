# Setup for testing

The least setup that lets you click through the whole site on your own machine. No webhooks, no domain, no client accounts.

**Going live with the client's accounts?** See [`docs/live/`](../live/README.md).

## What you need (about 20 minutes)

| # | File | What to do | Why |
|---|---|---|---|
| 1 | [Supabase](01-supabase.md) | Docker for the database, plus a free Supabase project for logins | Plain Postgres has no login service, so logins need a real Supabase project even locally |
| 2 | [Stripe](02-stripe.md) | A **test mode** secret key (`sk_test_…`) | Lets you pay with test cards. The `/done` page unlocks cards without a webhook |
| 6 | [Admin and secrets](06-admin-and-secrets.md) | Any 32+ character secret, one admin account | The admin panel won't start without the secret |

Then `npm run dev`.

Optional: [3. Email](03-email.md), [4. Vercel](04-vercel.md) (a test copy to show the client or open on your phone), [5. Domain](05-domain.md). None of them are needed to test locally.

## How buying works

Anyone can browse, try demos, customize and preview without an account. At **Unlock**, a signed-out visitor signs up (or logs in), then goes straight to Stripe. The card is saved to their account under **My cards** (`/account/cards`) with its share link. Email confirmation is off, so signing up doesn't send them to their inbox mid-purchase.

## `.env.local` for testing

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/pixilove` |
| `DIRECT_URL` | same as above |
| `SUPABASE_URL` | your free test project's URL |
| `SUPABASE_ANON_KEY` | your test project's anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | empty (uploads go to `./.storage`) |
| `STRIPE_SECRET_KEY` | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | any placeholder, or the `whsec_…` from `stripe listen` |
| `ADMIN_SESSION_SECRET` | any 32+ characters |
| `CRON_SECRET` | anything |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |

`STRIPE_API_BASE` and `ALLOW_LOCAL_STORAGE` are for automated tests and local `next start` only.
