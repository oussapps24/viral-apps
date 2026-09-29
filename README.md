# pixi.love

Interactive e-cards. Pick a template, customize it, preview it, sign up and pay once with Stripe to unlock a share link. Buyers see their cards and links under My cards. Includes an admin panel at `/admin`.

**Stack:** Next.js 16 (App Router) · Tailwind v4 · Motion · Postgres (Supabase in production, Docker locally) · Drizzle · Supabase Storage · Supabase Auth · Stripe Checkout · Vercel

**Setup:** [`docs/setup/`](docs/setup/README.md) for testing on your own machine, [`docs/live/`](docs/live/README.md) for the client's live accounts (every step says why it's needed).

## Local development

```bash
docker compose up -d                              # Postgres for data
cp .env.example .env.local                        # ADMIN_SESSION_SECRET + SUPABASE_URL/ANON_KEY (free project, logins only)
npm install
npm run db:migrate                                # adds customers + cards.user_id (0002), no reset needed
npm run db:seed                                   # 5 categories, 8 templates, 2 prompts
npm run admin:create -- you@example.com "a long password"
npm run dev
stripe listen --forward-to localhost:3000/api/webhooks/stripe   # paste its whsec_ into .env.local
```

Logins need a Supabase project even locally: create a free one, turn **Confirm email** off, add `http://localhost:3000/**` to its Redirect URLs (see `docs/setup/01-supabase.md`).

Without `SUPABASE_SERVICE_ROLE_KEY`, uploads are saved to `./.storage` and served by `/api/files`. That fallback refuses to run in production (unless `ALLOW_LOCAL_STORAGE=1`, which is for local `next start` only).

## Designs vs templates

- **Designs** (`src/designs/`) are the 8 animated layouts. They're code, because the interactions are code. Each declares the fields a buyer fills in.
- **Templates** (`templates` table) are the cards for sale, managed in `/admin`: name, category, design, price, cover, music, demo content, published flag.

New design: add `src/designs/<name>/Card.tsx` (a client component taking `{ data, photos }`) and register it in `src/designs/registry.ts`. It then appears in the admin's design picker.

Shared card kit in `src/designs/kit/`: `Stage` (background + music: a built-in synth track or the template's uploaded song, started on first tap), `Gifts` (memories / song / letter boxes), `Confetti`.

## Routes

| Route | What it does |
|---|---|
| `/` · `/cards` | Landing page and gallery (published templates, `?category=`) |
| `/t/[slug]` | Free demo. Admins can add `?preview=1` to see hidden templates |
| `/editor/[slug]` | Buyer fills the design's fields. Photos shrunk in the browser, card saved as a draft |
| `/p/[cardId]` | Watermarked preview + Unlock (or Sign up & unlock) |
| `/p/[cardId]/checkout` | Needs a login: claims the draft for the account, reuses an open Stripe session or creates one, redirects to Stripe |
| `/done/[cardId]` | Share link after paying |
| `/signup` `/login` `/forgot` | Customer accounts (Supabase Auth, email + password, no email confirmation) |
| `/account` | Email and change password |
| `/account/cards` | My cards: paid cards with Open / Copy link, refunded ones marked, unpaid drafts from the last 7 days |
| `/account/new-password` | Where the reset email lands |
| `/auth/callback` | Exchanges the link in auth emails for a session |
| `/c/[shareSlug]` | What the recipient opens. Only when paid, not refunded |
| `/prompts` | AI prompt gallery |
| `/terms` `/privacy` `/refunds` | Placeholder legal text. Replace before launch |
| `/admin` | Dashboard, orders, customers, templates, categories, prompts |
| `/api/webhooks/stripe` | Stripe webhook (route handler → Vercel serverless function) |
| `/api/cron/cleanup` | Daily: deletes unpaid drafts older than 7 days (see `vercel.json`) |

## Payments (Stripe)

1. **Unlock** links to `/p/[cardId]/checkout` (`route.ts`). Signed-out visitors go to `/signup?next=…` first. The route reads the price from the DB, creates a Checkout Session with the account email and `metadata.cardId` / `userId`, inserts a `pending` order and redirects to Stripe. An open session for the same card is reused.
2. After payment, **both** the `/done` page (by retrieving the session) and the webhook call `fulfillStripeSession()` in `src/lib/cards.ts`. It's idempotent: one transaction marks the order `paid` and flips the card `draft → paid`. Stripe sends the receipt; the share link lives in My cards.
3. The webhook verifies the signature and records each event id in `webhook_events`, so Stripe's retries are skipped.
4. `charge.refunded` (full refund) marks the order and card `refunded`; the link stops working.

Webhook events to subscribe: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`.

## Customer accounts

Supabase Auth via `@supabase/ssr`. `src/lib/supabase.ts` makes the server client, `src/lib/user.ts` has `getCurrentUser()` / `requireUser()`, and `src/proxy.ts` refreshes the session cookie (it skips requests without one, so anonymous browsing never calls Supabase). Each login gets a row in `customers` (same id as the Supabase user); `cards.user_id` links cards to it. Password reset emails are sent by Supabase through whatever SMTP sender is connected in its dashboard. Without one, admins can make a one-time reset link from `/admin/customers` (`generateLink`, no email sent). See `docs/setup/03-email.md`.

## Admin auth

`src/lib/auth.ts`: scrypt password hashes, HMAC-signed httpOnly session cookie (7 days, `ADMIN_SESSION_SECRET`). Every admin page and every admin server action calls `requireAdmin()`. Admin logins are separate from customer accounts. Create or reset an admin with `npm run admin:create -- email "password"`.

## Database

Schema: `src/db/schema.ts`. After changing it: `npm run db:generate`, then `npm run db:migrate`.

Tables: `admins`, `customers`, `categories`, `templates`, `cards`, `orders`, `webhook_events`, `prompts`.

## Scripts

`dev` · `build` · `lint` · `typecheck` · `db:generate` · `db:migrate` · `db:studio` · `db:seed` · `admin:create`

## Test-only settings

`STRIPE_API_BASE` points the Stripe client at a mock server for automated tests. Never set it in production.
