"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { requireAuth, requireDbUser } from "@/lib/auth";
import { scheduleFollowUps, cancelPendingFollowUps } from "@/lib/follow-ups";
import { recalcTierTotal } from "@/lib/tiers";
import { isQuoteLocked, lockedMessage } from "@/lib/quote-lock";

// ─── Shared quote field validation ────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  title: "Quote title",
  clientName: "Client name",
  clientEmail: "Client email",
  clientPhone: "Client phone",
  jobAddress: "Job address",
  notes: "Notes",
  validUntil: "Valid until",
};

/** Turns a zod failure into something the user can act on, not "Invalid form data". */
function describeIssues(error: z.ZodError): string {
  const seen = new Set<string>();
  const parts: string[] = [];

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(`${FIELD_LABELS[key] ?? key}: ${issue.message}`);
  }

  return parts.join(" · ") || "Invalid form data";
}

const quoteFields = {
  clientName: z
    .string()
    .min(1, "required")
    .max(100, "must be 100 characters or fewer"),
  clientEmail: z
    .string()
    .email("must be a valid email address")
    .optional()
    .or(z.literal("")),
  clientPhone: z
    .string()
    .max(30, "must be 30 characters or fewer")
    .optional()
    .or(z.literal("")),
  jobAddress: z
    .string()
    .max(200, "must be 200 characters or fewer")
    .optional()
    .or(z.literal("")),
  title: z
    .string()
    .min(1, "required")
    .max(200, "must be 200 characters or fewer"),
  notes: z
    .string()
    .max(1000, "must be 1000 characters or fewer")
    .optional()
    .or(z.literal("")),
};

// ─── Create quote ─────────────────────────────────────────────────────────────

const createQuoteSchema = z.object({
  ...quoteFields,
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

  if (!parsed.success) return { error: describeIssues(parsed.error) };

  const { templateId, ...quoteData } = parsed.data;

  const quote = await db.quote.create({
    data: {
      ...quoteData,
      userId: user.id,
      // Snapshot the business rate so later Settings changes don't rewrite sent quotes
      taxRatePercent: user.taxRatePercent,
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
          // Tiers are created at 0 — without this the option shows $0 until the
          // user edits an item and trips the recalc by hand
          await recalcTierTotal(tier.id);
        }
      }
    }
  }

  redirect(`/quotes/${quote.id}/edit`);
}

// ─── Update quote ─────────────────────────────────────────────────────────────

const updateQuoteSchema = z.object({
  ...quoteFields,
  // <input type="date"> gives YYYY-MM-DD, or "" when cleared
  validUntil: z.string().optional().or(z.literal("")),
  taxRatePercent: z.coerce
    .number("must be a number")
    .min(0, "cannot be negative")
    .max(100, "cannot exceed 100"),
});

export async function updateQuote(
  quoteId: string,
  data: z.input<typeof updateQuoteSchema>
) {
  const authUser = await requireAuth();
  const { quote } = await assertQuoteOwner(quoteId, authUser.id);
  if (isQuoteLocked(quote.status)) {
    return { error: lockedMessage(quote.status) };
  }

  const parsed = updateQuoteSchema.safeParse(data);
  if (!parsed.success) return { error: describeIssues(parsed.error) };

  const { validUntil, ...rest } = parsed.data;

  await db.quote.update({
    where: { id: quoteId },
    data: {
      ...rest,
      clientEmail: rest.clientEmail || null,
      clientPhone: rest.clientPhone || null,
      jobAddress: rest.jobAddress || null,
      notes: rest.notes || null,
      // Date-only field — store UTC midnight so it round-trips back into
      // <input type="date"> via toISOString().slice(0, 10) without shifting a day
      validUntil: validUntil ? new Date(`${validUntil}T00:00:00Z`) : null,
    },
  });

  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath(`/quotes/${quoteId}/edit`);
  return { success: true };
}

// ─── Send quote ───────────────────────────────────────────────────────────────

