import "server-only";
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { env } from "./env";

/**
 * Admin auth, deliberately small:
 *  - passwords hashed with scrypt (Node built-in, no extra dependency)
 *  - session = HMAC-signed cookie { adminId, expiry }, httpOnly, 7 days
 *  - every admin page AND every admin server action calls requireAdmin()
 */

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const COOKIE = "fy_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, saltB64, hashB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

const sign = (payload: string) => createHmac("sha256", env.adminSessionSecret()).update(payload).digest("base64url");

function encode(adminId: string) {
  const payload = Buffer.from(JSON.stringify({ sub: adminId, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const good = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (good.length !== given.length || !timingSafeEqual(good, given)) return null;
  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { sub: string; exp: number };
    return exp > Date.now() ? sub : null;
  } catch {
    return null;
  }
}

/** Call only from a server action or route handler (cookies can't be set while rendering). */
export async function startSession(adminId: string) {
  (await cookies()).set(COOKIE, encode(adminId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in admin, or null. Also checks the admin still exists in the DB. */
export async function getAdmin() {
  const id = decode((await cookies()).get(COOKIE)?.value);
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const admin = await db().query.admins.findFirst({ where: eq(schema.admins.id, id) });
  return admin ? { id: admin.id, email: admin.email } : null;
}

/** Guard for admin pages and server actions. Redirects to login when signed out. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
