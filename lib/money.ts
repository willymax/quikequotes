import { DEFAULT_CURRENCY, normalizeCurrency } from "@/lib/currency";

/**
 * Money is stored as integer cents everywhere in this app. Formatting used to be
 * `$${(cents / 100).toLocaleString()}` inline on each page, which renders 123450
 * as "$1,234.5" and hardcodes the dollar sign for every business.
 *
 * The currency comes from the quote (snapshotted from the business profile at
 * creation), so changing the Settings currency never relabels amounts on quotes
 * that are already out with clients.
 */
export function formatMoney(
  cents: number,
  currency: string = DEFAULT_CURRENCY
): string {
  const code = normalizeCurrency(currency);
  const amount = cents / 100;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Intl throws on an unknown code — still show the amount, just prefixed
    return `${code} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

export type Totals = {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
};

/** Splits a tier subtotal into subtotal / tax / total for a given percentage rate. */
export function quoteTotals(
  subtotalCents: number,
  ratePercent: number
): Totals {
  const rate = Number.isFinite(ratePercent) ? ratePercent : 0;
  const taxCents = rate > 0 ? Math.round((subtotalCents * rate) / 100) : 0;
  return {
    subtotalCents,
    taxCents,
    totalCents: subtotalCents + taxCents,
  };
}

/** Trims the trailing ".00" that Decimal round-trips add, for display in inputs. */
export function formatRate(ratePercent: number): string {
  return String(Number(ratePercent));
}
