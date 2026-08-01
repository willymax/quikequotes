export const TRADE_LABELS: Record<string, string> = {
  PAINTING: "Painting",
  PRESSURE_WASHING: "Pressure Washing",
  CLEANING: "Cleaning",
  HVAC: "HVAC",
  LANDSCAPING: "Landscaping",
  FUMIGATION: "Fumigation",
  MOVING_SERVICES: "Moving Services",
  OTHER: "Other",
};

export function tradeLabel(tradeType: string): string {
  return TRADE_LABELS[tradeType] ?? tradeType;
}

type TemplateLike = { userId: string | null; tradeType: string };

/**
 * Which templates to show by default.
 *
 * System templates are filtered to the business's own trade so the picker stays
 * short on a phone. Templates the user saved themselves always show — they built
 * them deliberately, and a painter who also pressure-washes shouldn't lose their
 * own work to a profile setting. `allTrades` is the escape hatch for browsing
 * every system template.
 */
export function matchesTrade(
  template: TemplateLike,
  userTradeType: string,
  allTrades: boolean
): boolean {
  if (allTrades) return true;
  if (template.userId !== null) return true;
  return template.tradeType === userTradeType;
}
