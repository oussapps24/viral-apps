import { and, desc, eq, gt, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/db";
import { getDesign } from "@/designs/registry";
import { shareUrl } from "@/lib/cards";
import { assetUrl } from "@/lib/storage";
import { requireUser } from "@/lib/user";
import AccountNav from "../AccountNav";
import CopyShareLink from "./CopyShareLink";

export const metadata: Metadata = { title: "My cards", robots: { index: false } };

const { cards, templates } = schema;
const day = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Draft window matches the daily cleanup job (drafts older than 7 days are deleted). */
async function loadCards(userId: string) {
  const since = new Date(Date.now() - 7 * 86_400_000);
  const select = { c: cards, name: templates.name, design: templates.design, coverPath: templates.coverPath, coverEmoji: templates.coverEmoji };
  const [bought, drafts] = await Promise.all([
    db().select(select).from(cards).innerJoin(templates, eq(cards.templateId, templates.id))
      .where(and(eq(cards.userId, userId), inArray(cards.status, ["paid", "refunded"])))
      .orderBy(desc(cards.paidAt)),
    db().select(select).from(cards).innerJoin(templates, eq(cards.templateId, templates.id))
      .where(and(eq(cards.userId, userId), eq(cards.status, "draft"), gt(cards.createdAt, since)))
      .orderBy(desc(cards.createdAt)).limit(10),
  ]);
  return { bought, drafts };
}

function Thumb({ design, coverPath, emoji }: { design: string; coverPath: string | null; emoji: string | null }) {
  const cover = assetUrl(coverPath);
  return (
    <span className={`grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-xl text-2xl ${getDesign(design)?.cover.bg ?? "bg-petal"}`}>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="h-full w-full object-cover" />
      ) : (
        emoji ?? "💌"
      )}
    </span>
  );
}

export default async function MyCardsPage() {
  const user = await requireUser("/account/cards");
  const { bought, drafts } = await loadCards(user.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 font-display text-4xl font-black">My cards</h1>
      <AccountNav active="cards" email={user.email} />

      {bought.length === 0 ? (
        <div className="rounded-[1.5rem] bg-white p-8 text-center ring-1 ring-petal">
          <p className="text-4xl">💌</p>
          <p className="mt-3 font-extrabold">No cards yet</p>
          <p className="mt-1 text-sm text-plum-soft">Cards you unlock show up here, with their share links.</p>
          <Link href="/cards" className="btn btn-primary mt-5">Make a card</Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {bought.map(({ c, name, design, coverPath, coverEmoji }) => {
            const live = c.status === "paid";
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-4 rounded-[1.5rem] bg-white p-4 ring-1 ring-petal">
                <Thumb design={design} coverPath={coverPath} emoji={coverEmoji} />
                <div className="min-w-0 flex-1 basis-40">
                  <p className="font-extrabold">{name}</p>
                  <p className="text-sm text-plum-soft">
                    for {c.data.toName ?? "someone special"} · {c.paidAt ? day(c.paidAt) : ""}
                  </p>
                  {live ? (
                    <p className="mt-1 truncate font-mono text-xs text-plum-soft">{shareUrl(c)}</p>
                  ) : (
                    <p className="mt-1 text-xs font-bold text-red-600">Refunded. This link no longer works.</p>
                  )}
                </div>
                {live && (
                  <div className="flex w-full gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
                    <a href={`/c/${c.shareSlug}`} target="_blank" rel="noopener" className="btn btn-ghost px-4 py-2 text-sm">Open</a>
                    <CopyShareLink url={shareUrl(c)} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {drafts.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-1 font-display text-xl font-black">Not unlocked yet</h2>
          <p className="mb-4 text-sm text-plum-soft">Drafts are kept for 7 days.</p>
          <ul className="flex flex-col gap-3">
            {drafts.map(({ c, name, design, coverPath, coverEmoji }) => (
              <li key={c.id} className="flex items-center gap-4 rounded-[1.5rem] bg-white/60 p-4 ring-1 ring-petal">
                <Thumb design={design} coverPath={coverPath} emoji={coverEmoji} />
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold">{name}</p>
                  <p className="text-sm text-plum-soft">for {c.data.toName ?? "someone special"} · started {day(c.createdAt)}</p>
                </div>
                <Link href={`/p/${c.id}`} className="btn btn-ghost px-4 py-2 text-sm">Continue</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
