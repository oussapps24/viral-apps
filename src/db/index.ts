import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

type DB = PostgresJsDatabase<typeof schema>;

// One client per server instance, reused across hot reloads in dev.
const g = globalThis as unknown as { __db?: DB };

/** Lazy so `next build` doesn't need DATABASE_URL. */
export function db(): DB {
  if (!g.__db) {
    // prepare: false is required for Supabase's transaction pooler (port 6543),
    // which is what you want on Vercel serverless. Short timeouts: a frozen function
    // shouldn't hold idle pooler connections, and a dead pooler should fail fast.
    const client = postgres(env.databaseUrl(), { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 10 });
    g.__db = drizzle(client, { schema });
  }
  return g.__db;
}

export { schema };
