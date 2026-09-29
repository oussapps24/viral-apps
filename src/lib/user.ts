import "server-only";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, schema } from "@/db";
import { authConfigured } from "./env";
import { supabaseAuth } from "./supabase";

export type CurrentUser = { id: string; email: string };

/**
 * The signed-in customer, or null. Verified with Supabase on each request
 * (not just read from the cookie), and memoized for the rest of the request.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!authConfigured()) return null;
  const sb = await supabaseAuth();
  const { data } = await sb.auth.getUser();
  const u = data.user;
  return u?.email ? { id: u.id, email: u.email } : null;
});

/** Guard for customer-only pages. Sends signed-out visitors to login and back. */
export async function requireUser(returnTo: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

/** Keep our customers table in step with Supabase Auth. */
export async function upsertCustomer(user: CurrentUser) {
  await db()
    .insert(schema.customers)
    .values({ id: user.id, email: user.email.toLowerCase(), lastSignInAt: new Date() })
    .onConflictDoUpdate({
      target: schema.customers.id,
      set: { email: sql`excluded.email`, lastSignInAt: new Date() },
    });
}

/** Only allow same-site relative redirects after login (no open redirects). */
export function safeNext(next: unknown, fallback = "/account/cards") {
  if (typeof next !== "string" || !next.startsWith("/")) return fallback;
  // Browsers drop tabs/newlines and treat "\" as "/", so "/\t/evil.com" would become "//evil.com".
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return fallback;
  try {
    const u = new URL(next, "http://x");
    return u.origin === "http://x" ? u.pathname + u.search + u.hash : fallback;
  } catch {
    return fallback;
  }
}
