import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeCurrency } from "@/lib/currency";
import { PAGE_SHELL } from "@/lib/ui";
import { SettingsForm } from "./SettingsForm";
import { SignOutButton } from "./SignOutButton";

export default async function SettingsPage() {
  const authUser = await requireAuth();
  const user = await db.user.findUnique({ where: { supabaseId: authUser.id } });

  const formUser = {
    businessName: user?.businessName ?? null,
    phone: user?.phone ?? null,
    logoUrl: user?.logoUrl ?? null,
    tradeType: user?.tradeType ?? "OTHER",
    // Prisma Decimal isn't serializable across the Server→Client boundary
    taxRatePercent: Number(user?.taxRatePercent ?? 0),
    currency: normalizeCurrency(user?.currency),
  };

  return (
    <div className={PAGE_SHELL}>
      <h1 className="type-display text-3xl font-extrabold mb-1">
        Business profile
      </h1>
      <p className="text-sm text-ink-muted mb-6">
        This is what your clients see on every quote you send.
      </p>
      <div className="rounded-2xl border border-line bg-surface p-5">
        <SettingsForm user={formUser} />
      </div>
      <div className="mt-6">
        <SignOutButton />
      </div>
    </div>
  );
}
