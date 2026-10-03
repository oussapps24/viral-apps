"use client";

import { useRef, useState } from "react";
import { uploadAssetAction } from "@/app/admin/(panel)/upload-action";
import { shrinkImage } from "@/lib/shrink-image";

/** Animated Noto emoji URLs to try for a typed emoji (with and without the FE0F variation selector). */
function notoCandidates(text: string): string[] {
  const cps = Array.from(text.trim()).map((c) => c.codePointAt(0)!.toString(16));
  if (!cps.length) return [];
  const url = (list: string[]) => `https://fonts.gstatic.com/s/e/notoemoji/latest/${list.join("_")}/512.webp`;
  const bare = cps.filter((c) => c !== "fe0f");
  const out = [url(cps), url(bare)];
  if (bare.length === 1) out.push(url([bare[0], "fe0f"]));
  return [...new Set(out)];
}

/**
 * File picker that uploads immediately and keeps the resulting storage path
 * in a hidden input, so the surrounding form only submits small text.
 */
export default function AssetUpload({
  name,
  kind,
  folder,
  initialPath,
  initialUrl,
  label,
  square,
  emoji,
  placeholderUrl,
}: {
  name: string;
  kind: "image" | "audio";
  folder: string;
  initialPath?: string | null;
  initialUrl?: string;
  label?: string;
  square?: boolean;
  /** Also allow picking an animated emoji instead of uploading a file. */
  emoji?: boolean;
  /** Shown faded when empty: what the card uses if nothing is set. */
  placeholderUrl?: string;
}) {
  const [path, setPath] = useState(initialPath ?? "");
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const [tries, setTries] = useState<string[]>([]);

  function pickEmoji(text: string) {
    const urls = notoCandidates(text);
    if (!urls.length) return;
    setError("");
    setTries(urls.slice(1));
    setPath(urls[0]);
    setUrl(urls[0]);
  }

  /** Not every emoji has an animated version: try the next spelling, then give up. */
  function onImgError() {
    if (!url.startsWith("https://fonts.gstatic.com/")) return;
    if (tries.length) {
      setPath(tries[0]);
      setUrl(tries[0]);
      setTries(tries.slice(1));
    } else {
      setPath("");
      setUrl("");
      setError("That emoji has no animated version. Try another one.");
    }
  }

  async function onPick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const f = kind === "image" ? await shrinkImage(file, 1800, 0.85) : file;
      if (kind === "audio" && f.size > 4 * 1024 * 1024) throw new Error("Audio must be under 4 MB. Export a 128 kbps mp3.");
      const fd = new FormData();
      fd.set("file", f);
      fd.set("folder", folder);
      const res = await uploadAssetAction(fd);
      if ("error" in res) throw new Error(res.error);
      setPath(res.path);
      setUrl(res.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-extrabold">{label}</span>}
      <input type="hidden" name={name} value={path} />
      {kind === "image" ? (
        <div className={`relative overflow-hidden rounded-2xl border-2 border-dashed border-petal bg-blush ${square ? "aspect-square" : "aspect-[3/4]"} w-full max-w-[180px]`}>
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              onError={onImgError}
              className={`absolute inset-0 h-full w-full ${url.startsWith("https://fonts.gstatic.com/") ? "object-contain p-4" : "object-cover"}`}
            />
          ) : placeholderUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={placeholderUrl} alt="" className="absolute inset-0 h-full w-full object-contain p-4 opacity-40" />
              <span className="absolute inset-x-0 bottom-1 text-center text-[10px] font-bold text-plum-soft">default</span>
            </>
          ) : (
            <span className="absolute inset-0 grid place-items-center text-xs font-bold text-plum-soft">No image</span>
          )}
          {busy && <span className="absolute inset-0 grid place-items-center bg-white/70 text-xs font-extrabold">Uploading…</span>}
        </div>
      ) : url ? (
        <audio src={url} controls className="w-full max-w-sm" />
      ) : (
        <p className="text-xs text-plum-soft">{busy ? "Uploading…" : "No file yet"}</p>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn btn-ghost px-3.5 py-1.5 text-xs">
          {url ? "Replace" : "Upload"}
        </button>
        {emoji && (
          <input
            aria-label="Use an emoji"
            placeholder="🙂"
            maxLength={16}
            onChange={(e) => {
              const v = e.currentTarget.value;
              if (v.trim()) pickEmoji(v);
              e.currentTarget.value = "";
            }}
            title="Type or paste an emoji to use its animated version"
            className="w-12 rounded-full border border-petal bg-white text-center text-base"
          />
        )}
        {url && (
          <button type="button" onClick={() => { setPath(""); setUrl(""); }} className="btn px-3.5 py-1.5 text-xs text-red-600">
            Remove
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        hidden
        accept={kind === "image" ? "image/*" : "audio/*"}
        onChange={(e) => onPick(e.currentTarget.files?.[0])}
      />
      {error && <p className="text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}
