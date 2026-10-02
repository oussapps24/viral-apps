import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CardRenderer from "@/designs/CardRenderer";
import { getAdmin } from "@/lib/auth";
import { getTemplateBySlug } from "@/lib/templates";

export async function generateMetadata({ params }: PageProps<"/t/[slug]">): Promise<Metadata> {
  const t = await getTemplateBySlug((await params).slug);
  return t ? { title: t.name, description: t.tagline } : {};
}

/** Free demo with the template's demo content, so people can try before customizing. */
export default async function TemplateDemoPage({ params, searchParams }: PageProps<"/t/[slug]">) {
  const { slug } = await params;
  // Signed-in admins can preview hidden templates with ?preview=1.
  const { preview } = await searchParams;
  const includeUnpublished = preview === "1" && (await getAdmin()) !== null;
  const t = await getTemplateBySlug(slug, { includeUnpublished });
  if (!t) notFound();

  return (
    <div className="relative">
      <CardRenderer design={t.designKey} data={t.demo.data} photos={t.demo.photos} music={t.music} />
      <Link
        href="/cards"
        aria-label="Back to all cards"
        className="fixed left-4 top-4 z-30 grid h-11 w-11 place-items-center rounded-full bg-white/85 text-plum shadow-md backdrop-blur"
      >
        ←
      </Link>
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center">
        <Link href={`/editor/${slug}`} className="btn btn-primary pointer-events-auto px-7 py-3.5 shadow-xl">
          ✏️ Customize this card
        </Link>
      </div>
    </div>
  );
}
