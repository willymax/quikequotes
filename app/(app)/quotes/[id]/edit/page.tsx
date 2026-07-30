import { notFound } from "next/navigation";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { TierEditor } from "./TierEditor";
import { PhotoManager } from "./PhotoManager";

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
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <a href={`/quotes/${id}`} className="text-zinc-500 hover:text-zinc-900">
          ← Back
        </a>
        <h1 className="text-xl font-bold truncate">{quote.title}</h1>
      </div>

      <TierEditor tiers={tiers} quoteId={id} templates={templates} />
      <PhotoManager quoteId={id} photos={quote.photos} />
    </div>
  );
}
