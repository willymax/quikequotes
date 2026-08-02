/**
 * Single source of truth for how a quote's status and tiers are presented.
 *
 * This used to be three separate literals: `STATUS_LABELS` duplicated in the
 * dashboard and the quote detail page, and `TIER_COLORS` duplicated in the
 * public client view and the tier editor **with different values**, so the same
 * tier rendered a different colour depending on which screen you were on.
 */

/** The colour bar down the left edge of a quote card — the job-ticket tab. */
export type StatusMeta = {
  /** Short form, used in lists. */
  label: string;
  /** Longer form for the detail page, where there's room to say why it matters. */
  longLabel: string;
  /** Badge fill + text. */
  badge: string;
  /** Solid left-edge rail colour. */
  rail: string;
};

export const STATUS_META: Record<string, StatusMeta> = {
  DRAFT: {
    label: "Draft",
    longLabel: "Draft — not sent yet",
    badge: "bg-draft-fill text-draft-text",
    rail: "border-l-draft-rail",
  },
  SENT: {
    label: "Sent",
    longLabel: "Sent — waiting on the client",
    badge: "bg-sent-fill text-sent-text",
    rail: "border-l-sent-rail",
  },
  // Amber, matching the brand's attention colour: a quote the client has opened
  // is the one worth chasing today, and the rail is what makes it findable in a
  // list at arm's length on a phone.
  VIEWED: {
    label: "Viewed",
    longLabel: "Viewed — the client opened it",
    badge: "bg-viewed-fill text-viewed-text",
    rail: "border-l-viewed-rail",
  },
  ACCEPTED: {
    label: "Accepted",
    longLabel: "Accepted",
    badge: "bg-accepted-fill text-accepted-text",
    rail: "border-l-accepted-rail",
  },
  DECLINED: {
    label: "Declined",
    longLabel: "Declined",
    badge: "bg-closed-fill text-closed-text",
    rail: "border-l-closed-rail",
  },
  EXPIRED: {
    label: "Expired",
    longLabel: "Expired",
    badge: "bg-closed-fill text-closed-text",
    rail: "border-l-closed-rail",
  },
};

export function statusMeta(status: string): StatusMeta {
  return STATUS_META[status] ?? STATUS_META.DRAFT;
}

export const BADGE_CLASS =
  "shrink-0 inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full";

export type TierMeta = {
  label: string;
  /** One-word framing shown under the tier name on the client view. */
  note: string;
  /** Card treatment on the public quote. */
  card: string;
  /**
   * The middle option is the one most clients take, and it's what the marketing
   * mockups show highlighted — so the product highlights it too.
   */
  recommended: boolean;
};

export const TIER_META: Record<string, TierMeta> = {
  GOOD: {
    label: "Good",
    note: "The essentials",
    card: "border-line bg-surface",
    recommended: false,
  },
  BETTER: {
    label: "Better",
    note: "Most clients pick this",
    card: "border-amber bg-amber-wash",
    recommended: true,
  },
  BEST: {
    label: "Best",
    note: "Everything included",
    card: "border-line bg-surface",
    recommended: false,
  },
};

export function tierMeta(label: string): TierMeta {
  return (
    TIER_META[label] ?? {
      label: label.charAt(0) + label.slice(1).toLowerCase(),
      note: "",
      card: "border-line bg-surface",
      recommended: false,
    }
  );
}

/** Just the display name — the common case. */
export function tierLabel(label: string): string {
  return tierMeta(label).label;
}
