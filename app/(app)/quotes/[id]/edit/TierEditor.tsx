"use client";

import { useState, useTransition } from "react";
import {
  addLineItem,
  updateLineItem,
  deleteLineItem,
  updateTierDescription,
} from "@/app/actions/quotes";
import { applyTemplate, createCustomTemplate } from "@/app/actions/templates";

type Template = { id: string; name: string; tradeType: string };

const TRADE_LABELS: Record<string, string> = {
  PAINTING: "Painting",
  PRESSURE_WASHING: "Pressure Washing",
  CLEANING: "Cleaning",
  HVAC: "HVAC",
  LANDSCAPING: "Landscaping",
  FUMIGATION: "Fumigation",
  MOVING_SERVICES: "Moving Services",
  OTHER: "Other",
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

const TIER_COLORS: Record<string, string> = {
  GOOD: "border-zinc-200",
  BETTER: "border-blue-200",
  BEST: "border-amber-200",
};

const TIER_LABELS: Record<string, string> = {
  GOOD: "Good",
  BETTER: "Better",
  BEST: "Best",
};

export function TierEditor({
  tiers,
  quoteId,
  templates,
}: {
  tiers: Tier[];
  quoteId: string;
  templates: Template[];
}) {
  const [activeTab, setActiveTab] = useState(tiers[0]?.label ?? "GOOD");

  const activeTier = tiers.find((t) => t.label === activeTab);

  return (
    <div>
      <TemplateToolbar quoteId={quoteId} templates={templates} />

      {/* Tab selector */}
      <div className="flex rounded-xl border border-zinc-200 overflow-hidden mb-6">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            type="button"
            onClick={() => setActiveTab(tier.label)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === tier.label
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {TIER_LABELS[tier.label]}
            <span className="block text-xs font-normal mt-0.5 opacity-75">
              ${(tier.totalCents / 100).toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      {activeTier && <TierLineItems tier={activeTier} quoteId={quoteId} />}
    </div>
  );
}

function TierLineItems({ tier, quoteId }: { tier: Tier; quoteId: string }) {
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);

  return (
    <div className={`rounded-2xl border-2 ${TIER_COLORS[tier.label]} p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{TIER_LABELS[tier.label]}</span>
        <span className="text-lg font-bold">${(tier.totalCents / 100).toLocaleString()}</span>
      </div>

      <TierDescriptionEditor tier={tier} />

      {tier.lineItems.map((item) => (
        <LineItemRow key={item.id} item={item} quoteId={quoteId} />
      ))}

      {adding ? (
        <AddLineItemForm
          tierId={tier.id}
          quoteId={quoteId}
          onDone={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full h-10 rounded-xl border border-dashed border-zinc-300 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-700 transition-colors"
        >
          + Add Line Item
        </button>
      )}
    </div>
  );
}

function LineItemRow({
  item,
  quoteId,
}: {
  item: LineItem;
  quoteId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <EditLineItemForm
        item={item}
        quoteId={quoteId}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{item.description}</p>
        <p className="text-xs text-zinc-500">
          {Number(item.quantity)} × ${(item.unitCents / 100).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold">
          ${(item.totalCents / 100).toLocaleString()}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-zinc-500 underline"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() => { void deleteLineItem(item.id); })
          }
          className="text-xs text-red-500 underline disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function AddLineItemForm({
  tierId,
  quoteId,
  onDone,
}: {
  tierId: string;
  quoteId: string;
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
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }} className="space-y-2 pt-2 border-t border-zinc-100">
      <input
        name="description"
        type="text"
        required
        placeholder="Description"
        className="w-full h-11 px-3 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />
      <div className="flex gap-2">
        <input
          name="quantity"
          type="number"
          required
          min="0.01"
          step="0.01"
          defaultValue="1"
          placeholder="Qty"
          className="w-20 h-11 px-3 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <input
          name="unitPrice"
          type="number"
          required
          min="0"
          step="0.01"
          placeholder="Price ($)"
          className="flex-1 h-11 px-3 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-10 rounded-xl bg-zinc-900 text-white text-sm font-medium disabled:opacity-60"
        >
          {isPending ? "Adding..." : "Add"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 h-10 rounded-xl border border-zinc-300 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function EditLineItemForm({
  item,
  quoteId,
  onDone,
}: {
  item: LineItem;
  quoteId: string;
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
    <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t border-zinc-100">
      <input
        name="description"
        type="text"
        required
        defaultValue={item.description}
        className="w-full h-11 px-3 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />
      <div className="flex gap-2">
        <input
          name="quantity"
          type="number"
          required
          min="0.01"
          step="0.01"
          defaultValue={String(item.quantity)}
          className="w-20 h-11 px-3 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <input
          name="unitPrice"
          type="number"
          required
          min="0"
          step="0.01"
          defaultValue={(item.unitCents / 100).toFixed(2)}
          className="flex-1 h-11 px-3 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-10 rounded-xl bg-zinc-900 text-white text-sm font-medium disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 h-10 rounded-xl border border-zinc-300 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function TemplateToolbar({ quoteId, templates }: { quoteId: string; templates: Template[] }) {
  const [mode, setMode] = useState<"none" | "apply" | "save">("none");
  const [isPending, startTransition] = useTransition();
  const [saveName, setSaveName] = useState("");

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
          className="flex-1 h-10 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Apply Template
        </button>
        <button
          type="button"
          onClick={() => setMode("save")}
          className="flex-1 h-10 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Save as Template
        </button>
      </div>
    );
  }

  if (mode === "apply") {
    return (
      <div className="space-y-2 mb-4">
        {templates.length === 0 ? (
          <p className="text-sm text-zinc-500">No templates available.</p>
        ) : (
          templates.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={isPending}
              onClick={() => handleApply(t.id)}
              className="w-full p-3 rounded-2xl border-2 border-zinc-200 text-left hover:border-zinc-400 transition-colors disabled:opacity-50"
            >
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {TRADE_LABELS[t.tradeType] ?? t.tradeType}
              </p>
            </button>
          ))
        )}
        <button
          type="button"
          onClick={() => setMode("none")}
          className="w-full h-10 rounded-xl border border-zinc-300 text-sm font-medium"
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
        className="w-full h-11 px-3 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-10 rounded-xl bg-zinc-900 text-white text-sm font-medium disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setMode("none")}
          className="flex-1 h-10 rounded-xl border border-zinc-300 text-sm font-medium"
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
          placeholder="Describe what's included in this tier..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 h-9 rounded-xl bg-zinc-900 text-white text-xs font-medium disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => { setValue(tier.description ?? ""); setEditing(false); }}
            className="flex-1 h-9 rounded-xl border border-zinc-300 text-xs font-medium"
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
      className="w-full text-left text-sm text-zinc-600 hover:text-zinc-900"
    >
      {tier.description}
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-xs text-zinc-400 underline"
    >
      + Add description
    </button>
  );
}
