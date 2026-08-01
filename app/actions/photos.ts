"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireDbUser } from "@/lib/auth";
import { isQuoteLocked, lockedMessage } from "@/lib/quote-lock";

const MAX_PHOTOS = 6;

export async function addPhoto(quoteId: string, url: string, caption?: string) {
  const user = await requireDbUser();

  const quote = await db.quote.findUnique({ where: { id: quoteId, userId: user.id } });
  if (!quote) return { error: "Quote not found" };
  if (isQuoteLocked(quote.status)) return { error: lockedMessage(quote.status) };

  const count = await db.quotePhoto.count({ where: { quoteId } });
  if (count >= MAX_PHOTOS) return { error: `Maximum ${MAX_PHOTOS} photos per quote` };

  await db.quotePhoto.create({
    data: { quoteId, url, caption: caption ?? null, sortOrder: count },
  });

  revalidatePath(`/quotes/${quoteId}/edit`);
  return { success: true };
}

export async function deletePhoto(photoId: string) {
  const user = await requireDbUser();

  const photo = await db.quotePhoto.findUnique({
    where: { id: photoId },
    include: { quote: { select: { id: true, userId: true, status: true } } },
  });
  if (!photo || photo.quote.userId !== user.id) return { error: "Photo not found" };
  if (isQuoteLocked(photo.quote.status)) {
    return { error: lockedMessage(photo.quote.status) };
  }

  await db.quotePhoto.delete({ where: { id: photoId } });
  revalidatePath(`/quotes/${photo.quote.id}/edit`);
  return { success: true };
}
