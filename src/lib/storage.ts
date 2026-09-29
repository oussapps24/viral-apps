import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { env } from "./env";

/**
 * Two buckets:
 *  - photos (private): what buyers upload. Only reachable via short-lived signed URLs.
 *  - assets (public):  what the admin uploads: covers, demo photos, music.
 *
 * Without SUPABASE_SERVICE_ROLE_KEY (local dev) files go to ./.storage and are
 * served by /api/files. That fallback refuses to run in production. Local dev
 * can still use a hosted Supabase project for logins (URL + anon key only).
 */

type Bucket = "photos" | "assets";
const bucketName = (b: Bucket) => (b === "photos" ? env.photosBucket() : env.assetsBucket());

export const isLocalStorage = () => !process.env.SUPABASE_SERVICE_ROLE_KEY;
const LOCAL_ROOT = path.join(process.cwd(), ".storage");

function assertLocalAllowed() {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_LOCAL_STORAGE) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. Local file storage is for development only.");
  }
}

let client: SupabaseClient | null = null;
/** Service-role client. Server only. */
function supabase(): SupabaseClient {
  client ??= createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), { auth: { persistSession: false } });
  return client;
}

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/ogg", "audio/wav", "audio/x-wav", "audio/wave", "audio/webm"];
const EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
  "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/aac": "aac", "audio/ogg": "ogg",
  "audio/wav": "wav", "audio/x-wav": "wav", "audio/wave": "wav", "audio/webm": "webm",
};

async function put(bucket: Bucket, folder: string, file: File, allowed: string[], maxBytes: number) {
  if (!allowed.includes(file.type)) throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  if (file.size > maxBytes) throw new Error(`File too large (max ${Math.round(maxBytes / 1024 / 1024)} MB)`);
  const key = `${folder}/${new Date().toISOString().slice(0, 10)}/${nanoid()}.${EXT[file.type]}`;

  if (isLocalStorage()) {
    assertLocalAllowed();
    const full = path.join(LOCAL_ROOT, bucket, key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, Buffer.from(await file.arrayBuffer()));
    return key;
  }
  const { error } = await supabase().storage.from(bucketName(bucket)).upload(key, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return key;
}

async function remove(bucket: Bucket, keys: string[]) {
  const real = keys.filter((k) => k && !k.startsWith("/") && !k.startsWith("http"));
  if (real.length === 0) return;
  if (isLocalStorage()) {
    await Promise.all(real.map((k) => rm(path.join(LOCAL_ROOT, bucket, k), { force: true })));
    return;
  }
  const { error } = await supabase().storage.from(bucketName(bucket)).remove(real);
  if (error) throw new Error(error.message);
}

// ---- Buyer photos (private) --------------------------------------------------------

/** Photos are shrunk in the browser first, so anything near this is suspicious. */
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export const uploadCardPhoto = (file: File) => put("photos", "cards", file, IMAGE_TYPES, MAX_PHOTO_BYTES);
export const deleteCardPhotos = (keys: string[]) => remove("photos", keys);

/** Field → short-lived URL, so photos are only visible through the card page. */
export async function signedPhotoUrls(photos: Record<string, string>, expiresIn = 60 * 60 * 6) {
  const entries = Object.entries(photos);
  if (entries.length === 0) return {};
  if (isLocalStorage()) {
    return Object.fromEntries(entries.map(([f, k]) => [f, `/api/files/photos/${k}`]));
  }
  const { data, error } = await supabase().storage.from(bucketName("photos")).createSignedUrls(entries.map(([, k]) => k), expiresIn);
  if (error) throw new Error(error.message);
  const out: Record<string, string> = {};
  entries.forEach(([field], i) => {
    const url = data[i]?.signedUrl;
    if (url) out[field] = url;
  });
  return out;
}

// ---- Admin assets (public) -------------------------------------------------------

export const MAX_ASSET_IMAGE_BYTES = 3 * 1024 * 1024;
/** Uploads go through a server action, and Vercel caps request bodies at 4.5 MB. */
export const MAX_ASSET_AUDIO_BYTES = 4 * 1024 * 1024;

export function uploadAsset(file: File, folder: string) {
  const isAudio = file.type.startsWith("audio/");
  return put("assets", folder, file, isAudio ? AUDIO_TYPES : IMAGE_TYPES, isAudio ? MAX_ASSET_AUDIO_BYTES : MAX_ASSET_IMAGE_BYTES);
}
export const deleteAssets = (keys: string[]) => remove("assets", keys);

/** Asset key → URL. Values that are already URLs (e.g. /demo/x.svg) pass through. */
export function assetUrl(key: string | null | undefined): string | undefined {
  if (!key) return undefined;
  if (key.startsWith("/") || key.startsWith("http")) return key;
  if (isLocalStorage()) return `/api/files/assets/${key}`;
  return `${env.supabaseUrl().replace(/\/$/, "")}/storage/v1/object/public/${bucketName("assets")}/${key}`;
}

/** Used by /api/files in local mode only. */
export async function readLocalFile(bucket: string, key: string) {
  assertLocalAllowed();
  if (bucket !== "photos" && bucket !== "assets") return null;
  const full = path.join(LOCAL_ROOT, bucket, key);
  if (!full.startsWith(path.join(LOCAL_ROOT, bucket) + path.sep)) return null; // no ../ escapes
  return readFile(full).catch(() => null);
}
