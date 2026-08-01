/**
 * Supported currencies. Money is stored as integer minor units ("cents") in every
 * currency, so this list is deliberately limited to two-decimal currencies —
 * adding a zero-decimal one (JPY, KRW) would make the stored integers mean
 * something different and every existing amount would be off by 100x.
 */
export const CURRENCIES = [
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "CAD", label: "Canadian Dollar (CAD)" },
  { code: "AUD", label: "Australian Dollar (AUD)" },
  { code: "NZD", label: "New Zealand Dollar (NZD)" },
  { code: "KES", label: "Kenyan Shilling (KES)" },
  { code: "TZS", label: "Tanzanian Shilling (TZS)" },
  { code: "UGX", label: "Ugandan Shilling (UGX)" },
  { code: "NGN", label: "Nigerian Naira (NGN)" },
  { code: "GHS", label: "Ghanaian Cedi (GHS)" },
  { code: "ZAR", label: "South African Rand (ZAR)" },
  { code: "AED", label: "UAE Dirham (AED)" },
  { code: "INR", label: "Indian Rupee (INR)" },
  { code: "PHP", label: "Philippine Peso (PHP)" },
  { code: "SGD", label: "Singapore Dollar (SGD)" },
  { code: "MXN", label: "Mexican Peso (MXN)" },
  { code: "BRL", label: "Brazilian Real (BRL)" },
] as const;

export const DEFAULT_CURRENCY = "USD";

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

export function isSupportedCurrency(code: string): boolean {
  return (CURRENCY_CODES as readonly string[]).includes(code);
}

/** Falls back to the default rather than rendering an amount with no unit. */
export function normalizeCurrency(code: string | null | undefined): string {
  return code && isSupportedCurrency(code) ? code : DEFAULT_CURRENCY;
}
