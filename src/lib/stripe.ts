import "server-only";
import Stripe from "stripe";
import { env } from "./env";

let client: Stripe | null = null;

/** Lazy so `next build` doesn't need STRIPE_SECRET_KEY. */
export function stripe(): Stripe {
  if (!client) {
    // STRIPE_API_BASE is for automated tests against a mock server only. Never set it in production.
    const base = process.env.STRIPE_API_BASE ? new URL(process.env.STRIPE_API_BASE) : null;
    client = new Stripe(
      env.stripeSecretKey(),
      base ? { host: base.hostname, port: Number(base.port), protocol: base.protocol.replace(":", "") as "http" | "https" } : undefined,
    );
  }
  return client;
}
