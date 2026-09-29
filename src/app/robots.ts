import type { MetadataRoute } from "next";

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    // Private or per-buyer pages stay out of search results.
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/p/", "/done/", "/api/", "/editor/", "/auth/"] },
    sitemap: `${site}/sitemap.xml`,
  };
}
