import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { QuoteWizard } from "./QuoteWizard";

export default async function NewQuotePage() {
  const user = await requireDbUser();

  const templates = await db.template.findMany({
    where: {
      OR: [{ userId: null }, { userId: user.id }],
    },
    select: { id: true, name: true, tradeType: true },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return <QuoteWizard templates={templates} />;
}
