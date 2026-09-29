import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CardRenderer from "@/designs/CardRenderer";
import { cardPhotos, getCardByShareSlug, isLive } from "@/lib/cards";
import { getTemplateById } from "@/lib/templates";

/** The page the recipient opens. Only renders once paid (and not refunded). */
export default async function SharedCardPage({ params }: PageProps<"/c/[shareSlug]">) {
  const { shareSlug } = await params;
  const card = await getCardByShareSlug(shareSlug);
  if (!card || !isLive(card)) notFound();

  // By id, so the card keeps working even if the admin later unpublishes the template.
  const template = await getTemplateById(card.templateId);
  if (!template) notFound();
  const photos = await cardPhotos(card);

  return (
    <>
      <CardRenderer design={template.designKey} data={card.data} photos={{ ...template.defaultPhotos, ...photos }} music={template.music} />
      {/* Every card sent is an ad: small, tasteful, bottom corner. */}
      <Link
        href="/"
        className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-extrabold text-plum-soft shadow backdrop-blur"
      >
        made with <span className="font-display italic text-rose">pixi.love</span> ♡
      </Link>
    </>
  );
}

// Link previews in WhatsApp / iMessage show who the card is for.
export async function generateMetadata({ params }: PageProps<"/c/[shareSlug]">): Promise<Metadata> {
  const { shareSlug } = await params;
  const card = await getCardByShareSlug(shareSlug);
  if (!card || !isLive(card)) return { title: "Card not found", robots: { index: false } };
  const title = `A little something for ${card.data.toName ?? "you"} 💌`;
  return {
    title: { absolute: title },
    description: "Tap to open",
    openGraph: { title, description: "Tap to open" },
    robots: { index: false },
  };
}
