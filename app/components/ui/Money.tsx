import { formatMoney } from "@/lib/money";

/**
 * The one place money is rendered.
 *
 * Every figure in a quoting app is the thing the user actually came for, so it
 * gets a treatment of its own: IBM Plex Mono with tabular numerals so totals
 * line up down a column, and the currency symbol dropped a step in size and
 * weight so the number itself carries the emphasis. Same rule on the dashboard,
 * the quote detail, the editor, the client view and the marketing mockups.
 *
 * Formatting itself stays in `formatMoney()` — this only splits the leading
 * symbol off the digits so it can be styled separately.
 */

const SIZES = {
  xs: { amount: "text-sm", symbol: "text-[11px]" },
  sm: { amount: "text-base", symbol: "text-xs" },
  md: { amount: "text-xl", symbol: "text-sm" },
  lg: { amount: "text-2xl", symbol: "text-base" },
  xl: { amount: "text-[2rem] leading-none", symbol: "text-lg" },
} as const;

// A `tone` prop rather than letting callers pass `text-amber` through
// className: two colour utilities in one class attribute are resolved by
// stylesheet order, not attribute order, so the override wouldn't reliably win.
const TONES = {
  default: { amount: "text-ink", symbol: "text-ink-muted" },
  invert: { amount: "text-paper", symbol: "text-paper-muted" },
  accent: { amount: "text-amber", symbol: "text-amber/60" },
  muted: { amount: "text-ink-muted", symbol: "text-ink-muted/60" },
  /** Takes the surrounding text colour — for figures sitting inside a sentence
   *  in a coloured banner. */
  inherit: { amount: "", symbol: "opacity-70" },
} as const;

export function Money({
  cents,
  currency,
  size = "sm",
  tone = "default",
  className = "",
}: {
  cents: number;
  currency?: string;
  size?: keyof typeof SIZES;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const text = formatMoney(cents, currency);
  // "$1,234.50" → ["$", "1,234.50"]; "KES 1,234.50" → ["KES ", "1,234.50"].
  // Anything Intl puts the symbol after (rare in this app's currency list)
  // falls through with an empty prefix and simply renders whole.
  const split = /^([^\d]*)(.*)$/.exec(text);
  const symbol = (split?.[1] ?? "").trim();
  const amount = split?.[2] || text;
  const s = SIZES[size];
  const t = TONES[tone];

  // "$" sits tight against the digits; a three-letter code like "KES" or "AED"
  // is a word and runs into them without a real space.
  const gap = symbol.length > 1 ? "mr-1.5" : "mr-0.5";

  return (
    <span
      className={`type-num font-semibold ${t.amount} ${s.amount} ${className}`}
    >
      {symbol && (
        <span className={`${s.symbol} ${t.symbol} font-medium ${gap}`}>
          {symbol}
        </span>
      )}
      {amount}
    </span>
  );
}
