"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { assetUrl } from "@/lib/storage";

const back = (msg: string, kind: "ok" | "error" = "ok") => redirect(`/admin/prompts?${kind}=${encodeURIComponent(msg)}`);
// http(s) only: z.string().url() also accepts javascript: links, which end up as hrefs on /prompts.
const url = z.union([z.literal(""), z.string().trim().pipe(z.url({ protocol: /^https?$/, error: "Links must start with https://" }))]);

const P = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  kind: z.enum(["image", "video"]),
  prompt: z.string().trim().min(1, "Prompt is required").max(4000),
  mediaUrl: url,
  mediaPath: z.string().trim(),
  sourceUrl: url,
  tryUrl: url,
  sort: z.coerce.number().int(),
});

export async function savePrompt(id: string | null, fd: FormData) {
  await requireAdmin();
  const g = (k: string) => String(fd.get(k) ?? "");
  const p = P.safeParse({
    title: g("title"), kind: g("kind") || "image", prompt: g("prompt"), mediaUrl: g("mediaUrl"), mediaPath: g("mediaPath"),
    sourceUrl: g("sourceUrl"), tryUrl: g("tryUrl"), sort: g("sort") || 0,
  });
  if (!p.success) return back(p.error.issues[0].message, "error");
  const v = p.data;
  const values = {
    title: v.title,
    kind: v.kind,
    prompt: v.prompt,
    // An uploaded image wins over a pasted link.
    mediaUrl: (v.mediaPath ? assetUrl(v.mediaPath) : v.mediaUrl) || null,
    sourceUrl: v.sourceUrl || null,
    tryUrl: v.tryUrl || null,
    sort: v.sort,
    published: fd.get("published") === "on",
  };
  if (id) await db().update(schema.prompts).set(values).where(eq(schema.prompts.id, id));
  else await db().insert(schema.prompts).values(values);
  back(`Saved “${v.title}”`);
}

export async function deletePrompt(id: string) {
  await requireAdmin();
  await db().delete(schema.prompts).where(eq(schema.prompts.id, id));
  back("Prompt deleted");
}
