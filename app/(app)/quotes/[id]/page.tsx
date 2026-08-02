import Link from "next/link";
import { notFound } from "next/navigation";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { quoteTotals } from "@/lib/money";
import { isQuoteLocked, lockedMessage } from "@/lib/quote-lock";
import { statusMeta, tierLabel } from "@/lib/status";
import { buttonClass, PAGE_SHELL } from "@/lib/ui";
import { Money } from "@/app/components/ui/Money";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { CheckIcon, LinkIcon } from "@/app/components/icons";
import { SendQuoteButton } from "./SendQuoteButton";
import { CopyLinkButton } from "./CopyLinkButton";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireDbUser();

  const quote = await db.quote.findUnique({
    where: { id, userId: user.id },
    include: {
      tiers: {
        orderBy: { label: "asc" },
        include: { lineItems: { orderBy: { sortOrder: "asc" } } },
      },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!quote) notFound();

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/q/${quote.shareToken}`;
  const taxRatePercent = Number(quote.taxRatePercent);
  const acceptedTier = quote.tiers.find((t) => t.id === quote.acceptedTierId);
  const locked = isQuoteLocked(quote.status);
  const currency = quote.currency;

  return (
    <div className={`${PAGE_SHELL} space-y-5`}>
      {/* The status rail from the list carries through to the detail header, so
          the same colour keeps meaning the same thing. */}
      <div
        className={`rounded-2xl border border-l-[5px] border-line bg-surface p-5 ${
          statusMeta(quote.status).rail
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <h1 className="type-display text-2xl font-extrabold leading-tight">
            {quote.title}
          </h1>
          <StatusBadge status={quote.status} />
        </div>
        <p className="text-ink-muted mt-1">{quote.clientName}</p>
        {/* Only when it says more than the badge already does */}
        {statusMeta(quote.status).longLabel !==
          statusMeta(quote.status).label && (
          <p className="mt-1.5 text-xs text-ink-muted">
            {statusMeta(quote.status).longLabel}
          </p>
        )}
      </div>

      {/* Actions */}
      {locked ? (
        <p className="text-sm text-ink-muted rounded-xl border border-line bg-surface px-4 py-3">
          {lockedMessage(quote.status)}
        </p>
      ) : (
        <div className="flex gap-3">
          <Link
            href={`/quotes/${quote.id}/edit`}
            className={buttonClass({ variant: "outline", className: "flex-1" })}
          >
            Edit
          </Link>
          {["DRAFT", "SENT", "VIEWED"].includes(quote.status) && (
            <SendQuoteButton quoteId={quote.id} status={quote.status} />
          )}
        </div>
      )}

      {/* Share link */}
      {quote.status !== "DRAFT" && (
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="type-eyebrow text-[10px] text-ink-muted mb-2 flex items-center gap-1.5">
            <LinkIcon size={13} />
            Client link
          </p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="type-num text-sm break-all text-ink underline underline-offset-4 decoration-line-strong hover:decoration-ink"
          >
            {publicUrl}
          </a>
          <CopyLinkButton publicUrl={publicUrl} />
        </div>
      )}

      {/* Tiers */}
      <div className="space-y-3">
        <p className="type-eyebrow text-[10px] text-ink-muted">Options</p>
        {quote.tiers.map((tier) => {
          const totals = quoteTotals(tier.totalCents, taxRatePercent);
          const isAccepted = tier.id === quote.acceptedTierId;
          return (
            <div
              key={tier.id}
              className={`rounded-2xl border p-4 ${
                isAccepted
                  ? "border-accepted-rail ring-1 ring-accepted-rail/30 bg-accepted-fill/40"
                  : "border-line bg-surface"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="font-semibold text-sm flex items-center gap-2">
                  {tierLabel(tier.label)}
                  {isAccepted && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accepted-fill text-accepted-text">
                      <CheckIcon size={11} />
                      Accepted
                    </span>
                  )}
                </span>
                <Money cents={totals.totalCents} currency={currency} size="md" />
              </div>
              {tier.lineItems.length > 0 && (
                <ul className="space-y-1.5">
                  {tier.lineItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between gap-4 text-sm text-ink-muted"
                    >
                      <span className="min-w-0">{item.description}</span>
                      <Money
                        cents={item.totalCents}
                        currency={currency}
                        size="xs"
                        tone="muted"
                      />
                    </li>
                  ))}
                </ul>
              )}
              {taxRatePercent > 0 && (
                <div className="mt-3 pt-3 border-t border-line space-y-1.5 text-sm">
                  <div className="flex justify-between text-ink-muted">
                    <span>Subtotal</span>
                    <Money
                      cents={totals.subtotalCents}
                      currency={currency}
                      size="xs"
                      tone="muted"
                    />
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Tax ({taxRatePercent}%)</span>
                    <Money
                      cents={totals.taxCents}
                      currency={currency}
                      size="xs"
                      tone="muted"
                    />
                  </div>
                  <div className="flex justify-between font-semibold text-ink">
                    <span>Total</span>
                    <Money
                      cents={totals.totalCents}
                      currency={currency}
                      size="xs"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Accepted info */}
      {quote.status === "ACCEPTED" && (
        <div className="rounded-2xl border border-accepted-rail/30 bg-accepted-fill p-4 text-sm">
          <p className="font-semibold text-accepted-text flex items-center gap-1.5">
            <CheckIcon size={15} />
            Quote accepted
          </p>
          {acceptedTier && (
            <p className="text-accepted-text/85 mt-1">
              {tierLabel(acceptedTier.label)} option —{" "}
              <Money
                cents={
                  quoteTotals(acceptedTier.totalCents, taxRatePercent).totalCents
                }
                currency={currency}
                size="xs"
                tone="inherit"
              />
            </p>
          )}
          {quote.signedByName && (
            <p className="text-accepted-text/85 mt-1">
              Signed by{" "}
              <span className="font-semibold">{quote.signedByName}</span> on{" "}
              {quote.signedAt
                ? new Date(quote.signedAt).toLocaleDateString()
                : "—"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
