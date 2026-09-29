import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "./env";

/**
 * Supabase client for customer auth, bound to this request's cookies.
 * Only used on the server (server components, actions, route handlers);
 * the browser never talks to Supabase directly.
 */
export async function supabaseAuth() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Server components can't set cookies. The proxy refreshes the session instead.
        }
      },
    },
  });
}
