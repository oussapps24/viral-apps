import { asc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { PageHeader, Panel } from "@/components/admin/ui";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { deleteCategory, saveCategory } from "./actions";

export const metadata: Metadata = { title: "Categories" };

const { categories, templates } = schema;

export default async function CategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const rows = await db()
    .select({ c: categories, n: sql<number>`count(${templates.id})::int` })
    .from(categories)
    .leftJoin(templates, eq(templates.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sort), asc(categories.label));

  const input = "field py-2";

  return (
    <>
      <PageHeader title="Categories" sub="The filter chips on the site (Love, Birthday…). Lower sort numbers show first." />
      {typeof ok === "string" && <p className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{ok}</p>}
      {typeof error === "string" && <p className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

      <Panel title="Add a category" className="mb-6">
        <form action={saveCategory.bind(null, null)} className="grid gap-3 sm:grid-cols-[70px_1fr_1fr_90px_auto]">
          <input name="emoji" placeholder="🎓" maxLength={8} className={`${input} text-center text-lg`} />
          <input name="label" placeholder="Graduation" required maxLength={40} className={input} />
          <input name="slug" placeholder="slug (optional)" maxLength={40} className={input} />
          <input name="sort" type="number" placeholder="Sort" defaultValue={rows.length + 1} className={input} />
          <button className="btn btn-primary py-2">Add</button>
        </form>
      </Panel>

      <div className="flex flex-col gap-3">
        {rows.map(({ c, n }) => (
          <div key={c.id} className="rounded-[1.25rem] bg-white p-4 shadow-sm ring-1 ring-petal">
            <form action={saveCategory.bind(null, c.id)} className="grid items-center gap-3 sm:grid-cols-[70px_1fr_1fr_90px_auto_auto]">
              <input name="emoji" defaultValue={c.emoji} maxLength={8} className={`${input} text-center text-lg`} />
              <input name="label" defaultValue={c.label} required maxLength={40} className={input} />
              <input name="slug" defaultValue={c.slug} maxLength={40} className={input} />
              <input name="sort" type="number" defaultValue={c.sort} className={input} />
              <span className="text-xs font-bold text-plum-soft">{n} template{n === 1 ? "" : "s"}</span>
              <button className="btn btn-ghost py-2 text-sm">Save</button>
            </form>
            {n === 0 && (
              <form action={deleteCategory.bind(null, c.id)} className="mt-2 text-right">
                <button className="text-xs font-bold text-red-600">Delete</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
