import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import CopyButton from "./CopyButton";

// Reads the DB on each request (and keeps `next build` from needing DATABASE_URL).
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Prompt gallery" };

export default async function PromptsPage() {
  const prompts = await db()
    .select()
    .from(schema.prompts)
    .where(eq(schema.prompts.published, true))
    .orderBy(asc(schema.prompts.sort), asc(schema.prompts.createdAt));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-black">Prompt gallery</h1>
      <p className="mb-8 mt-2 text-plum-soft">Image and video prompts to remix. Copy any of them for free.</p>

      {prompts.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-plum-soft ring-1 ring-petal">No prompts yet.</p>
      )}

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((p) => (
          <li key={p.id} className="flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-petal">
            {p.mediaUrl &&
              (p.kind === "video" ? (
                <video src={p.mediaUrl} muted loop autoPlay playsInline className="aspect-video w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.mediaUrl} alt="" className="aspect-video w-full object-cover" />
              ))}
            <div className="flex flex-1 flex-col gap-3 p-4">
              <h2 className="font-extrabold">{p.title}</h2>
              <p className="line-clamp-4 text-sm text-plum-soft">{p.prompt}</p>
              <div className="mt-auto flex items-center gap-2">
                <CopyButton text={p.prompt} />
                {p.tryUrl && (
                  <a
                    href={p.tryUrl}
                    target="_blank"
                    rel="noopener sponsored"
                    className="btn btn-primary px-4 py-2 text-sm"
                  >
                    Try
                  </a>
                )}
                {p.sourceUrl && (
                  <a href={p.sourceUrl} target="_blank" rel="noopener" className="ml-auto text-xs font-bold text-plum-soft underline">
                    Source
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
