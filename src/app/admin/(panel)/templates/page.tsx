import { asc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge, money, PageHeader } from "@/components/admin/ui";
import { db, schema } from "@/db";
import { getDesign } from "@/designs/registry";
import { requireAdmin } from "@/lib/auth";
import { assetUrl } from "@/lib/storage";
import { togglePublished } from "./actions";

export const metadata: Metadata = { title: "Templates" };

const { templates, categories, cards } = schema;

export default async function TemplatesPage({ searchParams }: PageProps<"/admin/templates">) {
  await requireAdmin();
  const { saved, deleted } = await searchParams;

  const rows = await db()
    .select({
      t: templates,
      category: categories.label,
      emoji: categories.emoji,
      sold: sql<number>`(select count(*)::int from ${cards} where ${cards.templateId} = ${templates.id} and ${cards.status} = 'paid')`,
    })
    .from(templates)
    .innerJoin(categories, eq(templates.categoryId, categories.id))
    .orderBy(asc(categories.sort), asc(templates.sort), asc(templates.name));

  return (
    <>
      <PageHeader
        title="Templates"
        sub="Cards for sale. Each one uses a design, sits in a category, and has its own price, cover, music and demo."
        action={<Link href="/admin/templates/new" className="btn btn-primary">+ New template</Link>}
      />
      {(saved || deleted) && (
        <p className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          {saved ? `Saved “${saved}”.` : `Deleted “${deleted}”.`}
        </p>
      )}

      <div className="overflow-x-auto rounded-[1.5rem] bg-white shadow-sm ring-1 ring-petal">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-petal text-xs uppercase tracking-wider text-plum-soft">
            <tr>
              <th className="px-5 py-3">Template</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Design</th>
              <th className="px-3 py-3 text-right">Price</th>
              <th className="px-3 py-3 text-right">Sold</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-5 py-3 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-petal">
            {rows.map(({ t, category, emoji, sold }) => {
              const design = getDesign(t.design);
              const cover = assetUrl(t.coverPath);
              return (
                <tr key={t.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-12 w-9 shrink-0 place-items-center overflow-hidden rounded-lg text-lg ${design?.cover.bg ?? "bg-petal"}`}>
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover} alt="" className="h-full w-full object-cover" />
                        ) : (
                          t.coverEmoji ?? "💌"
                        )}
                      </span>
                      <div>
                        <Link href={`/admin/templates/${t.id}`} className="font-extrabold hover:text-rose">{t.name}</Link>
                        <p className="text-xs text-plum-soft">/t/{t.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">{emoji} {category}</td>
                  <td className="px-3 py-3 text-plum-soft">{design?.label ?? <span className="text-red-600">missing: {t.design}</span>}</td>
                  <td className="px-3 py-3 text-right font-extrabold tabular-nums">{money(t.priceCents)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{sold}</td>
                  <td className="px-3 py-3">
                    <form action={togglePublished.bind(null, t.id)}>
                      <button title="Click to toggle">
                        <Badge status={t.published ? "live" : "hidden"}>{t.published ? "Live" : "Hidden"}</Badge>
                      </button>
                    </form>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-xs font-extrabold">
                    <Link href={`/t/${t.slug}?preview=1`} target="_blank" className="mr-3 text-plum-soft hover:text-plum">Preview ↗</Link>
                    <Link href={`/admin/templates/${t.id}`} className="text-rose">Edit</Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-plum-soft">
                  No templates yet. Run <code>npm run db:seed</code> for the starter set, or create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
