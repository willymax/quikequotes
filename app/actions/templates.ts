"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireDbUser } from "@/lib/auth";

export async function applyTemplate(quoteId: string, templateId: string) {
  const user = await requireDbUser();

  const quote = await db.quote.findUnique({
    where: { id: quoteId, userId: user.id },
    include: { tiers: true },
  });
  if (!quote) return { error: "Quote not found" };

  const template = await db.template.findUnique({
    where: { id: templateId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!template) return { error: "Template not found" };
  if (template.userId !== null && template.userId !== user.id) {
    return { error: "Template not found" };
  }

  // Delete existing line items and re-populate from template
  for (const tier of quote.tiers) {
    await db.lineItem.deleteMany({ where: { tierId: tier.id } });

    const tierItems = template.items.filter((item) => item.tierHint === tier.label);
    if (tierItems.length > 0) {
      await db.lineItem.createMany({
        data: tierItems.map((item, idx) => ({
          tierId: tier.id,
          description: item.description,
          quantity: 1,
          unitCents: item.unitCents,
          totalCents: item.unitCents,
          sortOrder: idx,
        })),
      });
    }

    const totalCents = tierItems.reduce((sum, i) => sum + i.unitCents, 0);
    await db.quoteTier.update({
      where: { id: tier.id },
      data: { totalCents },
    });
  }

  revalidatePath(`/quotes/${quoteId}/edit`);
  return { success: true };
}

export async function createCustomTemplate(quoteId: string, name: string) {
  const user = await requireDbUser();

  const quote = await db.quote.findUnique({
    where: { id: quoteId, userId: user.id },
    include: {
      tiers: {
        include: { lineItems: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!quote) return { error: "Quote not found" };

  const template = await db.template.create({
    data: {
      name,
      tradeType: user.tradeType,
      userId: user.id,
      items: {
        create: quote.tiers.flatMap((tier) =>
          tier.lineItems.map((item) => ({
            description: item.description,
            unitCents: item.unitCents,
            tierHint: tier.label,
            sortOrder: item.sortOrder,
          }))
        ),
      },
    },
  });

  revalidatePath("/templates");
  return { success: true, templateId: template.id };
}
