import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney, quoteTotals } from "@/lib/money";

const TIER_COLORS: Record<string, string> = {
  GOOD: "border-zinc-200 bg-zinc-50",
  BETTER: "border-blue-200 bg-blue-50",
  BEST: "border-amber-200 bg-amber-50",
};

const TIER_LABELS: Record<string, string> = {
  GOOD: "Good",
  BETTER: "Better",
  BEST: "Best",
};

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
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Business header */}
      <div className="flex items-center gap-3">
        {quote.user.logoUrl ? (
          <Image
            src={quote.user.logoUrl}
            alt="Business logo"
            width={48}
            height={48}
            className="rounded-xl object-contain"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-bold text-lg">
            {quote.user.businessName?.[0] ?? "?"}
          </div>
        )}
        <div>
          <p className="font-bold">{quote.user.businessName}</p>
          {quote.user.phone && (
            <a href={`tel:${quote.user.phone}`} className="text-sm text-zinc-500">
              {quote.user.phone}
            </a>
          )}
        </div>
      </div>

      {/* Quote title */}
      <div>
        <h1 className="text-2xl font-bold">{quote.title}</h1>
        <p className="text-zinc-500 mt-1">
          Prepared for{" "}
          <span className="font-medium text-zinc-700">{quote.clientName}</span>
        </p>
        {quote.notes && (
          <p className="mt-3 text-sm text-zinc-600 leading-relaxed">{quote.notes}</p>
        )}
      </div>

      {/* Status banners */}
      {quote.status === "ACCEPTED" && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4">
          <p className="font-semibold text-green-800">Quote Accepted</p>
          {acceptedTier && (
            <p className="text-sm text-green-700 mt-0.5">
              You accepted the{" "}
              <span className="font-semibold">{TIER_LABELS[acceptedTier.label]}</span>{" "}
              option —{" "}
              <span className="font-semibold">
                {formatMoney(
                  quoteTotals(acceptedTier.totalCents, taxRatePercent).totalCents,
                  currency
                )}
              </span>
            </p>
          )}
          {quote.signedByName && (
            <p className="text-sm text-green-700 mt-0.5">
              Signed by {quote.signedByName}
              {quote.signedAt ? ` on ${new Date(quote.signedAt).toLocaleDateString()}` : ""}
            </p>
          )}
        </div>
      )}

      {quote.status === "DECLINED" && (
        <div className="rounded-2xl bg-zinc-100 border border-zinc-200 p-4">
          <p className="text-zinc-600">This quote was declined.</p>
        </div>
      )}

      {quote.status === "EXPIRED" && (
        <div className="rounded-2xl bg-zinc-100 border border-zinc-200 p-4">
          <p className="text-zinc-600">This quote has expired. Please contact us for a new one.</p>
        </div>
      )}

      {/* Photos */}
      {quote.photos.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Photos
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {quote.photos.map((photo) => (
              <div key={photo.id} className="rounded-xl overflow-hidden aspect-square bg-zinc-100">
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
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
          Options
        </h2>
        <div className="space-y-4">
          {quote.tiers.map((tier) => {
            const totals = quoteTotals(tier.totalCents, taxRatePercent);
            const isAccepted = tier.id === quote.acceptedTierId;
            // Once a choice is made, keep it obvious which card it was
            const dimmed = Boolean(acceptedTier) && !isAccepted;
            return (
              <div
                key={tier.id}
                className={`rounded-2xl border-2 p-4 ${
                  isAccepted
                    ? "border-green-400 bg-green-50 ring-2 ring-green-200"
                    : TIER_COLORS[tier.label]
                } ${dimmed ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg flex items-center gap-2">
                    {TIER_LABELS[tier.label]}
                    {isAccepted && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-600 text-white">
                        Accepted
                      </span>
                    )}
                  </span>
                  <span className="text-2xl font-bold">
                    {formatMoney(totals.totalCents, currency)}
                  </span>
                </div>
                {tier.description && (
                  <p className="text-sm text-zinc-600 mb-3">{tier.description}</p>
                )}
                {tier.lineItems.length > 0 && (
                  <ul className="space-y-1.5">
                    {tier.lineItems.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-zinc-700">{item.description}</span>
                        <span className="font-medium text-zinc-900">
                          {formatMoney(item.totalCents, currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {taxRatePercent > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-200/70 space-y-1 text-sm">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal</span>
                      <span>{formatMoney(totals.subtotalCents, currency)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Tax ({taxRatePercent}%)</span>
                      <span>{formatMoney(totals.taxCents, currency)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-zinc-900">
                      <span>Total</span>
                      <span>{formatMoney(totals.totalCents, currency)}</span>
                    </div>
                  </div>
                )}

                {isActive && (
                  <Link
                    href={`/q/${token}/sign?tier=${tier.id}`}
                    className="mt-4 block w-full h-12 rounded-xl bg-zinc-900 text-white font-semibold text-base flex items-center justify-center"
                  >
                    Accept This Option
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Decline */}
      {isActive && (
        <div className="text-center pt-2">
          <form action={`/q/${token}/decline`} method="POST">
            <button
              type="submit"
              className="text-sm text-zinc-400 underline underline-offset-2"
            >
              No thanks, decline this quote
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
