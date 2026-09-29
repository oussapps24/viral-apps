import { desc, ilike, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { money, PageHeader, when } from "@/components/admin/ui";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { ResetLinkButton } from "./ResetLinkButton";

export const metadata: Metadata = { title: "Customers" };

const { customers } = schema;

export default async function CustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  await requireAdmin();
  const q = typeof (await searchParams).q === "string" ? String((await searchParams).q).trim() : "";

  const rows = await db()
    .select({
      c: customers,
      // Written out in full: Drizzle leaves column names unqualified in a single-table
      // select, which makes "id" ambiguous inside these subqueries.
      paidCards: sql<number>`(select count(*)::int from cards c where c.user_id = "customers"."id" and c.status = 'paid')`,
      spentCents: sql<number>`(select coalesce(sum(o.amount_cents), 0)::int from orders o join cards c on c.id = o.card_id where c.user_id = "customers"."id" and o.status = 'paid')`,
    })
    .from(customers)
    .where(q ? ilike(customers.email, `%${q.replace(/[%_]/g, "")}%`) : undefined)
    .orderBy(desc(customers.createdAt))
    .limit(100);

  return (
    <>
      <PageHeader title="Customers" sub="Everyone with an account. If a customer can't get into their account, make a reset link and send it to them yourself." />
      <form className="mb-5 flex max-w-md gap-2">
        <input name="q" defaultValue={q} placeholder="Search by email" className="field py-2" />
        <button className="btn btn-ghost py-2">Search</button>
      </form>

      <div className="overflow-x-auto rounded-[1.5rem] bg-white shadow-sm ring-1 ring-petal">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-petal text-xs uppercase tracking-wider text-plum-soft">
            <tr>
              <th className="px-5 py-3">Email</th>
              <th className="whitespace-nowrap px-3 py-3">Joined</th>
              <th className="whitespace-nowrap px-3 py-3">Last sign-in</th>
              <th className="px-3 py-3 text-right">Cards</th>
              <th className="px-3 py-3 text-right">Spent</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-petal">
            {rows.map(({ c, paidCards, spentCents }) => (
              <tr key={c.id}>
                <td className="px-5 py-3 font-extrabold">{c.email}</td>
                <td className="whitespace-nowrap px-3 py-3 text-plum-soft">{when(c.createdAt)}</td>
                <td className="whitespace-nowrap px-3 py-3 text-plum-soft">{c.lastSignInAt ? when(c.lastSignInAt) : "—"}</td>
                <td className="px-3 py-3 text-right tabular-nums">{paidCards}</td>
                <td className="px-3 py-3 text-right font-extrabold tabular-nums">{money(spentCents)}</td>
                <td className="px-5 py-3 text-right text-xs font-extrabold">
                  <div className="flex items-start justify-end gap-4">
                    <ResetLinkButton customerId={c.id} />
                    <Link href={`/admin/orders?customer=${c.id}`} className="text-rose">Orders →</Link>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-plum-soft">{q ? "No customer matches that email." : "No customers yet."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {rows.length === 100 && <p className="mt-3 text-xs text-plum-soft">Showing the newest 100. Search to find others.</p>}
    </>
  );
}
