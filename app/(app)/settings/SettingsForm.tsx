"use client";

import { useState, useTransition } from "react";
import { updateBusinessProfile } from "@/app/actions/settings";

type User = {
  businessName: string | null;
  phone: string | null;
  logoUrl: string | null;
  tradeType: string;
};

const TRADE_TYPES = [
  { value: "PAINTING", label: "Painting" },
  { value: "PRESSURE_WASHING", label: "Pressure Washing" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "HVAC", label: "HVAC" },
  { value: "LANDSCAPING", label: "Landscaping" },
  { value: "OTHER", label: "Other" },
];

export function SettingsForm({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="businessName">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          required
          defaultValue={user.businessName ?? ""}
          placeholder="Acme Painting Co."
          className="w-full h-12 px-4 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="phone">
          Business Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={user.phone ?? ""}
          placeholder="+1 555 000 0000"
          className="w-full h-12 px-4 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="tradeType">
          Trade Type <span className="text-red-500">*</span>
        </label>
        <select
          id="tradeType"
          name="tradeType"
          defaultValue={user.tradeType}
          className="w-full h-12 px-4 text-base border border-zinc-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          {TRADE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="logoUrl">
          Logo URL
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          type="url"
          defaultValue={user.logoUrl ?? ""}
          placeholder="https://..."
          className="w-full h-12 px-4 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      {saved && <p className="text-sm text-green-600 font-medium">Saved!</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-xl bg-zinc-900 text-white font-semibold text-base hover:bg-zinc-700 transition-colors disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
