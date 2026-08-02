import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { quoteTotals } from "@/lib/money";
import { tierLabel } from "@/lib/status";
import { Money } from "@/app/components/ui/Money";
import { SignatureCapture } from "./SignatureCapture";

export default async function SignPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ tier?: string }>;
}) {
  const { token } = await params;
  const { tier: tierId } = await searchParams;

  const quote = await db.quote.findUnique({
    where: { shareToken: token },
    include: {
      tiers: {
        where: tierId ? { id: tierId } : undefined,
        include: { lineItems: false },
      },
    },
  });

  if (!quote) notFound();
  if (!["SENT", "VIEWED"].includes(quote.status)) notFound();

  const selectedTier = quote.tiers[0];
  if (!selectedTier) notFound();

  const taxRatePercent = Number(quote.taxRatePercent);
  const totals = quoteTotals(selectedTier.totalCents, taxRatePercent);

  return (
    <div className="min-h-screen bg-paper-warm">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <Link
          href={`/q/${token}`}
          className="text-sm text-ink-muted hover:text-ink transition-colors"
        >
          ← Back to quote
        </Link>

        <div>
          <h1 className="type-display text-3xl font-extrabold">Accept quote</h1>
          <p className="text-ink-muted mt-1.5">
            You&apos;re accepting the{" "}
            <span className="font-semibold text-ink">
              {tierLabel(selectedTier.label)}
            </span>{" "}
            option.
          </p>
        </div>

        {/* The amount being agreed to, given the weight it deserves. */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="type-eyebrow text-[10px] text-ink-muted mb-2">
            Total to accept
          </p>
          <Money cents={totals.totalCents} currency={quote.currency} size="lg" />
          {taxRatePercent > 0 && (
            <p className="mt-2 text-sm text-ink-muted">
              <Money
                cents={totals.subtotalCents}
                currency={quote.currency}
                size="xs"
                tone="inherit"
              />{" "}
              +{" "}
              <Money
                cents={totals.taxCents}
                currency={quote.currency}
                size="xs"
                tone="inherit"
              />{" "}
              tax ({taxRatePercent}%)
            </p>
          )}
        </div>

        <SignatureCapture
          token={token}
          tierId={selectedTier.id}
          clientName={quote.clientName}
        />
      </div>
    </div>
  );
}
