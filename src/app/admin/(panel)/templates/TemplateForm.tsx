"use client";

import { useActionState, useState } from "react";
import AssetUpload from "@/components/admin/AssetUpload";
import { Label, Panel } from "@/components/admin/ui";
import type { FieldDef } from "@/designs/types";
import { saveTemplate, type FormState } from "./actions";

export type DesignOption = { key: string; label: string; description: string; fields: FieldDef[]; photoDefaults: Record<string, string> };

export type TemplateInitial = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  categoryId: string;
  design: string;
  priceCents: number;
  sort: number;
  published: boolean;
  coverPath: string | null;
  coverUrl?: string;
  coverTitle: string | null;
  coverSubtitle: string | null;
  music: string;
  musicPath: string | null;
  musicUrl?: string;
  demoData: Record<string, string>;
  demoPhotos: Record<string, { path: string; url: string }>;
};

export default function TemplateForm({
  initial,
  categories,
  designs,
  tracks,
}: {
  initial?: TemplateInitial;
  categories: { id: string; label: string; emoji: string }[];
  designs: DesignOption[];
  tracks: { value: string; label: string }[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveTemplate.bind(null, initial?.id ?? null), {});
  const [designKey, setDesignKey] = useState(initial?.design ?? designs[0]?.key);
  const [music, setMusic] = useState(initial?.music ?? "sweet");
  const design = designs.find((d) => d.key === designKey);
  const demoText = design?.fields.filter((f) => f.type !== "photo" && f.name !== "music") ?? [];
  const demoPhotos = design?.fields.filter((f) => f.type === "photo") ?? [];

  return (
    <form action={action} className="flex flex-col gap-6">
      <Panel title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Label label="Name *">
            <input name="name" required maxLength={60} defaultValue={initial?.name} className="field" placeholder="Do You Love Me?" />
          </Label>
          <Label label="URL slug" hint="Leave empty to generate from the name. Shows in /t/your-slug.">
            <input name="slug" maxLength={60} defaultValue={initial?.slug} className="field" placeholder="do-you-love-me" />
          </Label>
          <div className="sm:col-span-2">
            <Label label="Tagline" hint="One line under the name in the gallery.">
              <input name="tagline" maxLength={140} defaultValue={initial?.tagline} className="field" />
            </Label>
          </div>
          <Label label="Category *">
            <select name="categoryId" required defaultValue={initial?.categoryId} className="field">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </Label>
          <Label label="Price (USD) *">
            <input name="price" type="number" step="0.01" min="0.5" required defaultValue={((initial?.priceCents ?? 199) / 100).toFixed(2)} className="field" />
          </Label>
          <Label label="Sort order" hint="Lower numbers show first.">
            <input name="sort" type="number" defaultValue={initial?.sort ?? 0} className="field" />
          </Label>
          <label className="flex items-center gap-3 self-end rounded-2xl bg-blush px-4 py-3">
            <input name="published" type="checkbox" defaultChecked={initial?.published ?? false} className="h-5 w-5 accent-[#e0527a]" />
            <span className="text-sm font-extrabold">Published <span className="font-normal text-plum-soft">(visible on the site)</span></span>
          </label>
        </div>
      </Panel>

      <Panel title="Design">
        <p className="mb-4 text-sm text-plum-soft">The animated layout this card uses. Buyers fill in the fields this design asks for.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {designs.map((d) => (
            <label
              key={d.key}
              className={`flex cursor-pointer gap-3 rounded-2xl p-4 ring-1 transition ${designKey === d.key ? "bg-blush ring-2 ring-rose" : "ring-petal hover:bg-blush/60"}`}
            >
              <input type="radio" name="design" value={d.key} checked={designKey === d.key} onChange={() => setDesignKey(d.key)} className="mt-1 accent-[#e0527a]" />
              <span>
                <span className="block font-extrabold">{d.label}</span>
                <span className="text-sm text-plum-soft">{d.description}</span>
              </span>
            </label>
          ))}
        </div>
      </Panel>

      <Panel title="Gallery cover">
        <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
          <AssetUpload name="coverPath" kind="image" folder="covers" initialPath={initial?.coverPath} initialUrl={initial?.coverUrl} label="Cover image" />
          <div className="flex flex-col gap-4">
            <p className="text-sm text-plum-soft">No image? The gallery draws a cover in the design&apos;s colors from these:</p>
            <Label label="Cover title">
              <input name="coverTitle" maxLength={60} defaultValue={initial?.coverTitle ?? ""} className="field" placeholder="Defaults to the name" />
            </Label>
            <Label label="Cover subtitle">
              <input name="coverSubtitle" maxLength={60} defaultValue={initial?.coverSubtitle ?? ""} className="field" />
            </Label>
          </div>
        </div>
      </Panel>

      <Panel title="Music">
        <p className="mb-4 text-sm text-plum-soft">Plays in the background once the recipient taps. Buyers can switch it in the editor.</p>
        <div className="flex flex-wrap gap-2">
          {[...tracks, { value: "upload", label: "Upload a song" }, { value: "none", label: "No music" }].map((t) => (
            <label key={t.value} className={`cursor-pointer rounded-full px-4 py-2 text-sm font-extrabold ring-1 ${music === t.value ? "bg-plum text-white ring-plum" : "ring-petal"}`}>
              <input type="radio" name="music" value={t.value} checked={music === t.value} onChange={() => setMusic(t.value)} className="sr-only" />
              {t.label}
            </label>
          ))}
        </div>
        <div className={music === "upload" ? "mt-5" : "hidden"}>
          <AssetUpload name="musicPath" kind="audio" folder="music" initialPath={initial?.musicPath} initialUrl={initial?.musicUrl} label="Song file (mp3, under 4 MB)" />
          <p className="mt-2 text-xs text-plum-soft">Only upload music the client has the rights to use (royalty-free or licensed).</p>
        </div>
      </Panel>

      <Panel title="Demo content">
        <p className="mb-5 text-sm text-plum-soft">What visitors see when they try this card for free. Fields change with the design.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {demoText.map((f) => (
            <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
              <Label label={f.label}>
                {f.type === "textarea" ? (
                  <textarea name={`demo.${f.name}`} rows={3} maxLength={f.maxLength} defaultValue={initial?.demoData[f.name] ?? ""} placeholder={f.placeholder} className="field" />
                ) : (
                  <input
                    name={`demo.${f.name}`}
                    type={f.type === "date" ? "date" : "text"}
                    maxLength={f.maxLength}
                    defaultValue={initial?.demoData[f.name] ?? ""}
                    placeholder={f.placeholder}
                    className="field"
                  />
                )}
              </Label>
            </div>
          ))}
        </div>
        {demoPhotos.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {demoPhotos.map((f) => (
              <AssetUpload
                key={`${designKey}-${f.name}`}
                name={`demoPhoto.${f.name}`}
                kind="image"
                folder="demo"
                square
                label={f.label}
                emoji={!f.section?.startsWith("Gifts")}
                placeholderUrl={design?.photoDefaults[f.name]}
                initialPath={initial?.demoPhotos[f.name]?.path}
                initialUrl={initial?.demoPhotos[f.name]?.url}
              />
            ))}
          </div>
        )}
      </Panel>

      {state.error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{state.error}</p>}
      <div className="sticky bottom-4 flex justify-end">
        <button disabled={pending} className="btn btn-primary px-8 py-3.5 shadow-xl">{pending ? "Saving…" : initial ? "Save changes" : "Create template"}</button>
      </div>
    </form>
  );
}
