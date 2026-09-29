import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Keeps customer login sessions fresh. Supabase access tokens are short-lived;
 * this refreshes them before the page renders and writes the new cookies back.
 * Skipped entirely for visitors who aren't signed in (no Supabase cookie).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (!url || !key || !hasSession) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list, headers) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
        for (const [k, v] of Object.entries(headers ?? {})) response.headers.set(k, v);
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Everything except static files, images, webhooks, cron, uploads and the admin (own login).
  matcher: ["/((?!_next/static|_next/image|favicon|icon|apple-icon|logo.png|demo/|api/webhooks|api/cron|api/files|admin).*)"],
};
