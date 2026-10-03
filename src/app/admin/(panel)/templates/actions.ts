"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { TRACK_IDS } from "@/designs/kit/synth";
import { getDesign } from "@/designs/registry";
import { requireAdmin } from "@/lib/auth";
import { deleteAssets } from "@/lib/storage";

const { templates, cards, categories } = schema;

export type FormState = { error?: string };

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60);

const Base = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  slug: z.string().trim().max(60),
  tagline: z.string().trim().max(140),
  categoryId: z.string().uuid("Pick a category"),
  design: z.string().refine((d) => !!getDesign(d), "Pick a design"),
  price: z.coerce.number().min(0.5, "Stripe's minimum is $0.50").max(999),
  sort: z.coerce.number().int().min(-9999).max(9999),
  published: z.boolean(),
  coverPath: z.string().trim(),
  coverTitle: z.string().trim().max(60),
  coverSubtitle: z.string().trim().max(60),
  music: z.string().refine((m) => m === "none" || m === "upload" || TRACK_IDS.includes(m as never), "Pick music"),
  musicPath: z.string().trim(),
});

const nullIfEmpty = (s: string) => (s === "" ? null : s);
const isStored = (p: string | null | undefined): p is string => !!p && !p.startsWith("/") && !p.startsWith("http");

/** Create (id = null) or update a template. */
export async function saveTemplate(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const get = (k: string) => String(fd.get(k) ?? "");
  const parsed = Base.safeParse({
    name: get("name"),
    slug: get("slug"),
    tagline: get("tagline"),
    categoryId: get("categoryId"),
    design: get("design"),
    price: get("price"),
    sort: get("sort") || "0",
    published: fd.get("published") === "on",
    coverPath: get("coverPath"),
    coverTitle: get("coverTitle"),
    coverSubtitle: get("coverSubtitle"),
    music: get("music"),
    musicPath: get("musicPath"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const v = parsed.data;

  const slug = slugify(v.slug || v.name);
  if (!slug) return { error: "Slug can only use letters, numbers and dashes" };
  if (v.music === "upload" && !v.musicPath) return { error: "Upload a music file, or pick a built-in track" };

  // Demo content: only the fields the chosen design actually has.
  const design = getDesign(v.design)!;
  const demoData: Record<string, string> = {};
  const demoPhotos: Record<string, string> = {};
  for (const f of design.fields) {
    if (f.name === "music") continue;
    if (f.type === "photo") {
      const p = get(`demoPhoto.${f.name}`).trim();
      if (p) demoPhotos[f.name] = p;
    } else {
      const val = get(`demo.${f.name}`).trim();
      if (val) demoData[f.name] = val.slice(0, f.maxLength ?? 2000);
    }
  }

  const clash = await db()
    .select({ id: templates.id })
    .from(templates)
    .where(id ? and(eq(templates.slug, slug), ne(templates.id, id)) : eq(templates.slug, slug))
    .limit(1);
  if (clash.length) return { error: `Another template already uses the slug “${slug}”` };

  const cat = await db().select({ id: categories.id }).from(categories).where(eq(categories.id, v.categoryId)).limit(1);
  if (!cat.length) return { error: "That category no longer exists" };

  const values = {
    slug,
    name: v.name,
    tagline: v.tagline,
    categoryId: v.categoryId,
    design: v.design,
    priceCents: Math.round(v.price * 100),
    sort: v.sort,
    published: v.published,
    coverPath: nullIfEmpty(v.coverPath),
    coverTitle: nullIfEmpty(v.coverTitle),
    coverSubtitle: nullIfEmpty(v.coverSubtitle),
    music: v.music,
    musicPath: v.music === "upload" ? nullIfEmpty(v.musicPath) : null,
    demoData,
    demoPhotos,
    updatedAt: new Date(),
  };

  if (id) {
    const [old] = await db().select().from(templates).where(eq(templates.id, id)).limit(1);
    if (!old) return { error: "Template not found" };
    await db().update(templates).set(values).where(eq(templates.id, id));
    // Clean up files that were replaced or removed.
    const kept = new Set([values.coverPath, values.musicPath, ...Object.values(demoPhotos)]);
    const dropped = [old.coverPath, old.musicPath, ...Object.values(old.demoPhotos)].filter(isStored).filter((p) => !kept.has(p));
    await deleteAssets(dropped).catch((e) => console.error("asset cleanup failed", e));
  } else {
    await db().insert(templates).values(values);
  }

  redirect(`/admin/templates?saved=${encodeURIComponent(v.name)}`);
}

export async function togglePublished(id: string) {
  await requireAdmin();
  await db().update(templates).set({ published: sql`not ${templates.published}`, updatedAt: new Date() }).where(eq(templates.id, id));
  redirect("/admin/templates");
}

/** Only templates nobody has bought can be deleted. Sold ones should be hidden instead. */
export async function deleteTemplate(id: string) {
  await requireAdmin();
  const [{ n }] = await db().select({ n: sql<number>`count(*)::int` }).from(cards).where(eq(cards.templateId, id));
  if (n > 0) {
    redirect(`/admin/templates/${id}?error=${encodeURIComponent(`This template has ${n} customer card(s), so it can't be deleted. Untick “Published” to hide it instead.`)}`);
  }
  const [old] = await db().delete(templates).where(eq(templates.id, id)).returning();
  if (old) {
    await deleteAssets([old.coverPath, old.musicPath, ...Object.values(old.demoPhotos)].filter(isStored)).catch(() => {});
  }
  redirect(`/admin/templates?deleted=${encodeURIComponent(old?.name ?? "template")}`);
}
