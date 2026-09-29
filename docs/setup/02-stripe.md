# 2. Payments (Stripe)

Buyers pay on Stripe's hosted Checkout page. The site only needs the **secret key**, plus the **webhook signing secret** in live. There's no publishable key and no Stripe code in the browser.

How a payment unlocks a card (details in `src/lib/cards.ts`):

1. **Unlock** creates a Checkout Session with `metadata.cardId` and a `pending` order row.
2. After paying, Stripe sends the buyer to `/done/<cardId>?session_id=cs_…`. That page asks Stripe whether the session is paid, and if so unlocks the card. **This alone is enough for testing.**
3. Stripe also sends a webhook to `/api/webhooks/stripe`, which calls the same unlock function. The webhook is what covers:
   - buyers who close the tab before the redirect
   - expired checkouts (the order becomes `failed`)
   - **refunds** (the card's link switches off)

---

## Testing

### Which account

**Recommended:** ask the client to invite you to his Stripe account (Settings → Team → Invite, role **Developer**) and use its **test mode**. Test mode works before the account is activated. You then test against the same account that will go live, and there's nothing to migrate later.

**Your own account:** Stripe doesn't support businesses based in Pakistan, so you can't activate an account of your own. Only use your own account if Stripe lets you sign up legitimately, and even then use test mode only.

### Keys

In the dashboard, switch to **Test mode** (or open a Sandbox). Then Developers → API keys → **Secret key** (`sk_test_…`).

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_placeholder   # any value works if you skip the webhook
```

### Test a purchase (no webhook)

1. `npm run dev`
2. Open a card, Customize, Preview, **Sign up & unlock** (create a test account; needs the free Supabase project from `01-supabase.md`).
3. Pay with a test card:

   | Card number | Result |
   |---|---|
   | `4242 4242 4242 4242` | Succeeds |
   | `4000 0025 0000 3155` | Asks for 3D Secure, then succeeds |
   | `4000 0000 0000 9995` | Declined (insufficient funds) |

   Any future expiry date, any CVC, any postcode.
4. You land on `/done/...` with the share link. The card is in **My cards**, and the order shows as **Paid** in `/admin/orders`. Stripe's page was pre-filled with the account's email.

### Optional: test refunds and webhooks locally

Refunds only reach the site through the webhook. To try them without deploying, install the [Stripe CLI](https://docs.stripe.com/stripe-cli):

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

It prints a `whsec_…` value. Put it in `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`. Keep `stripe listen` running, then:

- Make a test purchase. The terminal shows `checkout.session.completed → 200`.
- In the Stripe dashboard (test mode) → Payments → open the payment → **Refund** the full amount. The terminal shows `charge.refunded → 200`, the order turns **Refunded** in `/admin/orders`, and the card link now shows "This card isn't here".

`stripe trigger checkout.session.completed` sends a fake event with no card attached. The site accepts it and does nothing, which is expected.

### Optional: webhook on a hosted test copy

If you deployed a test copy to your own Vercel (see `04-vercel.md`): Developers → Webhooks → Add endpoint, in **test mode**, URL `https://<your-test>.vercel.app/api/webhooks/stripe`, with the five events listed in [`docs/live/02-stripe.md`](../live/02-stripe.md). Put its signing secret in that Vercel project's variables.

---

**Going live?** See [`docs/live/`](../live/README.md).
