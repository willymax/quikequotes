"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { requireAuth, requireDbUser } from "@/lib/auth";
import { scheduleFollowUps, cancelPendingFollowUps } from "@/lib/follow-ups";

// ─── Create quote ─────────────────────────────────────────────────────────────

const createQuoteSchema = z.object({
  clientName: z.string().min(1).max(100),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().max(20).optional().or(z.literal("")),
  jobAddress: z.string().max(200).optional().or(z.literal("")),
  title: z.string().min(1).max(200),
  notes: z.string().max(1000).optional().or(z.literal("")),
  templateId: z.string().optional(),
});

export async function createQuote(formData: FormData) {
  const user = await requireDbUser();

  const parsed = createQuoteSchema.safeParse({
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail") || undefined,
    clientPhone: formData.get("clientPhone") || undefined,
    jobAddress: formData.get("jobAddress") || undefined,
    title: formData.get("title"),
    notes: formData.get("notes") || undefined,
    templateId: formData.get("templateId") || undefined,
  });

  if (!parsed.success) return { error: "Invalid form data" };

  const { templateId, ...quoteData } = parsed.data;

  const quote = await db.quote.create({
    data: {
      ...quoteData,
      userId: user.id,
      tiers: {
        create: [
          { label: "GOOD", totalCents: 0 },
          { label: "BETTER", totalCents: 0 },
          { label: "BEST", totalCents: 0 },
        ],
      },
    },
    include: { tiers: true },
  });

  // Apply template if selected
  if (templateId) {
    const template = await db.template.findUnique({
      where: { id: templateId },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    if (template) {
      if (template.userId !== null && template.userId !== user.id) {
        return { error: "Template not found" };
      }

      for (const tier of quote.tiers) {
        const tierItems = template.items.filter(
          (item) => item.tierHint === tier.label
        );
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
      }
    }
  }

  redirect(`/quotes/${quote.id}/edit`);
}

// ─── Update quote ─────────────────────────────────────────────────────────────

export async function updateQuote(
  quoteId: string,
  data: {
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    jobAddress?: string;
    title?: string;
    notes?: string;
    validUntil?: Date;
  }
) {
  const authUser = await requireAuth();
  await assertQuoteOwner(quoteId, authUser.id);
  await db.quote.update({ where: { id: quoteId }, data });
  revalidatePath(`/quotes/${quoteId}`);
}

// ─── Send quote ───────────────────────────────────────────────────────────────

export async function sendQuote(quoteId: string) {
  const authUser = await requireAuth();
  const user = await assertQuoteOwner(quoteId, authUser.id);

  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: { tiers: { include: { lineItems: true } }, user: true },
  });

  if (!quote) return { error: "Quote not found" };
  if (!quote.clientEmail && !quote.clientPhone) {
    return { error: "Quote must have client email or phone before sending" };
  }

  await db.quote.update({
    where: { id: quoteId },
    data: { status: "SENT", updatedAt: new Date() },
  });

  await scheduleFollowUps(quoteId);

  // Send initial notification to client if email is available
  if (quote.clientEmail) {
    try {
      const { sendQuoteNotificationEmail } = await import("@/lib/email");
      await sendQuoteNotificationEmail(quote, user);
    } catch {
      // Non-fatal — quote is still sent, follow-ups will handle it
    }
  }

  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

// ─── Line items ───────────────────────────────────────────────────────────────

const lineItemSchema = z.object({
  description: z.string().min(1).max(200),
  quantity: z.coerce.number().positive(),
  unitCents: z.coerce.number().int().min(0),
});

export async function addLineItem(tierId: string, formData: FormData) {
  const authUser = await requireAuth();
  const supabaseId = authUser.id;

  const tier = await db.quoteTier.findUnique({
    where: { id: tierId },
    include: { quote: { select: { id: true, userId: true } } },
  });
  if (!tier) return { error: "Tier not found" };

  await assertUserOwnsQuote(tier.quote.userId, supabaseId);

  const parsed = lineItemSchema.safeParse({
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unitCents: formData.get("unitCents"),
  });
  if (!parsed.success) return { error: "Invalid line item data" };

  const count = await db.lineItem.count({ where: { tierId } });
  const totalCents = Math.round(
    parsed.data.quantity * parsed.data.unitCents
  );

  await db.lineItem.create({
    data: {
      tierId,
      description: parsed.data.description,
      quantity: parsed.data.quantity,
      unitCents: parsed.data.unitCents,
      totalCents,
      sortOrder: count,
    },
  });

  await recalcTierTotal(tierId);
  revalidatePath(`/quotes/${tier.quote.id}/edit`);
  return { success: true };
}

export async function updateLineItem(
  lineItemId: string,
  data: { description?: string; quantity?: number; unitCents?: number }
) {
  const authUser = await requireAuth();
  const supabaseId = authUser.id;

  const item = await db.lineItem.findUnique({
    where: { id: lineItemId },
    include: {
      tier: { include: { quote: { select: { id: true, userId: true } } } },
    },
  });
  if (!item) return { error: "Line item not found" };

  await assertUserOwnsQuote(item.tier.quote.userId, supabaseId);

  const qty = data.quantity ?? Number(item.quantity);
  const unit = data.unitCents ?? item.unitCents;

  await db.lineItem.update({
    where: { id: lineItemId },
    data: {
      ...data,
      totalCents: Math.round(qty * unit),
    },
  });

  await recalcTierTotal(item.tierId);
  revalidatePath(`/quotes/${item.tier.quote.id}/edit`);
  return { success: true };
}

export async function deleteLineItem(lineItemId: string) {
  const authUser = await requireAuth();
  const supabaseId = authUser.id;

  const item = await db.lineItem.findUnique({
    where: { id: lineItemId },
    include: {
      tier: { include: { quote: { select: { id: true, userId: true } } } },
    },
  });
  if (!item) return { error: "Line item not found" };

  await assertUserOwnsQuote(item.tier.quote.userId, supabaseId);

  await db.lineItem.delete({ where: { id: lineItemId } });
  await recalcTierTotal(item.tierId);
  revalidatePath(`/quotes/${item.tier.quote.id}/edit`);
  return { success: true };
}

export async function updateTierDescription(
  tierId: string,
  description: string
) {
  const authUser = await requireAuth();
  const supabaseId = authUser.id;

  const tier = await db.quoteTier.findUnique({
    where: { id: tierId },
    include: { quote: { select: { id: true, userId: true } } },
  });
  if (!tier) return { error: "Tier not found" };

  await assertUserOwnsQuote(tier.quote.userId, supabaseId);

  await db.quoteTier.update({ where: { id: tierId }, data: { description } });
  revalidatePath(`/quotes/${tier.quote.id}/edit`);
  return { success: true };
}

// ─── Client actions (no auth) ─────────────────────────────────────────────────

export async function recordQuoteView(token: string) {
  const quote = await db.quote.findUnique({ where: { shareToken: token } });
  if (!quote) return;

  if (quote.status === "SENT" && !quote.viewedAt) {
    await db.quote.update({
      where: { id: quote.id },
      data: { viewedAt: new Date(), status: "VIEWED" },
    });
  }
}

const acceptSchema = z.object({
  token: z.string(),
  signatureDataUrl: z.string().min(1),
  signedByName: z.string().min(1).max(100),
  acceptedTierId: z.string(),
});

export async function acceptQuote(data: z.infer<typeof acceptSchema>) {
  const parsed = acceptSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  const quote = await db.quote.findUnique({
    where: { shareToken: parsed.data.token },
    include: {
      user: { select: { email: true, businessName: true } },
      tiers: { select: { id: true } },
    },
  });

  if (!quote) return { error: "Quote not found" };
  if (!["SENT", "VIEWED"].includes(quote.status)) {
    return { error: "Quote is no longer available" };
  }
  if (!quote.tiers.some((tier) => tier.id === parsed.data.acceptedTierId)) {
    return { error: "Invalid tier selection" };
  }

  await db.quote.update({
    where: { id: quote.id },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
      acceptedTierId: parsed.data.acceptedTierId,
      signatureDataUrl: parsed.data.signatureDataUrl,
      signedAt: new Date(),
      signedByName: parsed.data.signedByName,
    },
  });

  await cancelPendingFollowUps(quote.id);

  revalidatePath(`/q/${parsed.data.token}`);
  return { success: true };
}

export async function declineQuote(token: string) {
  const quote = await db.quote.findUnique({ where: { shareToken: token } });
  if (!quote) return { error: "Quote not found" };

  await db.quote.update({
    where: { id: quote.id },
    data: { status: "DECLINED" },
  });

  await cancelPendingFollowUps(quote.id);

  revalidatePath(`/q/${token}`);
  return { success: true };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function assertQuoteOwner(quoteId: string, authId: string) {
  const user = await db.user.findUnique({ where: { supabaseId: authId } });
  if (!user) throw new Error("User not found");

  const quote = await db.quote.findUnique({ where: { id: quoteId } });
  if (!quote || quote.userId !== user.id) throw new Error("Unauthorized");

  return user;
}

async function assertUserOwnsQuote(userId: string, authId: string) {
  const user = await db.user.findUnique({ where: { supabaseId: authId } });
  if (!user || user.id !== userId) throw new Error("Unauthorized");
}

async function recalcTierTotal(tierId: string) {
  const items = await db.lineItem.findMany({ where: { tierId } });
  const total = items.reduce((sum, item) => sum + item.totalCents, 0);
  await db.quoteTier.update({
    where: { id: tierId },
    data: { totalCents: total },
  });
}
