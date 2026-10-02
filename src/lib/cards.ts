import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { db, schema } from "@/db";
import { env } from "./env";
import { signedPhotoUrls } from "./storage";

const { cards, orders, customers } = schema;

export async function getCardById(id: string) {
  // Reject non-uuids early so Postgres doesn't throw on a bad cast.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  return db().query.cards.findFirst({ where: eq(cards.id, id) });
}

export async function getCardByShareSlug(shareSlug: string) {
  if (!/^[\w-]{6,32}$/.test(shareSlug)) return undefined;
  return db().query.cards.findFirst({ where: eq(cards.shareSlug, shareSlug) });
}

export function isLive(card: schema.Card) {
  return card.status === "paid" && (!card.expiresAt || card.expiresAt > new Date());
}

export function cardPhotos(card: schema.Card) {
  return signedPhotoUrls(card.photos);
}

export const shareUrl = (card: Pick<schema.Card, "shareSlug">) => `${env.siteUrl()}/c/${card.shareSlug}`;

/**
 * Unlocks a card after Stripe says the Checkout Session is paid.
 *
 * Idempotent: the webhook and the /done page can both call it, any number of
 * times, in any order. The card then shows up in the buyer's My cards.
 */
export async function fulfillStripeSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return false;
  const cardId = session.metadata?.cardId;
  if (!cardId) return false;
  const pi = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

  // Card gone (e.g. deleted): the order insert would fail on the FK and Stripe
  // would retry forever. Flag it for a manual refund and ack the event.
  if (!(await getCardById(cardId))) {
    console.error("PAID SESSION FOR MISSING CARD — refund manually", { sessionId: session.id, cardId, paymentIntent: pi });
    return false;
  }

  await db().transaction(async (tx) => {
    await tx
      .insert(orders)
      .values({
        cardId,
        stripeSessionId: session.id,
        stripePaymentIntentId: pi,
        amountCents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        status: "paid",
      })
      .onConflictDoUpdate({
        target: orders.stripeSessionId,
        set: { status: "paid", stripePaymentIntentId: pi, updatedAt: new Date() },
      });

    await tx
      .update(cards)
      .set({ status: "paid", paidAt: sql`coalesce(${cards.paidAt}, now())`, buyerEmail: session.customer_details?.email ?? null })
      .where(and(eq(cards.id, cardId), eq(cards.status, "draft")));
  });

  return true;
}

/** Whether an admin has switched on free access for this account. Always read from the database. */
export async function hasFreeAccess(userId: string) {
  const [row] = await db().select({ free: customers.freeAccess }).from(customers).where(eq(customers.id, userId)).limit(1);
  return row?.free === true;
}

/**
 * Unlocks a draft for a free-access account: no Stripe, a zero-amount order marked
 * `isFree` so it shows up in the admin Orders list but never in revenue.
 * Idempotent: an already unlocked card is left alone.
 */
export async function unlockFree(cardId: string, buyerEmail: string) {
  await db().transaction(async (tx) => {
    const unlocked = await tx
      .update(cards)
      .set({ status: "paid", paidAt: sql`coalesce(${cards.paidAt}, now())`, buyerEmail })
      .where(and(eq(cards.id, cardId), eq(cards.status, "draft")))
      .returning({ id: cards.id });
    if (unlocked.length === 0) return;
    await tx.insert(orders).values({
      cardId,
      // The column is unique and NOT NULL; free orders get a synthetic id that can't clash with Stripe's cs_ ids.
      stripeSessionId: `free_${randomUUID()}`,
      amountCents: 0,
      isFree: true,
      status: "paid",
    });
  });
}

/** Checkout expired or async payment failed. */
export async function markSessionFailed(sessionId: string) {
  await db()
    .update(orders)
    .set({ status: "failed", updatedAt: new Date() })
    .where(and(eq(orders.stripeSessionId, sessionId), eq(orders.status, "pending")));
}

/** Full refund → order refunded and the share link stops working. */
export async function refundByPaymentIntent(paymentIntentId: string) {
  await db().transaction(async (tx) => {
    const [order] = await tx
      .update(orders)
      .set({ status: "refunded", updatedAt: new Date() })
      .where(eq(orders.stripePaymentIntentId, paymentIntentId))
      .returning({ cardId: orders.cardId });
    if (order) await tx.update(cards).set({ status: "refunded" }).where(eq(cards.id, order.cardId));
  });
}
