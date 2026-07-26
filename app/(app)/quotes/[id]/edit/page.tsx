import { notFound } from "next/navigation";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { TierEditor } from "./TierEditor";

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
    },
  });

  if (!quote) notFound();

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <a href={`/quotes/${id}`} className="text-zinc-500 hover:text-zinc-900">
          ← Back
        </a>
        <h1 className="text-xl font-bold truncate">{quote.title}</h1>
      </div>

      <TierEditor tiers={quote.tiers} quoteId={id} />
    </div>
  );
}
