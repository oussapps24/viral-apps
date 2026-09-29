/**
 * Loads the starter catalog (categories, the 8 templates, sample prompts).
 * Safe to run more than once: existing rows (matched by slug) are left alone,
 * so it never overwrites edits made in the admin panel.
 */
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, prompts, templates } from "../src/db/schema";
import { STARTER_CATEGORIES, STARTER_TEMPLATES } from "../src/designs/starter";

config({ path: [".env.local", ".env"], quiet: true });

const client = postgres(process.env.DIRECT_URL ?? process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

async function main() {
  await db.insert(categories).values(STARTER_CATEGORIES).onConflictDoNothing({ target: categories.slug });
  const cats = await db.select().from(categories);
  const catId = (slug: string) => cats.find((c) => c.slug === slug)!.id;

  const rows = STARTER_TEMPLATES.map((t, i) => ({
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    categoryId: catId(t.category),
    design: t.design,
    priceCents: 199,
    published: true,
    sort: i,
    coverTitle: t.coverTitle,
    coverSubtitle: t.coverSubtitle ?? null,
    coverEmoji: t.coverEmoji,
    music: t.music,
    demoData: t.demoData,
    demoPhotos: t.demoPhotos,
  }));
  const inserted = await db.insert(templates).values(rows).onConflictDoNothing({ target: templates.slug }).returning({ slug: templates.slug });

  const hasPrompts = (await db.select({ id: prompts.id }).from(prompts).where(eq(prompts.published, true)).limit(1)).length > 0;
  if (!hasPrompts) {
    await db.insert(prompts).values([
      { title: "Golden hour portrait", kind: "image", prompt: "Soft golden hour portrait of a couple on a rooftop, warm film grain, shallow depth of field, 35mm", sort: 1 },
      { title: "Paper hearts drift", kind: "video", prompt: "Slow motion paper hearts drifting through a sunlit room, dust particles, pastel pink palette, 5 seconds", sort: 2 },
    ]);
  }

  console.log(`Seeded: ${STARTER_CATEGORIES.length} categories, ${inserted.length} new templates${hasPrompts ? "" : ", 2 prompts"}`);
}

main().finally(() => client.end());
