/**
 * Templates a user is allowed to see: system defaults (userId null) plus their
 * own. Trade filtering happens on display, not here — see `matchesTrade` in
 * `lib/trades.ts` — so the "All trades" toggle needs no extra round-trip.
 */
export function templateScope(userId: string) {
  return { OR: [{ userId: null }, { userId }] };
}

/** Shared ordering: system defaults first, then alphabetical. */
export const TEMPLATE_ORDER = [
  { isDefault: "desc" as const },
  { name: "asc" as const },
];
