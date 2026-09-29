import Link from "next/link";
import { CardThumb } from "@/components/CardThumb";
import { HeartMark } from "@/components/Logo";
import { CardDeck } from "@/components/fx/CardDeck";
import { FloatingHearts } from "@/components/fx/FloatingHearts";
import { listCategories, listPublishedTemplates } from "@/lib/templates";

// Reads the catalog from the database on every request, so admin edits show up immediately.
export const dynamic = "force-dynamic";

const STEPS = [
  { n: "1", title: "Pick a card", body: "Try any card for free before you decide." },
  { n: "2", title: "Make it yours", body: "Add their name, your words, photos and a song." },
  { n: "3", title: "Send the link", body: "Unlock it once, then share it anywhere." },
];

export default async function Home() {
  const [all, categories] = await Promise.all([listPublishedTemplates(), listCategories()]);
  const featured = all.slice(0, 4);
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-petal blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-lilac blur-3xl" />
        <FloatingHearts />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-4 pt-16 text-center sm:pt-24">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-extrabold text-rose shadow-sm">
            <HeartMark className="h-4 w-4" /> cards with music, photos and surprises
          </span>
          <h1 className="font-display text-5xl font-black leading-[1.02] tracking-tight sm:text-7xl">
            Little cards for <em className="text-rose">big feelings</em>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-plum-soft">
            Interactive cards with music, photos and a surprise at the end. Make one in two minutes and send it as a link.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/cards" className="btn btn-primary px-7 py-3.5 text-lg">Browse cards</Link>
            {featured[0] && (
              <Link href={`/t/${featured[0].slug}`} className="btn btn-ghost px-7 py-3.5 text-lg">Try “{featured[0].name}”</Link>
            )}
          </div>
        </div>
        <CardDeck templates={all} />
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl font-black">Cards ready to send</h2>
          <Link href="/cards" className="text-sm font-extrabold text-rose">See all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {featured.map((t) => (
            <CardThumb key={t.slug} t={t} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((c) => (
            <Link key={c.id} href={`/cards?category=${c.slug}`} className="btn btn-ghost py-2.5 text-sm">
              <span>{c.emoji}</span> {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto mt-24 max-w-5xl px-4">
        <h2 className="text-center font-display text-3xl font-black">How it works</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-petal transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(59,21,48,.3)]">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-petal font-display text-lg font-black text-rose">{s.n}</span>
              <h3 className="mt-4 text-lg font-extrabold">{s.title}</h3>
              <p className="mt-1 text-plum-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prompt gallery teaser */}
      <section className="mx-auto mt-24 max-w-5xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-lilac p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="font-display text-3xl font-black">Prompt gallery</h2>
            <p className="mt-2 max-w-md text-plum-soft">Image and video prompts to remix. Copy any of them for free.</p>
          </div>
          <Link href="/prompts" className="btn btn-ghost">Explore prompts →</Link>
        </div>
      </section>
    </main>
  );
}
