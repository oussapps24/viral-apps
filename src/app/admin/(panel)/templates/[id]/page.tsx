import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { assetUrl } from "@/lib/storage";
import { deleteTemplate } from "../actions";
import { formOptions } from "../shared";
import TemplateForm from "../TemplateForm";

export const metadata: Metadata = { title: "Edit template" };

export default async function EditTemplatePage({ params, searchParams }: PageProps<"/admin/templates/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [t] = await db().select().from(schema.templates).where(eq(schema.templates.id, id)).limit(1);
  if (!t) notFound();
  const opts = await formOptions();

  return (
    <>
      <Link href="/admin/templates" className="text-sm font-bold text-plum-soft hover:text-rose">← Templates</Link>
      <PageHeader
        title={t.name}
        sub={`/t/${t.slug}`}
        action={<Link href={`/t/${t.slug}?preview=1`} target="_blank" className="btn btn-ghost">Preview ↗</Link>}
      />
      {typeof error === "string" && <p className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

      <TemplateForm
        {...opts}
        initial={{
          ...t,
          coverUrl: assetUrl(t.coverPath),
          musicUrl: assetUrl(t.musicPath),
          demoPhotos: Object.fromEntries(Object.entries(t.demoPhotos).map(([k, p]) => [k, { path: p, url: assetUrl(p)! }])),
        }}
      />

      <form action={deleteTemplate.bind(null, t.id)} className="mt-12 border-t border-petal pt-6">
        <p className="mb-3 text-sm text-plum-soft">Delete is only possible if nobody has made a card with this template yet.</p>
        <button className="btn border border-red-200 bg-white px-5 py-2 text-sm text-red-600">Delete template</button>
      </form>
    </>
  );
}
