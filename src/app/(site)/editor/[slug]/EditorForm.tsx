"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { shrinkImage } from "@/lib/shrink-image";
import type { FieldDef } from "@/designs/types";
import { createCard, type EditorState } from "./actions";

const MAX_UPLOAD = 2 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Vercel rejects server-action bodies over 4.5 MB; leave room for text + encoding.
const MAX_TOTAL = 3.8 * 1024 * 1024;

export default function EditorForm({ slug, fields, defaults = {} }: { slug: string; fields: FieldDef[]; defaults?: Record<string, string> }) {
  const [shrinking, setShrinking] = useState(false);

  // Shrink photos in the browser, then hand the lighter form to the server.
  const [state, action, pending] = useActionState<EditorState, FormData>(async (prev, fd) => {
    setShrinking(true);
    try {
      for (const f of fields.filter((f) => f.type === "photo")) {
        const file = fd.get(f.name);
        if (!(file instanceof File) || file.size === 0) continue;
        const small = await shrinkImage(file);
        if (small.type === "image/gif" && small.size > MAX_UPLOAD) {
          return { error: `${f.label}: GIFs need to be under 2 MB. Try a smaller one.` };
        }
        if (!OK_TYPES.includes(small.type) || small.size > MAX_UPLOAD) {
          return { error: `${f.label}: we couldn't read that photo. Try a JPG, PNG or GIF.` };
        }
        fd.set(f.name, small);
      }
    } finally {
      setShrinking(false);
    }
    let total = 0;
    for (const [, v] of fd) if (v instanceof File) total += v.size;
    if (total > MAX_TOTAL) return { error: "Those photos are too big together. Try fewer or smaller photos." };
    return createCard(slug, prev, fd);
  }, {});

  // Group consecutive fields by section heading.
  const sections: { title: string; fields: FieldDef[] }[] = [];
  for (const f of fields) {
    const title = f.section ?? "Details";
    const last = sections.at(-1);
    if (last?.title === title) last.fields.push(f);
    else sections.push({ title, fields: [f] });
  }

  // Submitted via onSubmit (not <form action>) so React doesn't reset the form
  // and wipe the letter and photos when validation fails.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {sections.map((s) => (
        <fieldset key={s.title} className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-petal sm:p-6">
          <legend className="sr-only">{s.title}</legend>
          <h2 className="mb-4 font-display text-xl font-black">{s.title}</h2>
          <div className={s.fields.every((f) => f.type === "photo") ? "grid grid-cols-2 gap-4 sm:grid-cols-3" : "flex flex-col gap-4"}>
            {s.fields.map((f) => (
              <Field key={f.name} f={f} fallback={defaults[f.name]} />
            ))}
          </div>
        </fieldset>
      ))}

      {state.error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{state.error}</p>}

      <button disabled={pending} className="btn btn-primary sticky bottom-4 py-4 text-lg">
        {shrinking ? "Preparing photos…" : pending ? "Saving…" : "Preview my card ✨"}
      </button>
    </form>
  );
}

function Field({ f, fallback }: { f: FieldDef; fallback?: string }) {
  const label = (
    <span className="text-sm font-extrabold">
      {f.label}
      {f.required && <span className="text-rose"> *</span>}
    </span>
  );
  const hint = f.hint && <span className="text-xs text-plum-soft">{f.hint}</span>;

  if (f.type === "photo") return <PhotoField f={f} fallback={fallback} />;

  return (
    <label className="flex flex-col gap-1.5">
      {label}
      {f.type === "textarea" ? (
        <textarea name={f.name} required={f.required} maxLength={f.maxLength} placeholder={f.placeholder} defaultValue={f.defaultValue} rows={4} className="field" />
      ) : f.type === "select" ? (
        <select name={f.name} defaultValue={f.defaultValue} className="field">
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          name={f.name}
          type={f.type === "date" ? "date" : f.type === "youtube" ? "url" : "text"}
          required={f.required}
          maxLength={f.maxLength}
          placeholder={f.placeholder}
          defaultValue={f.defaultValue}
          className="field"
        />
      )}
      {hint}
    </label>
  );
}

/** `fallback`: the card's built-in sticker/photo for this slot, shown until they pick their own. */
function PhotoField({ f, fallback }: { f: FieldDef; fallback?: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <label className="group flex cursor-pointer flex-col gap-2">
      <span className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-petal bg-blush text-center transition group-hover:border-rose">
        {preview || fallback ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview ?? fallback} alt="" className="absolute inset-0 h-full w-full bg-white object-cover" />
            {!preview && (
              <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-extrabold text-plum shadow-sm">
                default · tap to change
              </span>
            )}
          </>
        ) : (
          <span className="px-2 text-xs font-bold text-plum-soft">
            <span className="block text-2xl">📷</span>tap to add
          </span>
        )}
        <input
          type="file"
          name={f.name}
          accept="image/*"
          required={f.required}
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            setPreview((old) => {
              if (old) URL.revokeObjectURL(old);
              return file ? URL.createObjectURL(file) : null;
            });
          }}
        />
      </span>
      <span className="text-xs font-extrabold leading-tight">{f.label}</span>
      {f.hint && <span className="-mt-1 text-[11px] leading-tight text-plum-soft">{f.hint}</span>}
    </label>
  );
}
