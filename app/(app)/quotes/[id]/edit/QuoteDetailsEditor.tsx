"use client";

import { useState, useTransition } from "react";
import { updateQuote } from "@/app/actions/quotes";

type QuoteDetails = {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  jobAddress: string | null;
  notes: string | null;
  validUntil: string | null;
  taxRatePercent: number;
};

const INPUT_CLASS =
  "w-full h-12 px-4 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900";

export function QuoteDetailsEditor({ quote }: { quote: QuoteDetails }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateQuote(quote.id, {
        title: String(fd.get("title") ?? ""),
        clientName: String(fd.get("clientName") ?? ""),
        clientEmail: String(fd.get("clientEmail") ?? ""),
        clientPhone: String(fd.get("clientPhone") ?? ""),
        jobAddress: String(fd.get("jobAddress") ?? ""),
        notes: String(fd.get("notes") ?? ""),
        validUntil: String(fd.get("validUntil") ?? ""),
        taxRatePercent: Number(fd.get("taxRatePercent") ?? 0),
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <details className="rounded-2xl border border-zinc-200">
      <summary className="p-4 cursor-pointer list-none flex items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="block font-semibold text-sm truncate">
            Client &amp; Job Details
          </span>
          <span className="block text-xs text-zinc-500 truncate">
            {quote.clientName} · {quote.title}
          </span>
        </span>
        <span className="text-xs text-zinc-400 shrink-0">Edit</span>
      </summary>

      <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="title">
            Quote Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={200}
            defaultValue={quote.title}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="clientName">
            Client Name <span className="text-red-500">*</span>
          </label>
          <input
            id="clientName"
            name="clientName"
            type="text"
            required
            maxLength={100}
            defaultValue={quote.clientName}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="clientPhone">
            Client Phone
          </label>
          <input
            id="clientPhone"
            name="clientPhone"
            type="tel"
            maxLength={30}
            defaultValue={quote.clientPhone ?? ""}
            placeholder="+1 555 000 0000"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="clientEmail">
            Client Email
          </label>
          <input
            id="clientEmail"
            name="clientEmail"
            type="email"
            defaultValue={quote.clientEmail ?? ""}
            placeholder="john@example.com"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="jobAddress">
            Job Address
          </label>
          <input
            id="jobAddress"
            name="jobAddress"
            type="text"
            maxLength={200}
            defaultValue={quote.jobAddress ?? ""}
            placeholder="123 Main St, City, State"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="validUntil">
            Valid Until
          </label>
          <input
            id="validUntil"
            name="validUntil"
            type="date"
            defaultValue={quote.validUntil ?? ""}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            htmlFor="taxRatePercent"
          >
            Tax Rate (%)
          </label>
          <input
            id="taxRatePercent"
            name="taxRatePercent"
            type="number"
            min="0"
            max="100"
            step="any"
            inputMode="decimal"
            onFocus={(e) => e.currentTarget.select()}
            defaultValue={String(quote.taxRatePercent)}
            className={INPUT_CLASS}
          />
          <p className="mt-1.5 text-xs text-zinc-500">
            Applies to this quote only. Defaults from your business profile.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={1000}
            defaultValue={quote.notes ?? ""}
            placeholder="Any special instructions or scope details..."
            className="w-full px-4 py-3 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {saved && !isPending && (
          <p className="text-sm text-green-600">Details saved.</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 rounded-xl bg-zinc-900 text-white font-semibold text-sm disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save Details"}
        </button>
      </form>
    </details>
  );
}
