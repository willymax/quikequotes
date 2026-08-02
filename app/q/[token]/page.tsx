import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { quoteTotals } from "@/lib/money";
import { tierMeta } from "@/lib/status";
import { buttonClass } from "@/lib/ui";
import { Money } from "@/app/components/ui/Money";
import { CheckIcon, StarIcon } from "@/app/components/icons";

export default async function ClientQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const quote = await db.quote.findUnique({
    where: { shareToken: token },
    include: {
      user: {
        select: {
          businessName: true,
          logoUrl: true,
          phone: true,
        },
      },
      tiers: {
        orderBy: { label: "asc" },
        include: { lineItems: { orderBy: { sortOrder: "asc" } } },
      },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!quote) notFound();

  // Record first open — server-side, no client JS needed
  if (quote.status === "SENT" && !quote.viewedAt) {
    await db.quote.update({
      where: { id: quote.id },
      data: { viewedAt: new Date(), status: "VIEWED" },
    });
  }

  const isActive = ["SENT", "VIEWED"].includes(quote.status);
  const taxRatePercent = Number(quote.taxRatePercent);
  const acceptedTier = quote.tiers.find((t) => t.id === quote.acceptedTierId);
  const currency = quote.currency;

  return (
    <div className="min-h-screen bg-paper-warm">
      {/*
        The contractor's business, not ours — this page is their letterhead. It
        gets the ink band so the quote below reads as a document that was issued
        rather than a web page that happened to load.
      */}
      <header className="bg-ink on-ink px-4 py-5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {quote.user.logoUrl ? (
            <Image
              src={quote.user.logoUrl}
              alt={quote.user.businessName ?? "Business logo"}
              width={48}
              height={48}
              className="rounded-xl object-contain bg-paper"
            />
          ) : (
            <div className="w-12 h-12 shrink-0 rounded-xl bg-amber flex items-center justify-center text-ink font-extrabold text-lg">
              {quote.user.businessName?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-paper truncate">
              {quote.user.businessName}
            </p>
            {quote.user.phone && (
              <a
                href={`tel:${quote.user.phone}`}
                className="type-num text-sm text-paper-muted hover:text-paper transition-colors"
              >
                {quote.user.phone}
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-7 space-y-6">
        {/* Quote title */}
        <div>
          <p className="type-eyebrow text-[10px] text-ink-muted mb-2">Quote</p>
          <h1 className="type-display text-3xl font-extrabold">{quote.title}</h1>
          <p className="text-ink-muted mt-1.5">
            Prepared for{" "}
            <span className="font-semibold text-ink">{quote.clientName}</span>
          </p>
          {quote.notes && (
            <p className="mt-4 text-sm text-ink-muted leading-relaxed">
              {quote.notes}
            </p>
          )}
        </div>

        {/* Status banners */}
        {quote.status === "ACCEPTED" && (
          <div className="rounded-2xl bg-accepted-fill border border-accepted-rail/30 p-4">
            <p className="font-semibold text-accepted-text flex items-center gap-1.5">
              <CheckIcon size={16} />
              Quote accepted
            </p>
            {acceptedTier && (
              <p className="text-sm text-accepted-text/85 mt-1">
                You accepted the{" "}
                <span className="font-semibold">
                  {tierMeta(acceptedTier.label).label}
                </span>{" "}
                option —{" "}
                <Money
                  cents={
                    quoteTotals(acceptedTier.totalCents, taxRatePercent)
                      .totalCents
                  }
                  currency={currency}
                  size="xs"
                  tone="inherit"
                />
              </p>
            )}
            {quote.signedByName && (
              <p className="text-sm text-accepted-text/85 mt-1">
                Signed by {quote.signedByName}
                {quote.signedAt
                  ? ` on ${new Date(quote.signedAt).toLocaleDateString()}`
                  : ""}
              </p>
            )}
          </div>
        )}

        {quote.status === "DECLINED" && (
          <div className="rounded-2xl bg-closed-fill border border-line p-4">
            <p className="text-sm text-closed-text">
              This quote was declined. Get in touch if that was a mistake.
            </p>
          </div>
        )}

        {quote.status === "EXPIRED" && (
          <div className="rounded-2xl bg-closed-fill border border-line p-4">
            <p className="text-sm text-closed-text">
              This quote has expired. Call for an up-to-date price.
            </p>
          </div>
        )}

        {/* Photos */}
        {quote.photos.length > 0 && (
          <div>
            <h2 className="type-eyebrow text-[10px] text-ink-muted mb-3">
              Photos
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {quote.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-xl overflow-hidden aspect-square bg-surface border border-line"
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? "Job photo"}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tiers */}
        <div>
          <h2 className="type-eyebrow text-[10px] text-ink-muted mb-3">
            Choose an option
          </h2>
          <div className="space-y-4">
            {quote.tiers.map((tier) => {
              const meta = tierMeta(tier.label);
              const totals = quoteTotals(tier.totalCents, taxRatePercent);
              const isAccepted = tier.id === quote.acceptedTierId;
              // Once a choice is made, keep it obvious which card it was
              const dimmed = Boolean(acceptedTier) && !isAccepted;
              return (
                <div
                  key={tier.id}
                  className={`relative rounded-2xl border-2 p-4 ${
                    isAccepted
                      ? "border-accepted-rail bg-accepted-fill"
                      : meta.card
                  } ${dimmed ? "opacity-50" : ""}`}
                >
                  {meta.recommended && !acceptedTier && (
                    <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-amber px-2.5 py-0.5 text-[10px] font-bold text-ink">
                      <StarIcon size={11} />
                      Most clients pick this
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="type-display text-lg font-extrabold flex items-center gap-2">
                      {meta.label}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accepted-rail text-paper">
                          <CheckIcon size={11} />
                          Accepted
                        </span>
                      )}
                    </span>
                    <Money
                      cents={totals.totalCents}
                      currency={currency}
                      size="lg"
                    />
                  </div>
                  {tier.description && (
                    <p className="text-sm text-ink-muted mb-3 leading-relaxed">
                      {tier.description}
                    </p>
                  )}
                  {tier.lineItems.length > 0 && (
                    <ul className="space-y-1.5">
                      {tier.lineItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between gap-4 text-sm"
                        >
                          <span className="text-ink-muted min-w-0">
                            {item.description}
                          </span>
                          <Money
                            cents={item.totalCents}
                            currency={currency}
                            size="xs"
                          />
                        </li>
                      ))}
                    </ul>
                  )}

                  {taxRatePercent > 0 && (
                    <div className="mt-3 pt-3 border-t border-ink/10 space-y-1.5 text-sm">
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
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <Money
                          cents={totals.totalCents}
                          currency={currency}
                          size="xs"
                        />
                      </div>
                    </div>
                  )}

                  {isActive && (
                    <Link
                      href={`/q/${token}/sign?tier=${tier.id}`}
                      className={buttonClass({
                        // Amber is the app's action colour, and accepting is the
                        // only thing this page is asking anyone to do.
                        variant: meta.recommended ? "accent" : "primary",
                        size: "lg",
                        block: true,
                        className: "mt-4",
                      })}
                    >
                      Accept {meta.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Decline */}
        {isActive && (
          <div className="text-center pt-1 pb-4">
            <form action={`/q/${token}/decline`} method="POST">
              <button
                type="submit"
                className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink transition-colors"
              >
                No thanks, decline this quote
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
