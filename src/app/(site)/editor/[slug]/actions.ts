"use server";

import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db, schema } from "@/db";
import { uploadCardPhoto } from "@/lib/storage";
import { buyerFields, getTemplateBySlug } from "@/lib/templates";
import { getCurrentUser, upsertCustomer } from "@/lib/user";
import { youtubeId } from "@/designs/kit/youtube";
import type { FieldDef } from "@/designs/types";

export type EditorState = { error?: string };

function validatorFor(f: FieldDef): z.ZodType<string> {
  const base = z.string().trim();
  switch (f.type) {
    case "youtube":
      return base.refine((v) => v === "" || youtubeId(v) !== null, `${f.label}: paste a YouTube link`);
    case "date":
      return base.refine((v) => (v === "" && !f.required) || /^\d{4}-\d{2}-\d{2}$/.test(v), `${f.label} is required`);
    case "select":
      return base.refine((v) => v === "" || (f.options ?? []).some((o) => o.value === v), `${f.label}: pick an option`);
    default: {
      const s = base.max(f.maxLength ?? 1000, `${f.label} is too long`);
      return f.required ? s.min(1, `${f.label} is required`) : s;
    }
  }
}

export async function createCard(slug: string, _prev: EditorState, formData: FormData): Promise<EditorState> {
  const template = await getTemplateBySlug(slug);
  if (!template) return { error: "This card is no longer available" };
  // The editor page already requires an account; this catches a session that expired mid-edit.
  // Returning an error (not redirecting) keeps the letter and photos in the form.
  const owner = await getCurrentUser();
  if (!owner) return { error: "You've been logged out. Log in again in a new tab, then tap Preview." };
  const fields = buyerFields(template);

  const textFields = fields.filter((f) => f.type !== "photo");
  const shape = Object.fromEntries(textFields.map((f) => [f.name, validatorFor(f)]));
  const raw = Object.fromEntries(textFields.map((f) => [f.name, formData.get(f.name)?.toString() ?? ""]));
  const parsed = z.object(shape).safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  // Drop empty optional values so the stored JSON stays clean.
  const data = Object.fromEntries(Object.entries(parsed.data as Record<string, string>).filter(([, v]) => v !== ""));

  let cardId: string;
  try {
    const photos: Record<string, string> = {};
    for (const f of fields.filter((f) => f.type === "photo")) {
      const file = formData.get(f.name);
      if (file instanceof File && file.size > 0) photos[f.name] = await uploadCardPhoto(file);
      else if (f.required) return { error: `${f.label} is required` };
    }

    await upsertCustomer(owner);
    const [card] = await db()
      .insert(schema.cards)
      .values({ templateId: template.id, userId: owner.id, shareSlug: nanoid(12), data, photos })
      .returning({ id: schema.cards.id });
    cardId = card.id;
  } catch (e) {
    console.error(e);
    // Only pass through storage's own user-facing messages; anything else may leak DB internals.
    const msg = e instanceof Error ? e.message : "";
    const safe = msg.startsWith("Unsupported file type") || msg.startsWith("File too large");
    return { error: safe ? msg : "Something went wrong. Please try again." };
  }

  redirect(`/p/${cardId}`);
}
