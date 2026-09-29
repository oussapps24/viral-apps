"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { endSession, startSession, verifyPassword } from "@/lib/auth";

// Hashed when the email is unknown, so both paths cost one scrypt and timing doesn't reveal admin emails.
const DUMMY_HASH =
  "scrypt$vSq1GEzE+9LUfb38v10ASw==$bBfHtlirtQSCWzOt63tFOEVfh4eSi3qA4XxTTAOuAwLcmc8qS5HmUceCzrLkRFWH8QkFhsYLBZjHFcn1go/EXA==";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const admin = email ? await db().query.admins.findFirst({ where: eq(schema.admins.email, email) }) : undefined;
  const ok = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) {
    // Small delay makes password guessing slow without a rate limiter.
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Wrong email or password" };
  }

  await startSession(admin.id);
  await db().update(schema.admins).set({ lastLoginAt: new Date() }).where(eq(schema.admins.id, admin.id));
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
