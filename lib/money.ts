/**
 * Money is stored as integer cents everywhere in this app. Formatting used to be
 * `(cents / 100).toLocaleString()` inline on each page, which renders 123450 as
 * "$1,234.5" — fine while every price was round, wrong the moment tax is added.
 */

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
