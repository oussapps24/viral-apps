import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formOptions } from "../shared";
import TemplateForm from "../TemplateForm";

export const metadata: Metadata = { title: "New template" };

export default async function NewTemplatePage() {
  await requireAdmin();
  const opts = await formOptions();
  if (opts.categories.length === 0) {
    return (
      <>
        <PageHeader title="New template" />
        <p className="rounded-2xl bg-amber-50 px-4 py-3 font-bold text-amber-800">
          Create a category first. <Link href="/admin/categories" className="underline">Go to categories →</Link>
        </p>
      </>
    );
  }
  return (
    <>
      <Link href="/admin/templates" className="text-sm font-bold text-plum-soft hover:text-rose">← Templates</Link>
      <PageHeader title="New template" sub="Starts hidden unless you tick “Published”." />
      <TemplateForm {...opts} />
    </>
  );
}
