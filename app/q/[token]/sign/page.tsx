import { notFound } from "next/navigation";
import { db } from "@/lib/db";
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

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <a href={`/q/${token}`} className="text-zinc-500 hover:text-zinc-900 text-sm">
        ← Back to quote
      </a>

      <div>
        <h1 className="text-2xl font-bold">Accept Quote</h1>
        <p className="text-zinc-500 mt-1">
          You&apos;re accepting the{" "}
          <span className="font-semibold capitalize text-zinc-700">
            {selectedTier.label.toLowerCase()}
          </span>{" "}
          option for{" "}
          <span className="font-semibold text-zinc-700">
            ${(selectedTier.totalCents / 100).toLocaleString()}
          </span>
        </p>
      </div>

      <SignatureCapture
        token={token}
        tierId={selectedTier.id}
        clientName={quote.clientName}
      />
    </div>
  );
}
