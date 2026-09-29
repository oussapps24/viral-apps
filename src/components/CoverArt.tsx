import type { TemplateView } from "@/lib/templates";

const FONT = { display: "font-display font-black", type: "font-type font-bold", round: "font-round font-extrabold" } as const;

/**
 * Inside of a gallery tile: the uploaded cover image, or a mini first screen
 * drawn from the template (animated sticker or first-screen photo + title).
 */
export function CoverArt({ t, size = "md" }: { t: TemplateView; size?: "sm" | "md" }) {
  const { cover } = t;
  if (t.coverUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={t.coverUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />;
  }
  return (
    <>
      {cover.art ? (
        <span className={`block overflow-hidden rounded-2xl bg-white/70 shadow-sm ${size === "sm" ? "h-20 w-20" : "h-24 w-24 sm:h-28 sm:w-28"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover.art} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </span>
      ) : (
        cover.emoji && <span className="text-3xl">{cover.emoji}</span>
      )}
      <span className={`mt-1 leading-tight ${size === "sm" ? "text-lg" : "text-xl"} ${FONT[cover.font]}`}>{cover.title}</span>
      {cover.subtitle && <span className="text-sm opacity-70">{cover.subtitle}</span>}
    </>
  );
}
