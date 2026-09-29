import type { Metadata } from "next";
import Link from "next/link";
import { CardThumb } from "@/components/CardThumb";
import { listCategories, listPublishedTemplates } from "@/lib/templates";

export const metadata: Metadata = { title: "All cards" };

export default async function CardsPage({ searchParams }: PageProps<"/cards">) {
  const { category } = await searchParams;
  const categories = await listCategories();
  const active = categories.find((c) => c.slug === category)?.slug;
  const list = await listPublishedTemplates(active);

  const chip = (on: boolean) =>
    `rounded-full px-4 py-2 text-sm font-extrabold transition ${on ? "bg-plum text-white" : "bg-white text-plum-soft shadow-sm hover:text-plum"}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-black">Pick a card</h1>
      <p className="mt-2 text-plum-soft">Tap any card to try it for free.</p>

      <nav className="mt-8 flex flex-wrap gap-2">
        <Link href="/cards" className={chip(!active)}>All</Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/cards?category=${c.slug}`} className={chip(active === c.slug)}>
            {c.emoji} {c.label}
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-white p-6 text-plum-soft ring-1 ring-petal">No cards here yet. Check back soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {list.map((t) => (
            <CardThumb key={t.id} t={t} />
          ))}
        </div>
      )}
    </main>
  );
}
