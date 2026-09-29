import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CardThumb } from "@/components/CardThumb";
import { buyerFields, getTemplateBySlug } from "@/lib/templates";
import { getCurrentUser } from "@/lib/user";
import EditorForm from "./EditorForm";

export async function generateMetadata({ params }: PageProps<"/editor/[slug]">): Promise<Metadata> {
  const t = await getTemplateBySlug((await params).slug);
  return { title: t ? `Customize ${t.name}` : "Customize" };
}

export default async function EditorPage({ params }: PageProps<"/editor/[slug]">) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template) notFound();
  // Step 1 of 2: an account comes first, so every card is saved to its owner from the start.
  // Payment is step 2, on the preview page.
  if (!(await getCurrentUser())) redirect(`/signup?next=${encodeURIComponent(`/editor/${slug}`)}`);

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_320px]">
      <div>
        <Link href={`/t/${slug}`} className="text-sm font-bold text-plum-soft hover:text-rose">← Back to the demo</Link>
        <h1 className="mt-3 font-display text-4xl font-black">Make it yours</h1>
        <p className="mb-8 mt-2 text-plum-soft">Only the starred fields are needed. You&apos;ll see a full preview before paying anything.</p>
        <EditorForm slug={slug} fields={buyerFields(template)} defaults={template.defaultPhotos} />
      </div>

      <aside className="order-first lg:order-none">
        <div className="lg:sticky lg:top-24">
          <div className="mx-auto max-w-[220px] lg:max-w-none">
            <CardThumb t={template} />
          </div>
          <ul className="mt-6 hidden space-y-2 rounded-[1.5rem] bg-white p-5 text-sm ring-1 ring-petal lg:block">
            <li>💌 Preview it free before you unlock</li>
            <li>🔗 A private link you can send anywhere</li>
            <li>💾 Saved in My cards, so you can copy the link anytime</li>
          </ul>
        </div>
      </aside>
    </main>
  );
}
