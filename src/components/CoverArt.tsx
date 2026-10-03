import type { TemplateView } from "@/lib/templates";

const FONT = { display: "font-display font-black", type: "font-type font-bold", round: "font-round font-extrabold" } as const;

/**
 * Inside of a gallery tile: a mini first screen drawn from the template. The icon
 * is the uploaded cover image (fitted inside the tile, never cropped or enlarged
 * past it), else the animated sticker or first-screen photo; the title sits below.
 */
export function CoverArt({ t, size = "md" }: { t: TemplateView; size?: "sm" | "md" }) {
  const { cover } = t;
  return (
    <>
      {(t.coverUrl || cover.art) && (
        <span className={`block overflow-hidden rounded-2xl ${t.coverUrl ? "" : "bg-white/70 shadow-sm"} ${size === "sm" ? "h-20 w-20" : "h-24 w-24 sm:h-28 sm:w-28"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.coverUrl ?? cover.art} alt="" loading="lazy" decoding="async" className={`h-full w-full ${t.coverUrl ? "object-contain" : "object-cover"}`} />
        </span>
      )}
      <span className={`mt-1 leading-tight ${size === "sm" ? "text-lg" : "text-xl"} ${FONT[cover.font]}`}>{cover.title}</span>
      {cover.subtitle && <span className="text-sm opacity-70">{cover.subtitle}</span>}
    </>
  );
}
