import { db } from "@/lib/db";

/**
 * Re-sums a tier's line items into QuoteTier.totalCents.
 *
 * Every read path (dashboard, quote detail, client view, edit tab strip) trusts
 * the stored column rather than summing live, so anything that writes line items
 * must call this afterwards or the option renders as $0.
 */
export async function recalcTierTotal(tierId: string) {
  const items = await db.lineItem.findMany({ where: { tierId } });
  const total = items.reduce((sum, item) => sum + item.totalCents, 0);
  await db.quoteTier.update({
    where: { id: tierId },
    data: { totalCents: total },
  });
}
