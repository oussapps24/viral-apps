"use server";

import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";

export type ResetLinkState = { link?: string; error?: string };

/**
 * Makes a one-time "set a new password" link for a customer, without sending any email.
 * The admin copies it and sends it to the customer however they got in touch
 * (support email, Instagram DM, WhatsApp...). Uses the service_role key.
 */
export async function createResetLink(_prev: ResetLinkState, form: FormData): Promise<ResetLinkState> {
  await requireAdmin();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Needs SUPABASE_SERVICE_ROLE_KEY. See docs/setup/03-email.md." };
  }

  // A non-uuid would make Postgres throw instead of just finding nothing.
  const id = z.string().uuid().safeParse(form.get("customerId"));
  if (!id.success) return { error: "Customer not found." };

  const [customer] = await db()
    .select({ email: schema.customers.email })
    .from(schema.customers)
    .where(eq(schema.customers.id, id.data))
    .limit(1);
  if (!customer) return { error: "Customer not found." };

  const admin = createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), { auth: { persistSession: false } });
  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email: customer.email });
  if (error || !data.properties?.hashed_token) {
    console.error("generateLink failed", error);
    return { error: "Supabase refused to make a link. Is this account still in Supabase → Authentication → Users?" };
  }

  // Point the link at our own callback (not Supabase's action_link), so the session
  // is set as a cookie on our domain and the customer lands on the new-password page.
  const q = new URLSearchParams({ token_hash: data.properties.hashed_token, type: "recovery", next: "/account/new-password" });
  return { link: `${env.siteUrl()}/auth/callback?${q}` };
}

/** Switches free card creation on or off for one customer. Admin only. */
export async function setFreeAccess(form: FormData) {
  await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("customerId"));
  if (!id.success) return;
  await db()
    .update(schema.customers)
    .set({ freeAccess: form.get("enable") === "1" })
    .where(eq(schema.customers.id, id.data));
  revalidatePath("/admin/customers");
}
