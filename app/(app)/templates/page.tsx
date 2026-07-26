import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";

const TRADE_LABELS: Record<string, string> = {
  PAINTING: "Painting",
  PRESSURE_WASHING: "Pressure Washing",
  CLEANING: "Cleaning",
  HVAC: "HVAC",
  LANDSCAPING: "Landscaping",
  OTHER: "Other",
};

export default async function TemplatesPage() {
  const user = await requireDbUser();

  const templates = await db.template.findMany({
    where: {
      OR: [{ userId: null }, { userId: user.id }],
    },
    include: { items: { orderBy: { sortOrder: "asc" }, take: 5 } },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Templates</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Templates pre-fill your line items when creating a quote.
      </p>

      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-2xl border border-zinc-200 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{template.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {TRADE_LABELS[template.tradeType] ?? template.tradeType}
                  {template.userId === null && " · System"}
                </p>
              </div>
            </div>

            {template.items.length > 0 && (
              <ul className="mt-3 space-y-1">
                {template.items.map((item) => (
                  <li key={item.id} className="text-sm text-zinc-600 flex gap-2">
                    <span className="text-xs text-zinc-400 uppercase font-medium w-12 shrink-0">
                      {item.tierHint.slice(0, 3)}
                    </span>
                    {item.description}
                  </li>
                ))}
                {template.items.length === 5 && (
                  <li className="text-xs text-zinc-400">+ more items</li>
                )}
              </ul>
            )}
          </div>
        ))}

        {templates.length === 0 && (
          <p className="text-center text-zinc-500 py-8">
            No templates yet. Create a quote and save it as a template.
          </p>
        )}
      </div>
    </div>
  );
}
