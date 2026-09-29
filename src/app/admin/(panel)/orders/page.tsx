import { and, desc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge, money, PageHeader, when } from "@/components/admin/ui";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Orders" };

const { orders, cards, templates } = schema;
const PAGE = 50;
const STATUSES = ["all", "paid", "pending", "failed", "refunded"] as const;

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status) ?? "all";
  const page = Math.max(1, Number(sp.page) || 1);

  const customer = typeof sp.customer === "string" && /^[0-9a-f-]{36}$/i.test(sp.customer) ? sp.customer : undefined;
  const where = and(status === "all" ? undefined : eq(orders.status, status), customer ? eq(cards.userId, customer) : undefined);
  const [rows, [{ total }]] = await Promise.all([
    db()
      .select({
        o: orders,
        shareSlug: cards.shareSlug,
        buyerEmail: cards.buyerEmail,
        toName: sql<string | null>`${cards.data}->>'toName'`,
        template: templates.name,
      })
      .from(orders)
      .innerJoin(cards, eq(orders.cardId, cards.id))
      .innerJoin(templates, eq(cards.templateId, templates.id))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(PAGE)
      .offset((page - 1) * PAGE),
    db().select({ total: sql<number>`count(*)::int` }).from(orders).innerJoin(cards, eq(orders.cardId, cards.id)).where(where),
  ]);

  // Links straight to the payment in Stripe (refunds are issued there).
  const stripeBase = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test") ? "https://dashboard.stripe.com/test" : "https://dashboard.stripe.com";
  const chip = (on: boolean) => `rounded-full px-3.5 py-1.5 text-sm font-extrabold ${on ? "bg-plum text-white" : "bg-white text-plum-soft ring-1 ring-petal"}`;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <>
      <PageHeader
        title="Orders"
        sub="One row per checkout attempt. “Pending” means the buyer opened Stripe Checkout but hasn't paid (yet)."
      />
      {customer && (
        <p className="mb-4 text-sm text-plum-soft">
          Showing one customer&apos;s orders. <Link href="/admin/orders" className="font-extrabold text-rose">Show all</Link>
        </p>
      )}
      <nav className="mb-5 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}${customer ? `&customer=${customer}` : ""}`} className={chip(status === s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </nav>

      <div className="overflow-x-auto rounded-[1.5rem] bg-white shadow-sm ring-1 ring-petal">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-petal text-xs uppercase tracking-wider text-plum-soft">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-3 py-3">Card</th>
              <th className="px-3 py-3">Buyer</th>
              <th className="px-3 py-3 text-right">Amount</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-5 py-3 text-right">Links</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-petal">
            {rows.map((r) => (
              <tr key={r.o.id}>
                <td className="whitespace-nowrap px-5 py-3 text-plum-soft">{when(r.o.createdAt)}</td>
                <td className="px-3 py-3">
                  <p className="font-extrabold">{r.template}</p>
                  <p className="text-xs text-plum-soft">for {r.toName ?? "…"}</p>
                </td>
                <td className="px-3 py-3 text-plum-soft">{r.buyerEmail ?? "—"}</td>
                <td className="px-3 py-3 text-right font-extrabold tabular-nums">{money(r.o.amountCents)}</td>
                <td className="px-3 py-3"><Badge status={r.o.status} /></td>
                <td className="whitespace-nowrap px-5 py-3 text-right text-xs font-extrabold">
                  {r.o.status === "paid" && (
                    <Link href={`/c/${r.shareSlug}`} target="_blank" className="mr-3 text-rose">Card ↗</Link>
                  )}
                  {r.o.stripePaymentIntentId ? (
                    <a href={`${stripeBase}/payments/${r.o.stripePaymentIntentId}`} target="_blank" rel="noopener" className="text-plum-soft hover:text-plum">
                      Stripe ↗
                    </a>
                  ) : (
                    <span className="text-plum-soft/50">—</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-plum-soft">No orders here.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm font-extrabold">
          <span className="text-plum-soft">Page {page} of {pages} · {total} orders</span>
          <div className="flex gap-2">
            {page > 1 && <Link className="btn btn-ghost py-2" href={`/admin/orders?status=${status}${customer ? `&customer=${customer}` : ""}&page=${page - 1}`}>← Newer</Link>}
            {page < pages && <Link className="btn btn-ghost py-2" href={`/admin/orders?status=${status}${customer ? `&customer=${customer}` : ""}&page=${page + 1}`}>Older →</Link>}
          </div>
        </div>
      )}
      <p className="mt-6 text-xs text-plum-soft">
        To refund, open the payment in Stripe and click Refund. The webhook then marks the order refunded here and switches off the card&apos;s link.
      </p>
    </>
  );
}
