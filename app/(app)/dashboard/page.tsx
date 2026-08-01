import Link from "next/link";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney, quoteTotals } from "@/lib/money";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-zinc-100 text-zinc-600" },
  SENT: { label: "Sent", color: "bg-blue-100 text-blue-700" },
  VIEWED: { label: "Viewed", color: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "Accepted", color: "bg-green-100 text-green-700" },
  DECLINED: { label: "Declined", color: "bg-red-100 text-red-600" },
  EXPIRED: { label: "Expired", color: "bg-zinc-100 text-zinc-500" },
};

export default async function DashboardPage() {
  const user = await requireDbUser();

  const quotes = await db.quote.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      title: true,
      clientName: true,
      status: true,
      createdAt: true,
      taxRatePercent: true,
      tiers: { select: { totalCents: true, label: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Highest tier, tax included — this is the number the owner quoted
  const maxTotal = (quote: (typeof quotes)[0]) => {
    const rate = Number(quote.taxRatePercent);
    return Math.max(
      ...quote.tiers.map((t) => quoteTotals(t.totalCents, rate).totalCents),
      0
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <Link
          href="/quotes/new"
          className="h-10 px-4 rounded-full bg-zinc-900 text-white text-sm font-medium flex items-center"
        >
          + New Quote
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-lg font-medium mb-2">No quotes yet</p>
          <p className="text-sm mb-6">Create your first quote in under 3 minutes.</p>
          <Link
            href="/quotes/new"
            className="inline-flex h-12 px-6 rounded-xl bg-zinc-900 text-white font-semibold items-center"
          >
            Create Quote
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {quotes.map((quote) => {
            const badge = STATUS_LABELS[quote.status] ?? STATUS_LABELS.DRAFT;
            const best = maxTotal(quote);
            return (
              <li key={quote.id}>
                <Link
                  href={`/quotes/${quote.id}`}
                  className="block rounded-2xl border border-zinc-200 p-4 hover:border-zinc-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{quote.title}</p>
                      <p className="text-sm text-zinc-500 truncate">{quote.clientName}</p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  {best > 0 && (
                    <p className="mt-2 text-sm font-medium">
                      Up to {formatMoney(best)}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-400">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
