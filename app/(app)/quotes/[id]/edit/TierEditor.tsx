"use client";

import { useState, useTransition } from "react";
import {
  addLineItem,
  updateLineItem,
  deleteLineItem,
  updateTierDescription,
  addTier,
  deleteTier,
} from "@/app/actions/quotes";
import { applyTemplate, createCustomTemplate } from "@/app/actions/templates";
import { quoteTotals } from "@/lib/money";
import { tierLabel } from "@/lib/status";
import { buttonClass, inputClass } from "@/lib/ui";
import { Money } from "@/app/components/ui/Money";
import { matchesTrade, tradeLabel } from "@/lib/trades";
import { TradeFilterChips } from "@/app/components/TradeFilterChips";

type Template = {
  id: string;
  name: string;
  tradeType: string;
  userId: string | null;
};

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitCents: number;
  totalCents: number;
  sortOrder: number;
};

type Tier = {
  id: string;
  label: string;
  description: string | null;
  totalCents: number;
  lineItems: LineItem[];
};

const ALL_TIER_LABELS = ["GOOD", "BETTER", "BEST"];

/** Tapping a number field should replace it, not drop a caret mid-value. */
const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  e.currentTarget.select();

export function TierEditor({
  tiers,
  quoteId,
  templates,
  taxRatePercent,
  userTradeType,
  currency,
}: {
  tiers: Tier[];
  quoteId: string;
  templates: Template[];
  taxRatePercent: number;
  userTradeType: string;
  currency: string;
}) {
  const [activeTab, setActiveTab] = useState(tiers[0]?.label ?? "GOOD");

  // Fall back to the first tier when the active one has just been removed
  const activeTier = tiers.find((t) => t.label === activeTab) ?? tiers[0];

  return (
    <div>
      <TemplateToolbar
        quoteId={quoteId}
        templates={templates}
        userTradeType={userTradeType}
      />

      {/* Tab selector */}
      <div className="flex rounded-xl border border-line overflow-hidden mb-4">
        {tiers.map((tier) => {
          const active = activeTier?.id === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => setActiveTab(tier.label)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                active
                  ? "bg-ink text-paper"
                  : "bg-surface text-ink-muted hover:bg-surface-sunk"
              }`}
            >
              {tierLabel(tier.label)}
              <span className="block mt-1">
                <Money
                  cents={
                    quoteTotals(tier.totalCents, taxRatePercent).totalCents
                  }
                  currency={currency}
                  size="xs"
                  tone={active ? "invert" : "muted"}
                />
              </span>
            </button>
          );
        })}
      </div>

      <AddTierControl quoteId={quoteId} tiers={tiers} />

      {activeTier && (
        <TierLineItems
          tier={activeTier}
          taxRatePercent={taxRatePercent}
          canRemove={tiers.length > 1}
          currency={currency}
        />
      )}
    </div>
  );
}

function AddTierControl({ quoteId, tiers }: { quoteId: string; tiers: Tier[] }) {
  const [isPending, startTransition] = useTransition();
  const present = new Set(tiers.map((t) => t.label));
  const missing = ALL_TIER_LABELS.filter((label) => !present.has(label));

  if (missing.length === 0) return null;

  return (
    <div className="flex gap-2 mb-4">
      {missing.map((label) => (
        <button
          key={label}
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await addTier(quoteId, label);
              if (result?.error) alert(result.error);
            })
          }
          className={buttonClass({ variant: "dashed", size: "sm", className: "flex-1" })}
        >
          + Add {tierLabel(label)} option
        </button>
      ))}
    </div>
  );
}

function TierLineItems({
  tier,
  taxRatePercent,
  canRemove,
  currency,
}: {
  tier: Tier;
  taxRatePercent: number;
  canRemove: boolean;
  currency: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const totals = quoteTotals(tier.totalCents, taxRatePercent);

  function handleRemoveTier() {
    if (
      !window.confirm(
        `Remove the ${tierLabel(tier.label)} option and all of its line items?`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteTier(tier.id);
      if (result?.error) alert(result.error);
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{tierLabel(tier.label)}</span>
        <Money cents={totals.totalCents} currency={currency} size="md" />
      </div>

      <TierDescriptionEditor tier={tier} />

      {tier.lineItems.map((item) => (
        <LineItemRow key={item.id} item={item} currency={currency} />
      ))}

      {adding ? (
        <AddLineItemForm tierId={tier.id} onDone={() => setAdding(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={buttonClass({ variant: "dashed", block: true })}
        >
          + Add line item
        </button>
      )}

      {taxRatePercent > 0 && (
        <div className="pt-3 border-t border-line space-y-1.5 text-sm">
          <div className="flex justify-between text-ink-muted">
            <span>Subtotal</span>
            <Money
              cents={totals.subtotalCents}
              currency={currency}
              size="xs"
              tone="muted"
            />
          </div>
          <div className="flex justify-between text-ink-muted">
            <span>Tax ({Number(taxRatePercent)}%)</span>
            <Money
              cents={totals.taxCents}
              currency={currency}
              size="xs"
              tone="muted"
            />
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <Money cents={totals.totalCents} currency={currency} size="xs" />
          </div>
        </div>
      )}

      {canRemove && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleRemoveTier}
          className={buttonClass({ variant: "danger", size: "sm", block: true })}
        >
          {isPending ? "Removing…" : `Remove ${tierLabel(tier.label)} option`}
        </button>
      )}
    </div>
  );
}

function LineItemRow({ item, currency }: { item: LineItem; currency: string }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return <EditLineItemForm item={item} onDone={() => setEditing(false)} />;
  }

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{item.description}</p>
        <p className="text-xs text-ink-muted">
          {Number(item.quantity)} ×{" "}
          <Money
            cents={item.unitCents}
            currency={currency}
            size="xs"
            tone="inherit"
          />
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Money cents={item.totalCents} currency={currency} size="xs" />
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs font-semibold text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() => { void deleteLineItem(item.id); })
          }
          className="text-xs font-semibold text-danger underline underline-offset-4 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function AddLineItemForm({
  tierId,
  onDone,
}: {
  tierId: string;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const unitPrice = Number(formData.get("unitPrice"));
    formData.set("unitCents", String(Math.round(unitPrice * 100)));
    startTransition(async () => {
      await addLineItem(tierId, formData);
      onDone();
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }} className="space-y-2 pt-2 border-t border-line">
      <input
        name="description"
        type="text"
        required
        maxLength={200}
        placeholder="Description"
        className={inputClass()}
      />
      <div className="flex gap-2">
        <input
          name="quantity"
          type="number"
          required
          min="0.01"
          step="any"
          inputMode="decimal"
          onFocus={selectOnFocus}
          defaultValue="1"
          placeholder="Qty"
          className={inputClass({ full: false, className: "w-20" })}
        />
        <input
          name="unitPrice"
          type="number"
          required
          min="0"
          step="any"
          inputMode="decimal"
          onFocus={selectOnFocus}
          placeholder="Price ($)"
          className={inputClass({ full: false, className: "flex-1 min-w-0" })}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={buttonClass({ className: "flex-1" })}
        >
          {isPending ? "Adding…" : "Add"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className={buttonClass({ variant: "outline", className: "flex-1" })}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function EditLineItemForm({
  item,
  onDone,
}: {
  item: LineItem;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateLineItem(item.id, {
        description: String(data.get("description")),
        quantity: Number(data.get("quantity")),
        unitCents: Math.round(Number(data.get("unitPrice")) * 100),
      });
      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t border-line">
      <input
        name="description"
        type="text"
        required
        maxLength={200}
        defaultValue={item.description}
        className={inputClass()}
      />
      <div className="flex gap-2">
        <input
          name="quantity"
          type="number"
          required
          min="0.01"
          step="any"
          inputMode="decimal"
          onFocus={selectOnFocus}
          defaultValue={String(Number(item.quantity))}
          className={inputClass({ full: false, className: "w-20" })}
        />
        <input
          name="unitPrice"
          type="number"
          required
          min="0"
          step="any"
          inputMode="decimal"
          onFocus={selectOnFocus}
          defaultValue={String(item.unitCents / 100)}
          className={inputClass({ full: false, className: "flex-1 min-w-0" })}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={buttonClass({ className: "flex-1" })}
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className={buttonClass({ variant: "outline", className: "flex-1" })}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function TemplateToolbar({
  quoteId,
  templates,
  userTradeType,
}: {
  quoteId: string;
  templates: Template[];
  userTradeType: string;
}) {
  const [mode, setMode] = useState<"none" | "apply" | "save">("none");
  const [isPending, startTransition] = useTransition();
  const [saveName, setSaveName] = useState("");
  const [allTrades, setAllTrades] = useState(false);

  const visible = templates.filter((t) =>
    matchesTrade(t, userTradeType, allTrades)
  );

  function handleApply(templateId: string) {
    if (!window.confirm("This replaces all current line items in every tier. Continue?")) {
      return;
    }
    startTransition(async () => {
      const result = await applyTemplate(quoteId, templateId);
      if (result?.error) alert(result.error);
      setMode("none");
    });
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!saveName.trim()) return;
    startTransition(async () => {
      const result = await createCustomTemplate(quoteId, saveName.trim());
      if (result?.error) {
        alert(result.error);
      } else {
        alert("Saved as template.");
        setSaveName("");
        setMode("none");
      }
    });
  }

  if (mode === "none") {
    return (
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode("apply")}
          className={buttonClass({ variant: "outline", className: "flex-1" })}
        >
          Apply template
        </button>
        <button
          type="button"
          onClick={() => setMode("save")}
          className={buttonClass({ variant: "outline", className: "flex-1" })}
        >
          Save as template
        </button>
      </div>
    );
  }

  if (mode === "apply") {
    return (
      <div className="space-y-2 mb-4">
        <TradeFilterChips
          userTradeType={userTradeType}
          allTrades={allTrades}
          onChange={setAllTrades}
        />
        {visible.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No {tradeLabel(userTradeType)} templates yet — tap{" "}
            <strong>All trades</strong> to browse the rest.
          </p>
        ) : (
          visible.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={isPending}
              onClick={() => handleApply(t.id)}
              className="w-full p-3 rounded-2xl border-2 border-line bg-surface text-left hover:border-line-strong transition-colors disabled:opacity-50"
            >
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {tradeLabel(t.tradeType)}
                {t.userId !== null && " · Mine"}
              </p>
            </button>
          ))
        )}
        <button
          type="button"
          onClick={() => setMode("none")}
          className={buttonClass({ variant: "outline", block: true })}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-2 mb-4">
      <input
        type="text"
        required
        value={saveName}
        onChange={(e) => setSaveName(e.target.value)}
        placeholder="Template name"
        className={inputClass()}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={buttonClass({ className: "flex-1" })}
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setMode("none")}
          className={buttonClass({ variant: "outline", className: "flex-1" })}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function TierDescriptionEditor({ tier }: { tier: Tier }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(tier.description ?? "");

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      await updateTierDescription(tier.id, value);
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What's included in this option…"
          rows={3}
          className={inputClass({ size: "area" })}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className={buttonClass({ size: "sm", className: "flex-1" })}
          >
            {isPending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => { setValue(tier.description ?? ""); setEditing(false); }}
            className={buttonClass({ variant: "outline", size: "sm", className: "flex-1" })}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return tier.description ? (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="w-full text-left text-sm text-ink-muted hover:text-ink"
    >
      {tier.description}
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-xs font-semibold text-ink-muted underline underline-offset-4 hover:text-ink"
    >
      + Add description
    </button>
  );
}
