import type { Instrumentation } from "next";

// Not "@/lib/env": it imports "server-only", and this file runs outside the React server graph.
const REQUIRED = [
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "ADMIN_SESSION_SECRET",
  "CRON_SECRET",
  "NEXT_PUBLIC_SITE_URL",
];

/** Boot-time config check. Logs instead of throwing, so one bad var doesn't take the whole site down. */
export function register() {
  if (process.env.NODE_ENV !== "production" || process.env.NEXT_RUNTIME !== "nodejs") return;

  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length) console.error(`[config] Missing env vars: ${missing.join(", ")}. See .env.example`);

  for (const name of ["ALLOW_LOCAL_STORAGE", "STRIPE_API_BASE"]) {
    if (process.env[name]) console.warn(`[config] ${name} is set in production. It's for local development only.`);
  }
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length < 32) console.warn("[config] ADMIN_SESSION_SECRET is shorter than 32 characters.");
}

// One JSON line per server error, so Vercel logs can be searched for "level":"error".
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  const message = err instanceof Error ? err.message : String(err);
  const digest = typeof err === "object" && err !== null && "digest" in err ? String(err.digest) : undefined;
  console.error(
    JSON.stringify({
      level: "error",
      message,
      digest,
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
    }),
  );
};
