import Link from "next/link";
import { CoverArt } from "@/components/CoverArt";
import type { TemplateView } from "@/lib/templates";

/** Gallery tile. No price here: it's shown once, on the unlock step. */
export function CardThumb({ t, href }: { t: TemplateView; href?: string }) {
  const { cover } = t;
  return (
    <Link href={href ?? `/t/${t.slug}`} className="group block">
      <div
        className={`relative flex aspect-[3/4] flex-col items-center justify-center gap-2 overflow-hidden rounded-[1.75rem] p-5 text-center shadow-[0_14px_34px_-14px_rgba(59,21,48,.38),0_2px_6px_-2px_rgba(59,21,48,.12)] ring-1 ring-black/5 transition duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:-translate-y-2 group-hover:rotate-[-1.5deg] group-hover:scale-[1.03] group-hover:shadow-[0_28px_50px_-18px_rgba(224,82,122,.45),0_6px_14px_-6px_rgba(59,21,48,.2)] ${cover.bg} ${cover.ink}`}
      >
        <CoverArt t={t} />
      </div>
      <div className="mt-3 px-1">
        <p className="font-extrabold group-hover:text-rose">{t.name}</p>
        <p className="text-sm text-plum-soft">{t.tagline}</p>
      </div>
    </Link>
  );
}
