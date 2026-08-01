import Link from "next/link";
import { notFound } from "next/navigation";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { TierEditor } from "./TierEditor";
import { PhotoManager } from "./PhotoManager";
import { QuoteDetailsEditor } from "./QuoteDetailsEditor";

export default async function QuoteEditPage({
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

  // Prisma Decimal isn't serializable across the Server→Client boundary
  const taxRatePercent = Number(quote.taxRatePercent);

  const tiers = quote.tiers.map((tier) => ({
    ...tier,
    lineItems: tier.lineItems.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
    })),
  }));

  const templates = await db.template.findMany({
    where: {
      OR: [{ userId: null }, { userId: user.id }],
    },
    select: { id: true, name: true, tradeType: true },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return (
    <>
      {/* pb-32 clears the fixed action bar + the app's bottom nav */}
      <div className="max-w-lg mx-auto px-4 py-8 pb-32 space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/quotes/${id}`} className="text-zinc-500 hover:text-zinc-900">
            ← Back
          </Link>
          <h1 className="text-xl font-bold truncate">{quote.title}</h1>
        </div>

        <QuoteDetailsEditor
          quote={{
            id: quote.id,
            title: quote.title,
            clientName: quote.clientName,
            clientEmail: quote.clientEmail,
            clientPhone: quote.clientPhone,
            jobAddress: quote.jobAddress,
            notes: quote.notes,
            validUntil: quote.validUntil
              ? quote.validUntil.toISOString().slice(0, 10)
              : null,
            taxRatePercent,
          }}
        />

        <TierEditor
          tiers={tiers}
          quoteId={id}
          templates={templates}
          taxRatePercent={taxRatePercent}
        />
        <PhotoManager quoteId={id} photos={quote.photos} />
      </div>

      {/* Action bar — sits above the fixed h-16 bottom nav in (app)/layout.tsx */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-zinc-200">
        <div className="max-w-lg mx-auto px-4 py-3 space-y-1.5">
          <div className="flex gap-3">
            <a
              href={`/q/${quote.shareToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-11 rounded-xl border border-zinc-300 font-medium text-sm flex items-center justify-center"
            >
              Preview as client
            </a>
            <Link
              href={`/quotes/${id}`}
              className="flex-1 h-11 rounded-xl bg-zinc-900 text-white font-semibold text-sm flex items-center justify-center"
            >
              Done — Review &amp; Send
            </Link>
          </div>
          <p className="text-[11px] text-zinc-400 text-center">
            Changes save automatically
          </p>
        </div>
      </div>
    </>
  );
}
