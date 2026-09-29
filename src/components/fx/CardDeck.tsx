import Link from "next/link";
import { CoverArt } from "@/components/CoverArt";
import { HeartMark } from "@/components/Logo";
import type { TemplateView } from "@/lib/templates";

// Tilt and height per slot, repeating. Gives the loose "hand of cards" look.
const TILT = [
  { r: -8, y: 18 },
  { r: -3, y: -6 },
  { r: 4, y: 10 },
  { r: -2, y: 24 },
  { r: 7, y: -4 },
  { r: -5, y: 8 },
  { r: 3, y: 26 },
];
const MIN_TILES = 10;

/** Endless strip of tilted template cards. Pauses on hover; a hovered card straightens and lifts. */
export function CardDeck({ templates }: { templates: TemplateView[] }) {
  if (!templates.length) return null;

  // Repeat until one pass is wider than any screen, then render the pass twice for a seamless loop.
  const pass: TemplateView[] = [];
  while (pass.length < MIN_TILES) pass.push(...templates);
  const tiles = [...pass, ...pass];

  return (
    <div className="deck relative -mb-4 overflow-hidden pb-16 pt-10">
      <div className="deck-track flex w-max" style={{ animationDuration: `${pass.length * 4.5}s` }}>
        {tiles.map((t, i) => {
          const { r, y } = TILT[i % TILT.length];
          const copy = i >= pass.length;
          return (
            <div
              key={i}
              className="deck-item px-3 sm:px-4"
              style={{ "--r": `${r}deg`, transform: `translateY(${y}px) rotate(${r}deg)` } as React.CSSProperties}
              aria-hidden={copy || undefined}
            >
              <Link href={`/t/${t.slug}`} tabIndex={copy ? -1 : undefined} className="deck-card block w-40 rounded-[1.6rem] bg-white p-2 sm:w-52">
                <div className={`relative flex aspect-[3/4] flex-col items-center justify-center gap-2 overflow-hidden rounded-[1.2rem] p-4 text-center ${t.cover.bg} ${t.cover.ink}`}>
                  <CoverArt t={t} size="sm" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-plum">
                    Card
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 pb-1.5 pt-2.5">
                  <HeartMark className="h-4 w-4 shrink-0" />
                  <span className="truncate text-sm font-extrabold text-plum">{t.name}</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
