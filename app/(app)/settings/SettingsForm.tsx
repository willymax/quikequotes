"use client";

import { useRef, useState, useTransition } from "react";
import { updateBusinessProfile } from "@/app/actions/settings";
import { CURRENCIES } from "@/lib/currency";
import { buttonClass, inputClass, labelClass } from "@/lib/ui";

type User = {
  businessName: string | null;
  phone: string | null;
  logoUrl: string | null;
  tradeType: string;
  taxRatePercent: number;
  currency: string;
};

const TRADE_TYPES = [
  { value: "PAINTING", label: "Painting" },
  { value: "PRESSURE_WASHING", label: "Pressure Washing" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "HVAC", label: "HVAC" },
  { value: "LANDSCAPING", label: "Landscaping" },
  { value: "FUMIGATION", label: "Fumigation" },
  { value: "MOVING_SERVICES", label: "Moving Services" },
  { value: "OTHER", label: "Other" },
];

export function SettingsForm({ user }: { user: User }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function fillTestData() {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem("businessName") as HTMLInputElement).value = "Lorem Ipsum Painting Co.";
    (form.elements.namedItem("phone") as HTMLInputElement).value = "+1 555 123 4567";
    (form.elements.namedItem("logoUrl") as HTMLInputElement).value = "";
    (form.elements.namedItem("taxRatePercent") as HTMLInputElement).value = "16";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSaved(false);
    setError("");

    startTransition(async () => {
      const result = await updateBusinessProfile(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {process.env.NODE_ENV === "development" && (
        <button
          type="button"
          onClick={fillTestData}
          className={buttonClass({ variant: "dashed", size: "sm", block: true })}
        >
          Fill test data (dev only)
        </button>
      )}
      <div>
        <label className={labelClass()} htmlFor="businessName">
          Business name <span className="text-danger">*</span>
        </label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          required
          defaultValue={user.businessName ?? ""}
          placeholder="Acme Painting Co."
          className={inputClass()}
        />
      </div>

      <div>
        <label className={labelClass()} htmlFor="phone">
          Business phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={user.phone ?? ""}
          placeholder="+1 555 000 0000"
          className={inputClass()}
        />
      </div>

      <div>
        <label className={labelClass()} htmlFor="tradeType">
          Trade <span className="text-danger">*</span>
        </label>
        <select
          id="tradeType"
          name="tradeType"
          defaultValue={user.tradeType}
          className={inputClass()}
        >
          {TRADE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass()} htmlFor="logoUrl">
          Logo URL
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          type="url"
          defaultValue={user.logoUrl ?? ""}
          placeholder="https://..."
          className={inputClass()}
        />
      </div>

      <div>
        <label className={labelClass()} htmlFor="taxRatePercent">
          Default tax rate (%)
        </label>
        <input
          id="taxRatePercent"
          name="taxRatePercent"
          type="number"
          min="0"
          max="100"
          step="any"
          inputMode="decimal"
          onFocus={(e) => e.currentTarget.select()}
          defaultValue={String(user.taxRatePercent)}
          className={inputClass()}
        />
        <p className="mt-2 text-xs text-ink-muted leading-relaxed">
          Applied to new quotes. Set 0 for no tax — you can still override the rate
          on an individual quote.
        </p>
      </div>

      <div>
        <label className={labelClass()} htmlFor="currency">
          Currency <span className="text-danger">*</span>
        </label>
        <select
          id="currency"
          name="currency"
          defaultValue={user.currency}
          className={inputClass()}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-ink-muted leading-relaxed">
          Applied to new quotes. Quotes already sent keep the currency they were
          created with — changing this never relabels an amount a client has seen.
        </p>
      </div>

      {error && <p className="text-sm text-danger font-semibold">{error}</p>}
      {saved && (
        <p className="text-sm text-accepted-text font-semibold">Saved.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={buttonClass({ variant: "accent", size: "lg", block: true })}
      >
        {isPending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
