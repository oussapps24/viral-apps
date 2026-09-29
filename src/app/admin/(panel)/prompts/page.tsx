import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import AssetUpload from "@/components/admin/AssetUpload";
import { Badge, Label, PageHeader, Panel } from "@/components/admin/ui";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { deletePrompt, savePrompt } from "./actions";

export const metadata: Metadata = { title: "Prompts" };

type P = typeof schema.prompts.$inferSelect;

function PromptFields({ p }: { p?: P }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_130px_90px]">
          <Label label="Title *"><input name="title" required maxLength={120} defaultValue={p?.title} className="field" /></Label>
          <Label label="Type">
            <select name="kind" defaultValue={p?.kind ?? "image"} className="field">
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </Label>
          <Label label="Sort"><input name="sort" type="number" defaultValue={p?.sort ?? 0} className="field" /></Label>
        </div>
        <Label label="Prompt *"><textarea name="prompt" required rows={3} defaultValue={p?.prompt} className="field" /></Label>
        <div className="grid gap-4 sm:grid-cols-3">
          <Label label="Media link" hint="Image or .mp4 URL. Or upload an image →"><input name="mediaUrl" defaultValue={p?.mediaUrl ?? ""} className="field" /></Label>
          <Label label="Credit link" hint="The original creator's post"><input name="sourceUrl" defaultValue={p?.sourceUrl ?? ""} className="field" /></Label>
          <Label label="“Try” link" hint="Include your affiliate code"><input name="tryUrl" defaultValue={p?.tryUrl ?? ""} className="field" /></Label>
        </div>
        <label className="flex items-center gap-2 text-sm font-extrabold">
          <input name="published" type="checkbox" defaultChecked={p?.published ?? true} className="h-4 w-4 accent-[#e0527a]" /> Published
        </label>
      </div>
      <AssetUpload name="mediaPath" kind="image" folder="prompts" square label="Upload image" />
    </div>
  );
}

export default async function PromptsAdminPage({ searchParams }: PageProps<"/admin/prompts">) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const rows = await db().select().from(schema.prompts).orderBy(asc(schema.prompts.sort), asc(schema.prompts.createdAt));

  return (
    <>
      <PageHeader title="Prompts" sub="The AI prompt gallery at /prompts." />
      {typeof ok === "string" && <p className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{ok}</p>}
      {typeof error === "string" && <p className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

      <details className="mb-6 rounded-[1.5rem] bg-white shadow-sm ring-1 ring-petal">
        <summary className="cursor-pointer list-none px-6 py-4 font-display text-lg font-black">+ Add a prompt</summary>
        <form action={savePrompt.bind(null, null)} className="flex flex-col gap-4 px-6 pb-6">
          <PromptFields />
          <button className="btn btn-primary self-end">Add prompt</button>
        </form>
      </details>

      <div className="flex flex-col gap-3">
        {rows.map((p) => (
          <details key={p.id} className="rounded-[1.25rem] bg-white shadow-sm ring-1 ring-petal">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3">
              {p.mediaUrl && p.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.mediaUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-lilac">{p.kind === "video" ? "🎬" : "🖼️"}</span>
              )}
              <span className="flex-1 font-extrabold">{p.title}</span>
              <Badge status={p.published ? "live" : "hidden"}>{p.published ? "Live" : "Hidden"}</Badge>
              <span className="text-xs font-bold text-rose">Edit</span>
            </summary>
            <div className="px-5 pb-5">
              <form action={savePrompt.bind(null, p.id)} className="flex flex-col gap-4">
                <PromptFields p={p} />
                <button className="btn btn-primary self-end">Save</button>
              </form>
              <form action={deletePrompt.bind(null, p.id)} className="mt-2 text-right">
                <button className="text-xs font-bold text-red-600">Delete</button>
              </form>
            </div>
          </details>
        ))}
        {rows.length === 0 && <Panel><p className="text-sm text-plum-soft">No prompts yet.</p></Panel>}
      </div>
    </>
  );
}
