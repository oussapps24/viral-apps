/**
 * Create an admin, or reset an existing admin's password.
 *
 *   npm run admin:create -- you@example.com "a long password"
 */
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { admins } from "../src/db/schema";

config({ path: [".env.local", ".env"], quiet: true });

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: npm run admin:create -- you@example.com "a long password"');
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("Use a password of at least 10 characters.");
    process.exit(1);
  }

  // Same format as src/lib/auth.ts hashPassword().
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  const passwordHash = `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;

  const client = postgres(process.env.DIRECT_URL ?? process.env.DATABASE_URL!, { prepare: false });
  try {
    await drizzle(client)
      .insert(admins)
      .values({ email: email.trim().toLowerCase(), passwordHash })
      .onConflictDoUpdate({ target: admins.email, set: { passwordHash } });
    console.log(`Admin ready: ${email.trim().toLowerCase()}  →  sign in at /admin`);
  } finally {
    await client.end();
  }
}

main();
