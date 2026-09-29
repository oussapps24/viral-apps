import type { MetadataRoute } from "next";
import { listPublishedTemplates } from "@/lib/templates";

// Rendered per request: templates change in the admin, and `next build` has no database.
export const dynamic = "force-dynamic";

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = ["/", "/cards", "/prompts", "/terms", "/privacy", "/refunds"].map((p) => ({
    url: `${site}${p === "/" ? "" : p}`,
  }));
  try {
    const templates = await listPublishedTemplates();
    return [...pages, ...templates.map((t) => ({ url: `${site}/t/${t.slug}` }))];
  } catch (e) {
    // No database (or it's down): the static pages are still a valid sitemap.
    console.error("sitemap: could not list templates", e);
    return pages;
  }
}
