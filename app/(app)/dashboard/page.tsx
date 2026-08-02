import Link from "next/link";
import type { Prisma, QuoteStatus } from "@prisma/client";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { quoteTotals } from "@/lib/money";
import { normalizeCurrency } from "@/lib/currency";
import { statusMeta } from "@/lib/status";
import { buttonClass, chipClass, inputClass, PAGE_SHELL } from "@/lib/ui";
import { Money } from "@/app/components/ui/Money";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { PlusIcon } from "@/app/components/icons";

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
      currency: true,
      acceptedTierId: true,
      tiers: { select: { id: true, totalCents: true } },
    },
  });

  // Each quote snapshots its own currency, so amounts are totalled per currency
  // and never converted — adding KES into USD would be a lie, and there's no FX
  // rate to do it honestly with. Totalling only the business currency (what this
  // used to do) is worse: a business whose quotes are mostly in another currency
  // saw a rollup of zero next to a list full of priced quotes.
  const businessCurrency = normalizeCurrency(user.currency);

  const counts = new Map<string, number>();
  const byCurrency = new Map<string, { open: number; won: number }>();

  for (const q of allQuotes) {
    counts.set(q.status, (counts.get(q.status) ?? 0) + 1);
    const rate = Number(q.taxRatePercent);
    const code = normalizeCurrency(q.currency);
    const bucket = byCurrency.get(code) ?? { open: 0, won: 0 };

    if (q.status === "SENT" || q.status === "VIEWED") {
      bucket.open += Math.max(
        ...q.tiers.map((t) => quoteTotals(t.totalCents, rate).totalCents),
        0
      );
    }
    if (q.status === "ACCEPTED") {
      const accepted = q.tiers.find((t) => t.id === q.acceptedTierId);
      if (accepted) {
        bucket.won += quoteTotals(accepted.totalCents, rate).totalCents;
      }
    }
    byCurrency.set(code, bucket);
  }

  /**
   * Currencies carrying an amount, largest first. Falls back to a single zero in
   * the business currency so the card always has a figure to show rather than
   * collapsing to nothing on a brand-new account.
   */
  const totalsFor = (key: "open" | "won") => {
    const rows = [...byCurrency.entries()]
      .map(([code, b]) => ({ code, cents: b[key] }))
      .filter((r) => r.cents > 0)
      .sort((a, b) => b.cents - a.cents);
    return rows.length > 0 ? rows : [{ code: businessCurrency, cents: 0 }];
  };

  const openTotals = totalsFor("open");
  const wonTotals = totalsFor("won");
  const mixedCurrency = byCurrency.size > 1;

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

  const openCount = (counts.get("SENT") ?? 0) + (counts.get("VIEWED") ?? 0);
  const viewedCount = counts.get("VIEWED") ?? 0;

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
      currency: true,
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
      <div className={PAGE_SHELL}>
        <h1 className="type-display text-3xl font-extrabold mb-8">Quotes</h1>
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <p className="type-display text-xl font-bold mb-2">
            Nothing quoted yet
          </p>
          <p className="text-sm text-ink-muted mb-7 max-w-xs mx-auto leading-relaxed">
            Pick a trade template, add your line items, and send it before you
            leave the driveway.
          </p>
          <Link
            href="/quotes/new"
            className={buttonClass({ variant: "accent", size: "lg" })}
          >
            <PlusIcon size={18} />
            Create your first quote
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={PAGE_SHELL}>
      <div className="flex items-center justify-between mb-5">
        <h1 className="type-display text-3xl font-extrabold">Quotes</h1>
        <Link
          href="/quotes/new"
          className={buttonClass({ size: "sm", pill: true })}
        >
          <PlusIcon size={16} />
          New
        </Link>
      </div>

      {/*
        The pipeline figure is the reason to open this app in the morning, so it
        gets the whole card and the hi-vis treatment, rather than being one of
        three equal grey tiles. Won and acceptance rate sit underneath it as
        context, not as peers.
      */}
      <section className="rounded-2xl bg-ink on-ink p-5 mb-4">
        <p className="type-eyebrow text-[10px] text-paper-muted mb-2">
          Open pipeline
        </p>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {openTotals.map((t, i) => (
            <Money
              key={t.code}
              cents={t.cents}
              currency={t.code}
              // The biggest number leads; any others sit beside it, smaller.
              size={i === 0 ? "xl" : "md"}
              tone="accent"
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-paper-muted">
          {openCount === 0
            ? "Nothing out with clients right now."
            : `${openCount} quote${openCount === 1 ? "" : "s"} out${
                viewedCount > 0 ? ` · ${viewedCount} opened` : ""
              }`}
        </p>

        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
          <div>
            <p className="type-eyebrow text-[10px] text-paper-muted mb-1">Won</p>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              {wonTotals.map((t) => (
                <Money
                  key={t.code}
                  cents={t.cents}
                  currency={t.code}
                  size="sm"
                  tone="invert"
                />
              ))}
            </div>
          </div>
          <div>
            <p className="type-eyebrow text-[10px] text-paper-muted mb-1">
              Accept rate
            </p>
            <p className="type-num text-base font-semibold text-paper">
              {acceptanceRate === null ? "—" : `${acceptanceRate}%`}
            </p>
          </div>
        </div>
      </section>

      {mixedCurrency && (
        <p className="text-[11px] text-ink-muted mb-4">
          Totalled per currency — amounts are never converted.
        </p>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-1 mb-3 mt-4">
        {TABS.map((t) => {
          const active = t.slug === tab.slug;
          return (
            <Link
              key={t.slug}
              href={dashboardHref({ tab: t.slug, q: search, sort })}
              className={chipClass(active)}
            >
              {t.label}
              <span className={`ml-1.5 ${active ? "opacity-60" : "opacity-70"}`}>
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
          className={inputClass({ size: "sm", className: "flex-1 min-w-0" })}
        />
        <select
          name="sort"
          defaultValue={sort}
          className={inputClass({
            size: "sm",
            full: false,
            className: "px-2 shrink-0",
          })}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="client">Client A–Z</option>
        </select>
        <button
          type="submit"
          className={buttonClass({ variant: "outline", size: "sm" })}
        >
          Go
        </button>
      </form>

      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
          <p className="text-sm text-ink-muted mb-4">
            {search
              ? `No quotes matching “${search}”${tab.slug === "all" ? "" : ` in ${tab.label}`}.`
              : `Nothing in ${tab.label}.`}
          </p>
          {filtered && (
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-ink underline underline-offset-4"
            >
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <>
          <ul className="space-y-2.5">
            {quotes.map((quote) => {
              const best = maxTotal(quote);
              return (
                <li key={quote.id}>
                  {/*
                    The left rail is the job-ticket tab: colour-coded by status
                    so the quote that needs chasing (VIEWED, amber) is findable
                    down a list held at arm's length.
                  */}
                  <Link
                    href={`/quotes/${quote.id}`}
                    className={`block rounded-2xl border border-l-[5px] border-line bg-surface p-4 transition-colors hover:border-line-strong ${
                      statusMeta(quote.status).rail
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{quote.title}</p>
                        <p className="text-sm text-ink-muted truncate">
                          {quote.clientName}
                        </p>
                      </div>
                      <StatusBadge status={quote.status} />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between gap-3">
                      {best > 0 ? (
                        <Money cents={best} currency={quote.currency} size="sm" />
                      ) : (
                        <span className="text-sm text-ink-muted">Unpriced</span>
                      )}
                      <span className="type-num text-xs text-ink-muted">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </span>
                    </div>
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
              className={buttonClass({
                variant: "outline",
                block: true,
                className: "mt-4",
              })}
            >
              Load more
            </Link>
          )}
        </>
      )}
    </div>
  );
}
