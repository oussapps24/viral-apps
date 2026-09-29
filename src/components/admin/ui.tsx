import type { ReactNode } from "react";

/** Small shared pieces for the admin, in the site's theme. */

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-black">{title}</h1>
        {sub && <p className="mt-1 text-plum-soft">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-petal sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 font-display text-lg font-black">{title}</h2>}
      {children}
    </section>
  );
}

export function Label({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-extrabold">{label}</span>
      {children}
      {hint && <span className="text-xs text-plum-soft">{hint}</span>}
    </label>
  );
}

const STATUS: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-stone-200 text-stone-700",
  refunded: "bg-red-100 text-red-700",
  draft: "bg-stone-200 text-stone-700",
  live: "bg-emerald-100 text-emerald-800",
  hidden: "bg-stone-200 text-stone-700",
};

export function Badge({ status, children }: { status: string; children?: ReactNode }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold capitalize ${STATUS[status] ?? "bg-petal text-plum"}`}>
      {children ?? status}
    </span>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-petal">
      <p className="text-xs font-extrabold uppercase tracking-wider text-plum-soft">{label}</p>
      <p className="mt-2 font-display text-3xl font-black tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-plum-soft">{sub}</p>}
    </div>
  );
}

export const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const when = (d: Date) =>
  d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
