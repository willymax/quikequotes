"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const profileSchema = z.object({
  businessName: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  tradeType: z.enum([
    "PAINTING",
    "PRESSURE_WASHING",
    "CLEANING",
    "HVAC",
    "LANDSCAPING",
    "FUMIGATION",
    "MOVING_SERVICES",
    "OTHER",
  ]),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export async function updateBusinessProfile(formData: FormData) {
  const authUser = await requireAuth();

  const parsed = profileSchema.safeParse({
    businessName: formData.get("businessName"),
    phone: formData.get("phone") || undefined,
    tradeType: formData.get("tradeType"),
    logoUrl: formData.get("logoUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid form data" };
  }

  await db.user.upsert({
    where: { supabaseId: authUser.id },
    create: { supabaseId: authUser.id, email: authUser.email ?? "", ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/settings");
  return { success: true };
}
