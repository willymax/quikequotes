/**
 * Shared class builders for the QuikeQuotes UI.
 *
 * These are functions returning class strings rather than React components on
 * purpose: most of this app is Server Components rendering `<Link className=…>`
 * or `<form action={…}><button>`, and a component wrapper would either force a
 * client boundary or need a polymorphic `as` prop for every call site. A string
 * composes everywhere.
 *
 * Before this existed the primary button was written inline 26 times across
 * five different heights, and the input class string was copy-pasted ~25 times.
 */

type Variant =
  | "primary" // ink — the main action on a screen
  | "accent" // amber — reserved for the money action (accept, send, start)
  | "outline" // secondary
  | "ghost" // tertiary, sits inside a card
  | "dashed" // "add another…" affordance
  | "danger"; // destructive

type Size = "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-soft",
  accent: "bg-amber text-ink hover:bg-amber-deep",
  outline: "border border-line-strong text-ink bg-surface hover:bg-surface-sunk",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface-sunk",
  dashed:
    "border border-dashed border-line-strong text-ink-muted hover:border-ink-muted hover:text-ink",
  danger:
    "border border-danger-line text-danger bg-surface hover:bg-danger-fill",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-xs gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  xl: "h-14 px-8 text-lg gap-2.5",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  pill = false,
  block = false,
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  /** Fully rounded — used for chips-as-buttons and the marketing CTAs. */
  pill?: boolean;
  block?: boolean;
  className?: string;
} = {}): string {
  return [
    "inline-flex items-center justify-center font-semibold whitespace-nowrap",
    "transition-colors disabled:opacity-60 disabled:pointer-events-none",
    pill ? "rounded-full" : "rounded-xl",
    block ? "w-full" : "",
    SIZES[size],
    VARIANTS[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Text inputs, selects and textareas. `text-base` on the md size is deliberate:
 * iOS Safari zooms the viewport when a focused input is under 16px, which on a
 * phone-first quoting app means every tap into a field jolts the layout.
 */
export function inputClass({
  size = "md",
  full = true,
  className = "",
}: {
  /** `area` is for `<textarea>` — no fixed height. */
  size?: "sm" | "md" | "area";
  /** Off for the inline `<select>` in the dashboard's search bar. */
  full?: boolean;
  className?: string;
} = {}): string {
  const sizing = {
    sm: "h-10 px-3 text-sm",
    md: "h-12 px-4 text-base",
    area: "px-4 py-3 text-base resize-none",
  }[size];

  return [
    full ? "w-full" : "",
    "rounded-xl border border-line-strong bg-surface text-ink",
    "placeholder:text-paper-muted",
    "focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/15",
    "disabled:opacity-60",
    sizing,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function labelClass(className = ""): string {
  return `block text-xs font-semibold text-ink-muted mb-1.5 ${className}`.trim();
}

export function cardClass({
  sunk = false,
  interactive = false,
  className = "",
}: {
  /** Inset panel (summary blocks, share link) rather than a raised card. */
  sunk?: boolean;
  interactive?: boolean;
  className?: string;
} = {}): string {
  return [
    "rounded-2xl",
    sunk ? "bg-surface-sunk" : "bg-surface border border-line",
    interactive ? "transition-colors hover:border-line-strong" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Filter/tab pills. Previously copy-pasted verbatim in three files. */
export function chipClass(active: boolean, className = ""): string {
  return [
    "h-8 px-3 rounded-full text-xs font-semibold flex items-center shrink-0",
    "transition-colors",
    active
      ? "bg-ink text-paper"
      : "border border-line-strong text-ink-muted hover:bg-surface-sunk hover:text-ink",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/** The page shell every app and public screen uses. */
export const PAGE_SHELL = "max-w-lg mx-auto px-4 py-8";
