import Link from "next/link";
import { notFound } from "next/navigation";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SendQuoteButton } from "./SendQuoteButton";
import { CopyLinkButton } from "./CopyLinkButton";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-zinc-100 text-zinc-600" },
  SENT: { label: "Sent", color: "bg-blue-100 text-blue-700" },
  VIEWED: { label: "Viewed — client opened it!", color: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "Accepted", color: "bg-green-100 text-green-700" },
  DECLINED: { label: "Declined", color: "bg-red-100 text-red-600" },
  EXPIRED: { label: "Expired", color: "bg-zinc-100 text-zinc-500" },
};

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

  const badge = STATUS_LABELS[quote.status] ?? STATUS_LABELS.DRAFT;
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/q/${quote.shareToken}`;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight">{quote.title}</h1>
          <p className="text-zinc-500 mt-0.5">{quote.clientName}</p>
        </div>
        <span className={`shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-full ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/quotes/${quote.id}/edit`}
          className="flex-1 h-11 rounded-xl border border-zinc-300 font-medium text-sm flex items-center justify-center"
        >
          Edit
        </Link>
        {["DRAFT", "SENT", "VIEWED"].includes(quote.status) && (
          <SendQuoteButton quoteId={quote.id} status={quote.status} />
        )}
      </div>

      {/* Share link */}
      {quote.status !== "DRAFT" && (
        <div className="rounded-2xl bg-zinc-50 p-4">
          <p className="text-xs text-zinc-500 mb-1.5 font-medium">Client Link</p>
          <p className="text-sm font-mono break-all text-zinc-800">{publicUrl}</p>
          <CopyLinkButton publicUrl={publicUrl} />
        </div>
      )}

      {/* Tiers */}
      <div className="space-y-4">
        {quote.tiers.map((tier) => (
          <div key={tier.id} className="rounded-2xl border border-zinc-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm">
                {tier.label.charAt(0) + tier.label.slice(1).toLowerCase()}
              </span>
              <span className="font-bold text-lg">
                ${(tier.totalCents / 100).toLocaleString()}
              </span>
            </div>
            {tier.lineItems.length > 0 && (
              <ul className="space-y-1">
                {tier.lineItems.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm text-zinc-600">
                    <span>{item.description}</span>
                    <span>${(item.totalCents / 100).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Accepted info */}
      {quote.status === "ACCEPTED" && quote.signedByName && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-sm">
          <p className="font-semibold text-green-800">Quote Accepted</p>
          <p className="text-green-700 mt-0.5">
            Signed by <span className="font-medium">{quote.signedByName}</span>{" "}
            on {quote.signedAt ? new Date(quote.signedAt).toLocaleDateString() : "—"}
          </p>
        </div>
      )}
    </div>
  );
}
