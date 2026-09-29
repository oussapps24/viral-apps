import { and, desc, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { getCardById } from "@/lib/cards";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { getTemplateById } from "@/lib/templates";
import { getCurrentUser, upsertCustomer } from "@/lib/user";

/**
 * The "Unlock" button. Signed-out buyers go to signup and come straight back
 * here. Then: attach the draft to their account, create a Stripe Checkout
 * Session for it, record a pending order, and send them to Stripe.
 */
export async function GET(_req: Request, ctx: RouteContext<"/p/[cardId]/checkout">) {
  const { cardId } = await ctx.params;
  const card = await getCardById(cardId);
  if (!card) redirect("/cards");

  const user = await getCurrentUser();
  if (!user) redirect(`/signup?next=${encodeURIComponent(`/p/${card.id}/checkout`)}`);

  if (card.status === "paid") redirect(`/done/${card.id}`);
  await upsertCustomer(user); // make sure the owner row exists before linking the card
  if (card.status === "refunded") redirect("/account/cards");

  // A draft made before signing up has no owner yet: it becomes theirs now.
  // Someone else's draft can't be bought from another account.
  if (!card.userId) {
    // Only claim if still unowned: two accounts racing for the same draft.
    const claimed = await db()
      .update(schema.cards)
      .set({ userId: user.id })
      .where(and(eq(schema.cards.id, card.id), isNull(schema.cards.userId)))
      .returning({ id: schema.cards.id });
    if (claimed.length === 0) {
      const fresh = await getCardById(card.id);
      if (fresh?.userId !== user.id) redirect(`/p/${card.id}?error=owner`);
    }
  } else if (card.userId !== user.id) {
    redirect(`/p/${card.id}?error=owner`);
  }

  const template = await getTemplateById(card.templateId);
  if (!template) redirect("/cards");

  // Reuse an open checkout for this card (double clicks, back button, a second
  // tab) instead of creating another Stripe session and another pending order.
  const [pending] = await db()
    .select()
    .from(schema.orders)
    .where(and(eq(schema.orders.cardId, card.id), eq(schema.orders.status, "pending")))
    .orderBy(desc(schema.orders.createdAt))
    .limit(1);
  if (pending && pending.amountCents === template.priceCents) {
    const open = await stripe().checkout.sessions.retrieve(pending.stripeSessionId).catch(() => null);
    if (open?.status === "open" && open.url) redirect(open.url);
  }

  const site = env.siteUrl();
  // redirect() throws, so it must stay outside the try: pick the target here.
  let target = `/p/${card.id}?error=checkout`;
  try {
    // The price always comes from the database, never from the browser.
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: template.priceCents,
            product_data: { name: `${template.name} card` },
          },
        },
      ],
      // cardId rides along so the webhook knows which card to unlock.
      metadata: { cardId: card.id, userId: user.id },
      client_reference_id: card.id,
      success_url: `${site}/done/${card.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/p/${card.id}`,
      // Short-lived (Stripe min is 30 min) so a stale checkout can't outlive draft cleanup.
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    });

    await db().insert(schema.orders).values({
      cardId: card.id,
      stripeSessionId: session.id,
      amountCents: template.priceCents,
      currency: "usd",
    });
    if (session.url) target = session.url;
  } catch (err) {
    console.error("Checkout start failed", err);
  }

  redirect(target);
}
