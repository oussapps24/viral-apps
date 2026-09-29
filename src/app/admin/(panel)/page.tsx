import { and, desc, eq, gte, sql } from "drizzle-orm";
import Link from "next/link";
import { Badge, money, PageHeader, Panel, Stat, when } from "@/components/admin/ui";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

const { orders, cards, templates } = schema;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Server-side data load (kept out of the component body so render stays pure). */
async function loadStats() {
  const d30 = new Date(Date.now() - 30 * 86_400_000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sumPaid = (since?: Date) =>
    db()
      .select({ n: sql<number>`count(*)::int`, cents: sql<number>`coalesce(sum(${orders.amountCents}), 0)::int` })
      .from(orders)
      .where(since ? and(eq(orders.status, "paid"), gte(orders.updatedAt, since)) : eq(orders.status, "paid"));

  const [[all], [last30], [todays], [drafts], recent, top] = await Promise.all([
    sumPaid(),
    sumPaid(d30),
    sumPaid(today),
    db().select({ n: sql<number>`count(*)::int` }).from(cards).where(eq(cards.status, "draft")),
    db()
      .select({ o: orders, toName: sql<string>`${cards.data}->>'toName'`, template: templates.name })
      .from(orders)
      .innerJoin(cards, eq(orders.cardId, cards.id))
      .innerJoin(templates, eq(cards.templateId, templates.id))
      .where(eq(orders.status, "paid"))
      .orderBy(desc(orders.updatedAt))
      .limit(8),
    db()
      .select({ name: templates.name, n: sql<number>`count(*)::int`, cents: sql<number>`sum(${orders.amountCents})::int` })
      .from(orders)
      .innerJoin(cards, eq(orders.cardId, cards.id))
      .innerJoin(templates, eq(cards.templateId, templates.id))
      .where(eq(orders.status, "paid"))
      .groupBy(templates.name)
      .orderBy(desc(sql`count(*)`))
      .limit(5),
  ]);
  return { all, last30, todays, drafts, recent, top };
}

export default async function Dashboard() {
  await requireAdmin();
  const { all, last30, todays, drafts, recent, top } = await loadStats();

  return (
    <>
      <PageHeader title="Dashboard" sub="Paid orders only. Refunds are subtracted automatically." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Today" value={money(todays.cents)} sub={plural(todays.n, "order")} />
        <Stat label="Last 30 days" value={money(last30.cents)} sub={plural(last30.n, "order")} />
        <Stat label="All time" value={money(all.cents)} sub={plural(all.n, "order")} />
        <Stat label="Unpaid drafts" value={String(drafts.n)} sub="Deleted after 7 days" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Panel title="Latest sales">
          {recent.length === 0 ? (
            <p className="text-sm text-plum-soft">No sales yet.</p>
          ) : (
            <ul className="divide-y divide-petal">
              {recent.map((r) => (
                <li key={r.o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-extrabold">{r.template}</p>
                    <p className="truncate text-plum-soft">for {r.toName ?? "…"} · {when(r.o.updatedAt)}</p>
                  </div>
                  <span className="font-extrabold tabular-nums">{money(r.o.amountCents)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/orders" className="mt-4 inline-block text-sm font-extrabold text-rose">All orders →</Link>
        </Panel>
        <Panel title="Best sellers">
          {top.length === 0 ? (
            <p className="text-sm text-plum-soft">Nothing yet.</p>
          ) : (
            <ol className="space-y-3 text-sm">
              {top.map((t, i) => (
                <li key={t.name} className="flex items-center justify-between gap-3">
                  <span className="truncate"><b className="text-plum-soft">{i + 1}.</b> {t.name}</span>
                  <Badge status="paid">{t.n}</Badge>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </>
  );
}
