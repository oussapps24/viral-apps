import "server-only";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { TRACK_IDS, TRACK_LABELS } from "@/designs/kit/synth";
import { DESIGNS } from "@/designs/registry";
import type { DesignOption } from "./TemplateForm";

/** Plain data the template form needs (no React components cross to the client). */
export async function formOptions() {
  const categories = await db()
    .select({ id: schema.categories.id, label: schema.categories.label, emoji: schema.categories.emoji })
    .from(schema.categories)
    .orderBy(asc(schema.categories.sort), asc(schema.categories.label));
  const designs: DesignOption[] = DESIGNS.map((d) => ({ key: d.key, label: d.label, description: d.description, fields: d.fields }));
  const tracks = TRACK_IDS.map((id) => ({ value: id, label: TRACK_LABELS[id] }));
  return { categories, designs, tracks };
}
