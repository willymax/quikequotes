import Link from "next/link";
import type { Prisma, QuoteStatus } from "@prisma/client";
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

// A viewed quote is still an open opportunity, so it lives under Sent rather
// than getting its own chip; declined and expired both mean "over".
const TABS = [
  { slug: "all", label: "All", statuses: null },
  { slug: "drafts", label: "Drafts", statuses: ["DRAFT"] },
  { slug: "sent", label: "Sent", statuses: ["SENT", "VIEWED"] },
  { slug: "accepted", label: "Accepted", statuses: ["ACCEPTED"] },
  { slug: "closed", label: "Closed", statuses: ["DECLINED", "EXPIRED"] },
] as const satisfies readonly {
  slug: string;
  label: string;
  statuses: readonly QuoteStatus[] | null;
}[];

const SORTS = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  client: { clientName: "asc" },
} satisfies Record<string, Prisma.QuoteOrderByWithRelationInput>;

type SortKey = keyof typeof SORTS;

const PAGE_SIZE = 20;

/** Builds a dashboard URL, dropping params that are at their default. */
function dashboardHref(params: {
  tab: string;
  q: string;
  sort: SortKey;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params.tab !== "all") sp.set("tab", params.tab);
  if (params.q) sp.set("q", params.q);
  if (params.sort !== "newest") sp.set("sort", params.sort);
  if (params.limit && params.limit !== PAGE_SIZE) {
    sp.set("limit", String(params.limit));
  }
  const qs = sp.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    sort?: string;
    limit?: string;
  }>;
}) {
  const user = await requireDbUser();
  const sp = await searchParams;

  const tab = TABS.find((t) => t.slug === sp.tab) ?? TABS[0];
  const search = (sp.q ?? "").trim();
  const sort: SortKey = sp.sort && sp.sort in SORTS ? (sp.sort as SortKey) : "newest";
  const limit = Math.min(Math.max(Number(sp.limit) || PAGE_SIZE, 1), 200);

  // Rollups + tab counts. The amount lives on QuoteTier and the rate on Quote,
  // so quoteTotals() has to run in JS — no SQL SUM available. Fine at the volume
  // one operator generates; revisit by denormalising a total onto Quote if not.
  const allQuotes = await db.quote.findMany({
    where: { userId: user.id },
    select: {
      status: true,
      taxRatePercent: true,
      acceptedTierId: true,
      tiers: { select: { id: true, totalCents: true } },
    },
  });

  const counts = new Map<string, number>();
  let pipelineCents = 0;
  let wonCents = 0;

  for (const q of allQuotes) {
    counts.set(q.status, (counts.get(q.status) ?? 0) + 1);
    const rate = Number(q.taxRatePercent);

    if (q.status === "SENT" || q.status === "VIEWED") {
      pipelineCents += Math.max(
        ...q.tiers.map((t) => quoteTotals(t.totalCents, rate).totalCents),
        0
      );
    }
    if (q.status === "ACCEPTED") {
      const accepted = q.tiers.find((t) => t.id === q.acceptedTierId);
      if (accepted) {
        wonCents += quoteTotals(accepted.totalCents, rate).totalCents;
      }
    }
  }

  const tabCount = (statuses: readonly QuoteStatus[] | null) =>
    statuses === null
      ? allQuotes.length
      : statuses.reduce((sum, s) => sum + (counts.get(s) ?? 0), 0);

  const decided =
    (counts.get("ACCEPTED") ?? 0) +
    (counts.get("DECLINED") ?? 0) +
    (counts.get("EXPIRED") ?? 0);
  const acceptanceRate = decided
    ? Math.round(((counts.get("ACCEPTED") ?? 0) / decided) * 100)
    : null;

  const where: Prisma.QuoteWhereInput = { userId: user.id };
  if (tab.statuses) where.status = { in: [...tab.statuses] };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { clientName: { contains: search, mode: "insensitive" } },
    ];
  }

  // One extra row tells us whether a "Load more" link is warranted
  const page = await db.quote.findMany({
    where,
    select: {
      id: true,
      title: true,
      clientName: true,
      status: true,
      createdAt: true,
      taxRatePercent: true,
      tiers: { select: { totalCents: true, label: true } },
    },
    orderBy: SORTS[sort],
    take: limit + 1,
  });

  const hasMore = page.length > limit;
  const quotes = hasMore ? page.slice(0, limit) : page;

  // Highest tier, tax included — this is the number the owner quoted
  const maxTotal = (quote: (typeof quotes)[0]) => {
    const rate = Number(quote.taxRatePercent);
    return Math.max(
      ...quote.tiers.map((t) => quoteTotals(t.totalCents, rate).totalCents),
      0
    );
  };

  const filtered = Boolean(search) || tab.slug !== "all";

  if (allQuotes.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Quotes</h1>
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
      </div>
    );
  }

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

      {/* Rollups */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <Stat label="Open" value={formatMoney(pipelineCents)} />
        <Stat label="Won" value={formatMoney(wonCents)} />
        <Stat
          label="Accepted"
          value={acceptanceRate === null ? "—" : `${acceptanceRate}%`}
        />
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-1 mb-4">
        {TABS.map((t) => {
          const active = t.slug === tab.slug;
          return (
            <Link
              key={t.slug}
              href={dashboardHref({ tab: t.slug, q: search, sort })}
              className={`h-8 px-3 rounded-full text-xs font-medium flex items-center shrink-0 ${
                active
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 ${active ? "opacity-70" : "text-zinc-400"}`}>
                {tabCount(t.statuses)}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search + sort — a plain GET form, no client JS */}
      <form method="get" action="/dashboard" className="flex gap-2 mb-5">
        {tab.slug !== "all" && <input type="hidden" name="tab" value={tab.slug} />}
        <input
          type="search"
          name="q"
          defaultValue={search}
          maxLength={100}
          placeholder="Search title or client"
          className="flex-1 min-w-0 h-10 px-3 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <select
          name="sort"
          defaultValue={sort}
          className="h-10 px-2 text-sm border border-zinc-300 rounded-xl bg-white"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="client">Client A–Z</option>
        </select>
        <button
          type="submit"
          className="h-10 px-3 rounded-xl bg-zinc-900 text-white text-sm font-medium shrink-0"
        >
          Go
        </button>
      </form>

      {quotes.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-sm mb-4">
            {search
              ? `No quotes matching “${search}”${tab.slug === "all" ? "" : ` in ${tab.label}`}.`
              : `Nothing in ${tab.label}.`}
          </p>
          {filtered && (
            <Link href="/dashboard" className="text-sm underline underline-offset-2">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <>
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

          {hasMore && (
            <Link
              href={dashboardHref({
                tab: tab.slug,
                q: search,
                sort,
                limit: limit + PAGE_SIZE,
              })}
              className="mt-4 w-full h-11 rounded-xl border border-zinc-300 text-sm font-medium flex items-center justify-center"
            >
              Load more
            </Link>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2.5">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className="text-sm font-semibold truncate">{value}</p>
    </div>
  );
}
