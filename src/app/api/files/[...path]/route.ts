import { isLocalStorage, readLocalFile } from "@/lib/storage";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg", png: "image/png", webp: "image/webp",
  mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac", ogg: "audio/ogg", wav: "audio/wav", webm: "audio/webm",
};

/** Serves uploads in local development (no Supabase). 404 otherwise. */
export async function GET(_req: Request, ctx: RouteContext<"/api/files/[...path]">) {
  if (!isLocalStorage()) return new Response("Not found", { status: 404 });
  const [bucket, ...rest] = (await ctx.params).path;
  const key = rest.join("/");
  const data = await readLocalFile(bucket, key).catch(() => null);
  if (!data) return new Response("Not found", { status: 404 });
  const ext = key.split(".").pop() ?? "";
  return new Response(new Uint8Array(data), {
    headers: { "Content-Type": TYPES[ext] ?? "application/octet-stream", "Cache-Control": "private, max-age=3600" },
  });
}
