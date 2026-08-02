"use client";

import { tradeLabel } from "@/lib/trades";
import { chipClass } from "@/lib/ui";

/**
 * Two chips toggling a template list between the business's own trade and every
 * trade. Client-side only — the full list is already on the page, so flipping
 * this costs no round-trip.
 */
export function TradeFilterChips({
  userTradeType,
  allTrades,
  onChange,
}: {
  userTradeType: string;
  allTrades: boolean;
  onChange: (allTrades: boolean) => void;
}) {
  return (
    <div className="flex gap-2">
      <Chip active={!allTrades} onClick={() => onChange(false)}>
        {tradeLabel(userTradeType)}
      </Chip>
      <Chip active={allTrades} onClick={() => onChange(true)}>
        All trades
      </Chip>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={chipClass(active)}
    >
      {children}
    </button>
  );
}
