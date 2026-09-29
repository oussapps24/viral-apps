import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CardRenderer from "@/designs/CardRenderer";
import { formatPrice } from "@/designs/registry";
import { cardPhotos, getCardById } from "@/lib/cards";
import { getTemplateById } from "@/lib/templates";

export const metadata = { title: "Your preview", robots: { index: false } };

/** Draft preview: the buyer plays their card with a watermark, then unlocks it. */
export default async function DraftPreviewPage({ params, searchParams }: PageProps<"/p/[cardId]">) {
  const { cardId } = await params;
  const { error } = await searchParams;
  const card = await getCardById(cardId);
  if (!card) notFound();
  if (card.status === "paid") redirect(`/done/${card.id}`);

  const template = await getTemplateById(card.templateId);
  if (!template) notFound();
  const photos = await cardPhotos(card);
  const checkout = `/p/${card.id}/checkout`;

  return (
    <div className="relative pb-40 sm:pb-16">
      <CardRenderer design={template.designKey} data={card.data} photos={{ ...template.defaultPhotos, ...photos }} music={template.music} />

      <div className="pointer-events-none fixed inset-0 z-10 grid place-items-center overflow-hidden">
        <span className="-rotate-[20deg] select-none whitespace-nowrap font-display text-[18vw] font-black tracking-widest text-black/[0.05] sm:text-9xl">
          PREVIEW
        </span>
      </div>

      <Link
        href={`/editor/${template.slug}`}
        className="fixed left-4 top-4 z-30 rounded-full bg-white/85 px-4 py-2.5 text-sm font-extrabold text-plum shadow-md backdrop-blur"
      >
        ← Start over
      </Link>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-petal bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-10px_30px_-15px_rgba(59,21,48,.3)] backdrop-blur">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="font-extrabold text-plum">Love it? Unlock your share link.</p>
            <p className="text-xs text-plum-soft">
              One-time {formatPrice(template.priceCents)} · secure checkout by Stripe · saved in My cards
              {error === "owner" && <span className="ml-1 font-bold text-red-600">· This card belongs to another account</span>}
              {error === "checkout" && <span className="ml-1 font-bold text-red-600">· Checkout couldn&apos;t start. Please try again.</span>}
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-1.5 sm:w-auto">
            {/* Plain <a>: a full navigation to the checkout route (never prefetched). */}
            {/* Buyers signed in before customizing; the checkout route still guards older unowned drafts. */}
            <a href={checkout} className="btn btn-primary w-full whitespace-nowrap px-8">
              Unlock for {formatPrice(template.priceCents)}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
