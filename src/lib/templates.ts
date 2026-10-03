import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { TRACK_IDS, TRACK_LABELS, type TrackId } from "@/designs/kit/synth";
import { getDesign } from "@/designs/registry";
import type { CoverFont, FieldDef, MusicSpec } from "@/designs/types";
import { assetUrl } from "./storage";

const { templates, categories } = schema;

/** Everything a page needs to show or sell a template. */
export type TemplateView = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  priceCents: number;
  published: boolean;
  designKey: string;
  category: { id: string; slug: string; label: string; emoji: string };
  coverUrl?: string;
  /** `art`: animated sticker or first-screen photo drawn on the CSS cover. */
  cover: { title: string; subtitle?: string; art?: string; bg: string; ink: string; font: CoverFont };
  /** Photo slots filled in when the buyer leaves them empty (question sticker etc.). */
  defaultPhotos: Record<string, string>;
  music: MusicSpec;
  musicLabel: string;
  demo: { data: Record<string, string>; photos: Record<string, string> };
};

type Row = { t: schema.Template; c: schema.Category };

function musicOf(t: schema.Template): { spec: MusicSpec; label: string } {
  if (t.music === "upload" && t.musicPath) return { spec: { kind: "url", url: assetUrl(t.musicPath)! }, label: "the card's song" };
  if (TRACK_IDS.includes(t.music as TrackId)) return { spec: { kind: "builtin", track: t.music as TrackId }, label: TRACK_LABELS[t.music as TrackId] };
  return { spec: null, label: "no music" };
}

/** Memory photos are personal, so only the card's own photo slots get defaults. */
const isHeroPhoto = (f: FieldDef) => f.type === "photo" && !f.section?.startsWith("Gifts");

function toView({ t, c }: Row): TemplateView {
  const design = getDesign(t.design);
  const m = musicOf(t);
  const demoPhotos: Record<string, string> = Object.fromEntries(
    Object.entries(t.demoPhotos).map(([k, v]) => [k, assetUrl(v)!]).filter(([, v]) => v),
  );
  const defaultPhotos: Record<string, string> = { ...design?.photoDefaults };
  for (const f of design?.fields.filter(isHeroPhoto) ?? []) if (demoPhotos[f.name]) defaultPhotos[f.name] = demoPhotos[f.name];
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    priceCents: t.priceCents,
    published: t.published,
    designKey: t.design,
    category: { id: c.id, slug: c.slug, label: c.label, emoji: c.emoji },
    coverUrl: assetUrl(t.coverPath),
    cover: {
      title: t.coverTitle || t.name,
      subtitle: t.coverSubtitle ?? undefined,
      art: demoPhotos.photo ?? design?.sticker,
      bg: design?.cover.bg ?? "bg-petal",
      ink: design?.cover.ink ?? "text-plum",
      font: design?.cover.font ?? "display",
    },
    music: m.spec,
    musicLabel: m.label,
    defaultPhotos,
    demo: { data: t.demoData, photos: { ...defaultPhotos, ...demoPhotos } },
  };
}

const base = () =>
  db().select({ t: templates, c: categories }).from(templates).innerJoin(categories, eq(templates.categoryId, categories.id));

export async function listCategories() {
  return db().select().from(categories).orderBy(asc(categories.sort), asc(categories.label));
}

export async function listPublishedTemplates(categorySlug?: string) {
  const rows = await base()
    .where(categorySlug ? and(eq(templates.published, true), eq(categories.slug, categorySlug)) : eq(templates.published, true))
    .orderBy(asc(categories.sort), asc(templates.sort), asc(templates.name));
  return rows.map(toView);
}

/** Public lookups only see published templates, unless `includeUnpublished`. */
export async function getTemplateBySlug(slug: string, opts: { includeUnpublished?: boolean } = {}) {
  const [row] = await base().where(eq(templates.slug, slug)).limit(1);
  if (!row || (!row.t.published && !opts.includeUnpublished)) return undefined;
  return toView(row);
}

/** Cards keep working even if their template is later unpublished. */
export async function getTemplateById(id: string) {
  const [row] = await base().where(eq(templates.id, id)).limit(1);
  return row ? toView(row) : undefined;
}

/** The design's buyer fields, with the music dropdown filled in for this template. */
export function buyerFields(t: TemplateView): FieldDef[] {
  const design = getDesign(t.designKey);
  if (!design) return [];
  return design.fields.map((f) =>
    f.name !== "music"
      ? f
      : {
          ...f,
          defaultValue: "template",
          options: [
            { value: "template", label: `Default (${t.musicLabel})` },
            ...TRACK_IDS.map((id) => ({ value: id, label: TRACK_LABELS[id] })),
            { value: "none", label: "No music" },
          ],
        },
  );
}
