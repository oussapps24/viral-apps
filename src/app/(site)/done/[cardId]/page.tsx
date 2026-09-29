import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { fulfillStripeSession, getCardById, shareUrl } from "@/lib/cards";
import { stripe } from "@/lib/stripe";
import CopyLink from "./CopyLink";

export const metadata = { title: "Your card is ready", robots: { index: false } };

export default async function DonePage({ params, searchParams }: PageProps<"/done/[cardId]">) {
  const { cardId } = await params;
  const { session_id } = await searchParams;
  let card = await getCardById(cardId);
  if (!card) notFound();

  // The webhook can land a few seconds after the redirect. If it hasn't yet,
  // confirm with Stripe directly so the buyer never sees a "pending" dead end.
  if (card.status === "draft" && typeof session_id === "string" && session_id.startsWith("cs_")) {
    // A bogus/foreign session id throws; fall through to the redirect instead of crashing.
    try {
      const session = await stripe().checkout.sessions.retrieve(session_id);
      if (session.metadata?.cardId === card.id && (await fulfillStripeSession(session))) {
        card = await getCardById(cardId);
      }
    } catch (err) {
      console.error("Done page session check failed", err);
    }
  }
  if (!card || card.status !== "paid") redirect(`/p/${cardId}`);

  const url = shareUrl(card);

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center">
      <span className="text-7xl">🎉</span>
      <h1 className="mt-4 font-display text-4xl font-black">Your card is ready</h1>
      <p className="mt-2 text-plum-soft">
        Send this link to {card.data.toName ?? "them"}. It opens straight to your card.
      </p>
      <div className="mt-8 w-full">
        <CopyLink url={url} />
      </div>
      <p className="mt-6 text-sm text-plum-soft">
        It&apos;s saved in <Link href="/account/cards" className="font-extrabold text-rose">My cards</Link>, so you can always copy it again.
      </p>
      <Link href={`/c/${card.shareSlug}`} className="mt-6 text-sm font-extrabold text-rose">
        See what they&apos;ll see →
      </Link>
    </main>
  );
}
