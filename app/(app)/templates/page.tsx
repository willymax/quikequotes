import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

const TRADE_LABELS: Record<string, string> = {
  PAINTING: "Painting",
  PRESSURE_WASHING: "Pressure Washing",
  CLEANING: "Cleaning",
  HVAC: "HVAC",
  LANDSCAPING: "Landscaping",
  FUMIGATION: "Fumigation",
  MOVING_SERVICES: "Moving Services",
  OTHER: "Other",
};

export default async function TemplatesPage() {
  const user = await requireDbUser();

  const templates = await db.template.findMany({
    where: {
      OR: [{ userId: null }, { userId: user.id }],
    },
    include: { items: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  const TIER_ORDER = ["GOOD", "BETTER", "BEST"] as const;
  const TIER_HEADERS: Record<string, string> = {
    GOOD: "Good",
    BETTER: "Better",
    BEST: "Best",
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Templates</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Templates pre-fill your line items when creating a quote.
      </p>

      <div className="space-y-4">
        {templates.map((template) => {
          const grouped = TIER_ORDER.map((tier) => ({
            tier,
            items: template.items.filter((item) => item.tierHint === tier),
          })).filter((group) => group.items.length > 0);

          return (
            <details
              key={template.id}
              className="rounded-2xl border border-zinc-200 p-4 group"
            >
              <summary className="flex items-start justify-between gap-2 cursor-pointer list-none">
                <div>
                  <p className="font-semibold">{template.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {TRADE_LABELS[template.tradeType] ?? template.tradeType}
                    {template.userId === null && " · System"}
                    {" · "}
                    {template.items.length} item{template.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="text-xs text-zinc-400 shrink-0 group-open:hidden">
                  Preview
                </span>
              </summary>

              {grouped.length > 0 && (
                <div className="mt-3 space-y-3">
                  {grouped.map(({ tier, items }) => (
                    <div key={tier}>
                      <p className="text-xs font-semibold text-zinc-400 uppercase mb-1">
                        {TIER_HEADERS[tier]}
                      </p>
                      <ul className="space-y-1">
                        {items.map((item) => (
                          <li key={item.id} className="text-sm text-zinc-600 flex justify-between gap-2">
                            <span>{item.description}</span>
                            {item.unitCents > 0 && (
                              <span className="text-zinc-400 shrink-0">
                                {formatMoney(item.unitCents)}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </details>
          );
        })}

        {templates.length === 0 && (
          <p className="text-center text-zinc-500 py-8">
            No templates yet. Create a quote and save it as a template.
          </p>
        )}
      </div>
    </div>
  );
}
