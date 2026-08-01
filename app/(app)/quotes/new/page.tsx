import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { templateScope, TEMPLATE_ORDER } from "@/lib/templates";
import { QuoteWizard } from "./QuoteWizard";

export default async function NewQuotePage() {
  const user = await requireDbUser();

  const templates = await db.template.findMany({
    where: templateScope(user.id),
    select: { id: true, name: true, tradeType: true, userId: true },
    orderBy: TEMPLATE_ORDER,
  });

  return <QuoteWizard templates={templates} userTradeType={user.tradeType} />;
}
