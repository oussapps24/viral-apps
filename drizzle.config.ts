import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Use the direct/session connection (port 5432) for migrations, not the pooler.
  dbCredentials: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL! },
  strict: true,
});
