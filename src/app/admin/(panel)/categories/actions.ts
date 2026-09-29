"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

const { categories, templates } = schema;
const back = (msg: string, kind: "ok" | "error" = "ok") => redirect(`/admin/categories?${kind}=${encodeURIComponent(msg)}`);

const Cat = z.object({
  label: z.string().trim().min(1, "Name is required").max(40),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]*$/, "Slug: lowercase letters, numbers, dashes").max(40),
  emoji: z.string().trim().max(8),
  sort: z.coerce.number().int(),
});

export async function saveCategory(id: string | null, fd: FormData) {
  await requireAdmin();
  const p = Cat.safeParse({ label: fd.get("label"), slug: fd.get("slug") ?? "", emoji: fd.get("emoji") ?? "", sort: fd.get("sort") || 0 });
  if (!p.success) return back(p.error.issues[0].message, "error");
  const slug = p.data.slug || p.data.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const clash = await db()
    .select({ id: categories.id })
    .from(categories)
    .where(id ? and(eq(categories.slug, slug), ne(categories.id, id)) : eq(categories.slug, slug))
    .limit(1);
  if (clash.length) return back(`Slug “${slug}” is already used`, "error");

  const values = { label: p.data.label, slug, emoji: p.data.emoji || "💌", sort: p.data.sort };
  if (id) await db().update(categories).set(values).where(eq(categories.id, id));
  else await db().insert(categories).values(values);
  back(`Saved “${p.data.label}”`);
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const [{ n }] = await db().select({ n: sql<number>`count(*)::int` }).from(templates).where(eq(templates.categoryId, id));
  if (n > 0) return back(`That category still has ${n} template(s). Move them first.`, "error");
  await db().delete(categories).where(eq(categories.id, id));
  back("Category deleted");
}
