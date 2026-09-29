const ID = /^[\w-]{11}$/;

/** Pulls the 11-char video id out of any common YouTube URL form. */
export function youtubeId(input: string | undefined): string | null {
  if (!input) return null;
  const s = input.trim();
  const ok = (id: string | null | undefined) => (id && ID.test(id) ? id : null);
  if (ID.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\.|^m\.|^music\./, "");
    if (host === "youtu.be") return ok(u.pathname.split("/")[1]);
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.searchParams.has("v")) return ok(u.searchParams.get("v"));
      const m = /^\/(embed|shorts|live)\/([\w-]{11})(?:\/|$)/.exec(u.pathname);
      if (m) return m[2];
    }
  } catch {
    /* not a URL */
  }
  return null;
}
