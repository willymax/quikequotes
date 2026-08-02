import Link from "next/link";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { templateScope, TEMPLATE_ORDER } from "@/lib/templates";
import { matchesTrade, tradeLabel } from "@/lib/trades";
import { tierLabel } from "@/lib/status";
import { chipClass, PAGE_SHELL } from "@/lib/ui";
import { Money } from "@/app/components/ui/Money";

const TIER_ORDER = ["GOOD", "BETTER", "BEST"] as const;

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

  return (
    <div className={PAGE_SHELL}>
      <h1 className="type-display text-3xl font-extrabold mb-1">Templates</h1>
      <p className="text-sm text-ink-muted mb-5">
        Templates pre-fill your line items when you build a quote.
      </p>

      {/* Server-rendered chips — the state lives in the URL, so it survives reload */}
      <div className="flex gap-2 mb-5">
        <Link href="/templates" className={chipClass(!allTrades)}>
          {tradeLabel(user.tradeType)}
        </Link>
        <Link href="/templates?trades=all" className={chipClass(allTrades)}>
          All trades
        </Link>
      </div>

      <div className="space-y-3">
        {templates.map((template) => {
          const grouped = TIER_ORDER.map((tier) => ({
            tier,
            items: template.items.filter((item) => item.tierHint === tier),
          })).filter((group) => group.items.length > 0);

          return (
            <details
              key={template.id}
              className="rounded-2xl border border-line bg-surface p-4 group"
            >
              <summary className="flex items-start justify-between gap-2 cursor-pointer list-none">
                <div>
                  <p className="font-semibold">{template.name}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {tradeLabel(template.tradeType)}
                    {template.userId === null ? " · System" : " · Mine"}
                    {" · "}
                    {template.items.length} item
                    {template.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="text-xs font-semibold text-ink-muted shrink-0 group-open:hidden">
                  Preview
                </span>
              </summary>

              {grouped.length > 0 && (
                <div className="mt-4 space-y-4">
                  {grouped.map(({ tier, items }) => (
                    <div key={tier}>
                      <p className="type-eyebrow text-[10px] text-ink-muted mb-1.5">
                        {tierLabel(tier)}
                      </p>
                      <ul className="space-y-1.5">
                        {items.map((item) => (
                          <li
                            key={item.id}
                            className="text-sm text-ink-muted flex justify-between gap-3"
                          >
                            <span className="min-w-0">{item.description}</span>
                            {item.unitCents > 0 && (
                              <Money
                                cents={item.unitCents}
                                currency={user.currency}
                                size="xs"
                                tone="muted"
                              />
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
          <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-ink-muted">
            {all.length > 0 ? (
              <>
                No {tradeLabel(user.tradeType)} templates yet — tap{" "}
                <strong className="text-ink">All trades</strong> to browse the
                rest.
              </>
            ) : (
              "No templates yet. Build a quote and save it as one."
            )}
          </div>
        )}
      </div>
    </div>
  );
}
