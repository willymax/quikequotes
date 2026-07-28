"use client";

import { requestConsentManagerOpen } from "@/lib/consent-events";

export function ManageCookiesButton() {
  return (
    <button
      onClick={requestConsentManagerOpen}
      className="font-bold text-ink underline"
    >
      Manage cookie settings
    </button>
  );
}
