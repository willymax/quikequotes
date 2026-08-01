import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
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
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Business Profile</h1>
      <SettingsForm user={formUser} />
      <div className="mt-8 pt-6 border-t border-zinc-100">
        <SignOutButton />
      </div>
    </div>
  );
}
