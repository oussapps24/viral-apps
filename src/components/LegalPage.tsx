import type { ReactNode } from "react";
import { env } from "@/lib/env";
import { legal } from "@/lib/legal";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-4xl font-black">{title}</h1>
      <p className="mt-2 text-sm text-plum-soft">Last updated {legal.updated}</p>
      <div className="mt-10 space-y-10">{children}</div>
    </main>
  );
}

export function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-extrabold">
        {n}. {title}
      </h2>
      <div className="mt-3 space-y-3 leading-relaxed text-plum-soft [&_a]:font-bold [&_a]:text-rose [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

/** Support email as a mailto link, or a visible placeholder if SUPPORT_EMAIL is unset. */
export function SupportEmail() {
  const email = env.supportEmail();
  return email ? <a href={`mailto:${email}`}>{email}</a> : <b>[support email]</b>;
}
