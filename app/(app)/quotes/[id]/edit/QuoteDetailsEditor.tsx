"use client";

import { useState, useTransition } from "react";
import { updateQuote } from "@/app/actions/quotes";
import { CURRENCIES } from "@/lib/currency";
import { buttonClass, inputClass, labelClass } from "@/lib/ui";

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
  currency: string;
};

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
        currency: String(fd.get("currency") ?? quote.currency),
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <details className="rounded-2xl border border-line bg-surface">
      <summary className="p-4 cursor-pointer list-none flex items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="block font-semibold text-sm truncate">
            Client &amp; job details
          </span>
          <span className="block text-xs text-ink-muted truncate">
            {quote.clientName} · {quote.title}
          </span>
        </span>
        <span className="text-xs font-semibold text-ink-muted shrink-0">Edit</span>
      </summary>

      <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-4">
        <div>
          <label className={labelClass()} htmlFor="title">
            Quote title <span className="text-danger">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={200}
            defaultValue={quote.title}
            className={inputClass()}
          />
        </div>

        <div>
          <label className={labelClass()} htmlFor="clientName">
            Client name <span className="text-danger">*</span>
          </label>
          <input
            id="clientName"
            name="clientName"
            type="text"
            required
            maxLength={100}
            defaultValue={quote.clientName}
            className={inputClass()}
          />
        </div>

        <div>
          <label className={labelClass()} htmlFor="clientPhone">
            Client phone
          </label>
          <input
            id="clientPhone"
            name="clientPhone"
            type="tel"
            maxLength={30}
            defaultValue={quote.clientPhone ?? ""}
            placeholder="+1 555 000 0000"
            className={inputClass()}
          />
        </div>

        <div>
          <label className={labelClass()} htmlFor="clientEmail">
            Client email
          </label>
          <input
            id="clientEmail"
            name="clientEmail"
            type="email"
            defaultValue={quote.clientEmail ?? ""}
            placeholder="john@example.com"
            className={inputClass()}
          />
        </div>

        <div>
          <label className={labelClass()} htmlFor="jobAddress">
            Job address
          </label>
          <input
            id="jobAddress"
            name="jobAddress"
            type="text"
            maxLength={200}
            defaultValue={quote.jobAddress ?? ""}
            placeholder="123 Main St, City, State"
            className={inputClass()}
          />
        </div>

        <div>
          <label className={labelClass()} htmlFor="validUntil">
            Valid until
          </label>
          <input
            id="validUntil"
            name="validUntil"
            type="date"
            defaultValue={quote.validUntil ?? ""}
            className={inputClass()}
          />
        </div>

        <div>
          <label
            className={labelClass()}
            htmlFor="taxRatePercent"
          >
            Tax rate (%)
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
            className={inputClass()}
          />
          <p className="mt-2 text-xs text-ink-muted leading-relaxed">
            Applies to this quote only. Defaults from your business profile.
          </p>
        </div>

        <div>
          <label className={labelClass()} htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={quote.currency}
            className={inputClass()}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-ink-muted leading-relaxed">
            Relabels this quote only — amounts are not converted.
          </p>
        </div>

        <div>
          <label className={labelClass()} htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={1000}
            defaultValue={quote.notes ?? ""}
            placeholder="Special instructions or scope details…"
            className={inputClass({ size: "area" })}
          />
        </div>

        {error && <p className="text-sm text-danger font-semibold">{error}</p>}
        {saved && !isPending && (
          <p className="text-sm text-accepted-text font-semibold">Details saved.</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={buttonClass({ block: true })}
        >
          {isPending ? "Saving…" : "Save details"}
        </button>
      </form>
    </details>
  );
}