export async function sendQuote(quoteId: string) {
  const authUser = await requireAuth();
  const { user, quote: owned } = await assertQuoteOwner(quoteId, authUser.id);
  // Also protects the status column: this action writes SENT unconditionally, so
  // without the guard a re-send would downgrade an ACCEPTED quote back to SENT
  if (isQuoteLocked(owned.status)) {
    return { error: lockedMessage(owned.status) };
  }

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

// ─── Tiers (quote options) ────────────────────────────────────────────────────

const tierLabelSchema = z.enum(["GOOD", "BETTER", "BEST"]);

/** Removes one option from a quote. Line items cascade via the schema relation. */
export async function deleteTier(tierId: string) {
  const authUser = await requireAuth();

  const tier = await db.quoteTier.findUnique({
    where: { id: tierId },
    include: { quote: { select: { id: true, userId: true, status: true } } },
  });
  if (!tier) return { error: "Option not found" };

  await assertUserOwnsQuote(tier.quote.userId, authUser.id);
  if (isQuoteLocked(tier.quote.status)) {
    return { error: lockedMessage(tier.quote.status) };
  }

  const remaining = await db.quoteTier.count({
    where: { quoteId: tier.quote.id },
  });
  if (remaining <= 1) return { error: "A quote needs at least one option" };

  await db.quoteTier.delete({ where: { id: tierId } });

  revalidatePath(`/quotes/${tier.quote.id}/edit`);
  revalidatePath(`/quotes/${tier.quote.id}`);
  return { success: true };
}

export async function addTier(quoteId: string, label: string) {
  const authUser = await requireAuth();
  const { quote } = await assertQuoteOwner(quoteId, authUser.id);
  if (isQuoteLocked(quote.status)) {
    return { error: lockedMessage(quote.status) };
  }

  const parsedLabel = tierLabelSchema.safeParse(label);
  if (!parsedLabel.success) return { error: "Unknown option" };

  const existing = await db.quoteTier.findUnique({
    where: { quoteId_label: { quoteId, label: parsedLabel.data } },
  });
  if (existing) return { error: "That option already exists on this quote" };

  await db.quoteTier.create({
    data: { quoteId, label: parsedLabel.data, totalCents: 0 },
  });

  revalidatePath(`/quotes/${quoteId}/edit`);
  revalidatePath(`/quotes/${quoteId}`);
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
    include: { quote: { select: { id: true, userId: true, status: true } } },
  });
  if (!tier) return { error: "Tier not found" };

  await assertUserOwnsQuote(tier.quote.userId, supabaseId);
  if (isQuoteLocked(tier.quote.status)) {
    return { error: lockedMessage(tier.quote.status) };
  }

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
      tier: {
        include: {
          quote: { select: { id: true, userId: true, status: true } },
        },
      },
    },
  });
  if (!item) return { error: "Line item not found" };

  await assertUserOwnsQuote(item.tier.quote.userId, supabaseId);
  if (isQuoteLocked(item.tier.quote.status)) {
    return { error: lockedMessage(item.tier.quote.status) };
  }

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
      tier: {
        include: {
          quote: { select: { id: true, userId: true, status: true } },
        },
      },
    },
  });
  if (!item) return { error: "Line item not found" };

  await assertUserOwnsQuote(item.tier.quote.userId, supabaseId);
  if (isQuoteLocked(item.tier.quote.status)) {
    return { error: lockedMessage(item.tier.quote.status) };
  }

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
    include: { quote: { select: { id: true, userId: true, status: true } } },
  });
  if (!tier) return { error: "Tier not found" };

  await assertUserOwnsQuote(tier.quote.userId, supabaseId);
  if (isQuoteLocked(tier.quote.status)) {
    return { error: lockedMessage(tier.quote.status) };
  }

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
  // Same gate acceptQuote uses — without it anyone holding the share link could
  // flip an already-accepted quote to DECLINED
  if (!["SENT", "VIEWED"].includes(quote.status)) {
    return { error: "Quote is no longer available" };
  }

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

  return { user, quote };
}

async function assertUserOwnsQuote(userId: string, authId: string) {
  const user = await db.user.findUnique({ where: { supabaseId: authId } });
  if (!user || user.id !== userId) throw new Error("Unauthorized");
}
