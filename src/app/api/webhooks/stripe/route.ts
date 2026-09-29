import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db, schema } from "@/db";
import { fulfillStripeSession, markSessionFailed, refundByPaymentIntent } from "@/lib/cards";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";

/**
 * Stripe → POST here. This is a normal Next.js route handler; on Vercel it runs
 * as a serverless function. No Supabase Edge Function involved.
 *
 * Register in the Stripe dashboard (Developers → Webhooks) with events:
 *   checkout.session.completed
 *   checkout.session.async_payment_succeeded
 *   checkout.session.async_payment_failed
 *   checkout.session.expired
 *   charge.refunded
 * Local dev: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
 */
export async function POST(req: Request) {
  // Signature check needs the raw body, so read text, not json.
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, env.stripeWebhookSecret());
  } catch (err) {
    console.error("Stripe signature check failed", err);
    return new Response("Bad signature", { status: 400 });
  }

  // Stripe delivers at least once. Skip events we've already handled.
  const [seen] = await db()
    .select({ id: schema.webhookEvents.id })
    .from(schema.webhookEvents)
    .where(eq(schema.webhookEvents.id, event.id))
    .limit(1);
  if (seen) return Response.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfillStripeSession(event.data.object);
        break;
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        await markSessionFailed(event.data.object.id);
        break;
      case "charge.refunded": {
        const charge = event.data.object;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        // Only a full refund re-locks the card. Partial refunds are a goodwill gesture.
        if (charge.refunded && pi) await refundByPaymentIntent(pi);
        break;
      }
    }
  } catch (err) {
    // No marker was written, so Stripe's retry gets processed.
    console.error("Webhook handling failed", err);
    return new Response("Handler error", { status: 500 });
  }

  // Mark only after success: a crash mid-handling must not turn the retry into a
  // "duplicate". Handlers are idempotent, so a concurrent double-run is harmless.
  await db().insert(schema.webhookEvents).values({ id: event.id, type: event.type }).onConflictDoNothing();

  return Response.json({ received: true });
}
