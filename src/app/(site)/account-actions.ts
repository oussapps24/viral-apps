"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { env } from "@/lib/env";
import { supabaseAuth } from "@/lib/supabase";
import { getCurrentUser, safeNext, upsertCustomer } from "@/lib/user";

export type FormState = { error?: string; ok?: string };

const Email = z.string().trim().toLowerCase().email("Enter a valid email");
const Password = z.string().min(8, "Password must be at least 8 characters").max(72, "Password is too long");

/** Sign up. With "Confirm email" off in Supabase, they're signed in straight away. */
export async function signUp(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = Email.safeParse(fd.get("email"));
  const password = Password.safeParse(fd.get("password"));
  if (!email.success) return { error: email.error.issues[0].message };
  if (!password.success) return { error: password.error.issues[0].message };
  const next = safeNext(fd.get("next"));

  const sb = await supabaseAuth();
  const { data, error } = await sb.auth.signUp({
    email: email.data,
    password: password.data,
    options: { emailRedirectTo: `${env.siteUrl()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) {
    return { error: /already registered|already exists/i.test(error.message) ? "There's already an account with this email. Log in instead." : error.message };
  }
  // Supabase returns a user with no identities when the email is already taken (and confirmations are on).
  if (data.user && data.user.identities?.length === 0) {
    return { error: "There's already an account with this email. Log in instead." };
  }
  if (data.user?.email) await upsertCustomer({ id: data.user.id, email: data.user.email });

  // If the client later turns "Confirm email" on, there's no session until they click the email link.
  if (!data.session) return { ok: `Check ${email.data} for a link to confirm your account. It brings you right back here.` };
  // Setting the session cookie makes Next re-render the signup page, which
  // then forwards the now signed-in user to `next` (see signup/page.tsx).
  return {};
}

export async function logIn(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = Email.safeParse(fd.get("email"));
  const password = String(fd.get("password") ?? "");
  if (!email.success || !password) return { error: "Enter your email and password" };
  const sb = await supabaseAuth();
  const { data, error } = await sb.auth.signInWithPassword({ email: email.data, password });
  if (error || !data.user?.email) {
    return { error: /not confirmed/i.test(error?.message ?? "") ? "Confirm your email first. Check your inbox for the link." : "Wrong email or password" };
  }
  await upsertCustomer({ id: data.user.id, email: data.user.email });
  // The login page re-renders signed in and forwards to `next` (see login/page.tsx).
  return {};
}

export async function logOut() {
  const sb = await supabaseAuth();
  await sb.auth.signOut();
  redirect("/");
}

/** Always answers the same way, so this can't be used to find out who has an account. */
export async function requestPasswordReset(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = Email.safeParse(fd.get("email"));
  if (!email.success) return { error: email.error.issues[0].message };
  const sb = await supabaseAuth();
  await sb.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${env.siteUrl()}/auth/callback?next=${encodeURIComponent("/account/new-password")}`,
  });
  return { ok: `If there's an account for ${email.data}, a reset link is on its way. It works once and expires after an hour.` };
}

/** Set a new password after following the reset link (the link signs them in). */
export async function setNewPassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "That reset link has expired. Request a new one." };
  const password = Password.safeParse(fd.get("password"));
  if (!password.success) return { error: password.error.issues[0].message };
  const sb = await supabaseAuth();
  const { error } = await sb.auth.updateUser({ password: password.data });
  if (error) return { error: error.message };
  redirect("/account?password=changed");
}

/** Change password from the account page. Asks for the current one first. */
export async function changePassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const current = String(fd.get("current") ?? "");
  const password = Password.safeParse(fd.get("password"));
  if (!password.success) return { error: password.error.issues[0].message };

  const sb = await supabaseAuth();
  const check = await sb.auth.signInWithPassword({ email: user.email, password: current });
  if (check.error) return { error: "Your current password is wrong" };
  const { error } = await sb.auth.updateUser({ password: password.data });
  if (error) return { error: error.message };
  return { ok: "Password changed" };
}
