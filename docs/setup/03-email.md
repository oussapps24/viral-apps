# 3. Password reset emails

The site sends one kind of email: **"reset your password"**. Supabase Auth sends it. Receipts come from Stripe, and share links live in My cards, so nothing else is emailed.

Supabase's built-in sender is for testing only, **on every plan including Pro**:

- only reaches addresses on the Supabase project's team
- at most 2 emails an hour
- no delivery guarantee

That's enough for testing. For live options see [`docs/live/05-email.md`](../live/05-email.md).

---

## Testing

Nothing to set up.

- **"Forgot password?"** works for your own email (you're on the project's team), up to 2 an hour.
- **Admin reset link** (the button in `/admin/customers`) needs `SUPABASE_SERVICE_ROLE_KEY`. Locally that key also switches photo uploads to Supabase, so to try it: paste your free project's service_role key, create the two buckets (see [`docs/live/01-supabase.md`](../live/01-supabase.md), step 6), and restart `npm run dev`. Or skip it locally and check it on the live site.

---

**Going live?** See [`docs/live/`](../live/README.md).
