import Link from "next/link";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { templateScope, TEMPLATE_ORDER } from "@/lib/templates";
import { matchesTrade, tradeLabel } from "@/lib/trades";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ trades?: string }>;
}) {
  const user = await requireDbUser();
  const { trades } = await searchParams;
  const allTrades = trades === "all";

  const all = await db.template.findMany({
    where: templateScope(user.id),
    include: { items: { orderBy: { sortOrder: "asc" } } },
    orderBy: TEMPLATE_ORDER,
  });

  const templates = all.filter((t) => matchesTrade(t, user.tradeType, allTrades));

  const TIER_ORDER = ["GOOD", "BETTER", "BEST"] as const;
  const TIER_HEADERS: Record<string, string> = {
    GOOD: "Good",
    BETTER: "Better",
    BEST: "Best",
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Templates</h1>
      <p className="text-sm text-zinc-500 mb-4">
        Templates pre-fill your line items when creating a quote.
      </p>

      {/* Server-rendered chips — the state lives in the URL, so it survives reload */}
      <div className="flex gap-2 mb-6">
        <Link
          href="/templates"
          className={`h-8 px-3 rounded-full text-xs font-medium flex items-center ${
            allTrades
              ? "border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
              : "bg-zinc-900 text-white"
          }`}
        >
          {tradeLabel(user.tradeType)}
        </Link>
        <Link
          href="/templates?trades=all"
          className={`h-8 px-3 rounded-full text-xs font-medium flex items-center ${
            allTrades
              ? "bg-zinc-900 text-white"
              : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
          }`}
        >
          All trades
        </Link>
      </div>

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
                    {tradeLabel(template.tradeType)}
                    {template.userId === null ? " · System" : " · Mine"}
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
                                {formatMoney(item.unitCents, user.currency)}
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
          <p className="text-center text-zinc-500 py-8 text-sm">
            {all.length > 0 ? (
              <>
                No {tradeLabel(user.tradeType)} templates yet — tap{" "}
                <strong>All trades</strong> to browse the rest.
              </>
            ) : (
              "No templates yet. Create a quote and save it as a template."
            )}
          </p>
        )}
      </div>
    </div>
  );
}
