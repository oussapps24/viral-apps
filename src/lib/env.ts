import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name}. See .env.example`);
  return value;
}

// Getters, so a missing var fails at the call site instead of at build time.
export const env = {
  databaseUrl: () => required("DATABASE_URL"),
  supabaseUrl: () => required("SUPABASE_URL"),
  /** Anon / publishable key. Used for customer login only (server side). */
  supabaseAnonKey: () => required("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => required("SUPABASE_SERVICE_ROLE_KEY"),
  photosBucket: () => process.env.SUPABASE_PHOTOS_BUCKET ?? "card-photos",
  assetsBucket: () => process.env.SUPABASE_ASSETS_BUCKET ?? "site-assets",
  stripeSecretKey: () => required("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: () => required("STRIPE_WEBHOOK_SECRET"),
  adminSessionSecret: () => {
    const s = required("ADMIN_SESSION_SECRET");
    if (s.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters");
    return s;
  },
  cronSecret: () => process.env.CRON_SECRET,
  /** Optional. Shown on the site as the contact address (forgot-password page, footer). */
  supportEmail: () => process.env.SUPPORT_EMAIL?.trim() || null,
  siteUrl: () => {
    const url = process.env.NEXT_PUBLIC_SITE_URL;
    // A localhost fallback in production would send Stripe redirects and share links nowhere.
    if (!url && process.env.NODE_ENV === "production") throw new Error("Missing env var NEXT_PUBLIC_SITE_URL");
    return (url ?? "http://localhost:3000").replace(/\/$/, "");
  },
};

/** Customer accounts need a Supabase project (URL + anon key), even in local dev. */
export const authConfigured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
