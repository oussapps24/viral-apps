import { and, eq, gt, inArray, lt, notExists } from "drizzle-orm";
import { db, schema } from "@/db";
import { env } from "@/lib/env";
import { deleteCardPhotos } from "@/lib/storage";

/**
 * Daily (see vercel.json): deletes unpaid drafts older than 7 days and their
 * photos, so abandoned uploads don't pile up in storage.
 * Vercel sends `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: Request) {
  const secret = env.cronSecret();
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  // A recent order may be an open checkout: deleting now would orphan the payment.
  const recentOrder = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const stale = await db()
    .select({ id: schema.cards.id, photos: schema.cards.photos })
    .from(schema.cards)
    .where(
      and(
        eq(schema.cards.status, "draft"),
        lt(schema.cards.createdAt, cutoff),
        notExists(
          db()
            .select({ id: schema.orders.id })
            .from(schema.orders)
            .where(and(eq(schema.orders.cardId, schema.cards.id), gt(schema.orders.createdAt, recentOrder))),
        ),
      ),
    )
    .limit(500);

  if (stale.length === 0) return Response.json({ deleted: 0 });

  // Photos first: if storage fails, the rows stay and tomorrow's run retries.
  await deleteCardPhotos(stale.flatMap((c) => Object.values(c.photos)));
  await db().delete(schema.cards).where(inArray(schema.cards.id, stale.map((c) => c.id)));

  return Response.json({ deleted: stale.length });
}
