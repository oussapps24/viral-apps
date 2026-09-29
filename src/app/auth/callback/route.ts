import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { supabaseAuth } from "@/lib/supabase";
import { safeNext, upsertCustomer } from "@/lib/user";

/**
 * Where Supabase's email links land: password reset, and account confirmation
 * if "Confirm email" is ever turned on. Signs the person in, then sends them on.
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const next = safeNext(p.get("next"));
  const code = p.get("code");
  const tokenHash = p.get("token_hash");
  const type = p.get("type") as EmailOtpType | null;

  const sb = await supabaseAuth();
  const { data, error } = code
    ? await sb.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await sb.auth.verifyOtp({ token_hash: tokenHash, type })
      : { data: { user: null }, error: new Error("missing code") };

  if (error || !data.user?.email) redirect("/login?error=link");
  await upsertCustomer({ id: data.user.id, email: data.user.email });
  redirect(next);
}
