"use client";

import { useEffect, useState } from "react";
import { onConsentManagerOpenRequest } from "@/lib/consent-events";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_COOKIE = "qq_consent";
const CONSENT_MAX_AGE_DAYS = 365;

type Consent = {
  analytics: boolean;
  advertising: boolean;
  ts: string;
};

function readConsentCookie(): Consent | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
}

function writeConsentCookie(consent: Consent) {
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(
    JSON.stringify(consent)
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function applyConsent(consent: Consent) {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };

  window.gtag("consent", "update", {
    ad_storage: consent.advertising ? "granted" : "denied",
    ad_user_data: consent.advertising ? "granted" : "denied",
    ad_personalization: consent.advertising ? "granted" : "denied",
    analytics_storage: consent.analytics ? "granted" : "denied",
  });

  window.dataLayer.push({
    event: "consent_update",
    consent_analytics: consent.analytics,
    consent_advertising: consent.advertising,
  });
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect --
       document.cookie only exists after mount; this syncs banner
       visibility with that client-only external source, which is
       exactly what effects are for. */
    const existing = readConsentCookie();
    if (!existing) {
      setVisible(true);
    } else {
      setAnalytics(existing.analytics);
      setAdvertising(existing.advertising);
    }

    return onConsentManagerOpenRequest(() => {
      const current = readConsentCookie();
      if (current) {
        setAnalytics(current.analytics);
        setAdvertising(current.advertising);
      }
      setManaging(true);
      setVisible(true);
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function save(consent: Omit<Consent, "ts">) {
    const full: Consent = { ...consent, ts: new Date().toISOString() };
    writeConsentCookie(full);
    applyConsent(full);
    setVisible(false);
    setManaging(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink px-6 py-5 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <p className="text-sm text-paper-muted">
          We use cookies for analytics and ad measurement (Google, Meta,
          TikTok) to see what&apos;s working. Nothing loads until you choose.
          See our{" "}
          <a href="/cookies" className="underline hover:text-white">
            Cookie Policy
          </a>
          .
        </p>

        {managing && (
          <div className="flex flex-col gap-3 rounded-xl bg-ink-soft p-4 text-sm">
            <label className="flex items-center justify-between gap-4">
              <span>Necessary — always on</span>
              <input type="checkbox" checked disabled className="h-4 w-4" />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span>Analytics (GA4)</span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="h-4 w-4"
              />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span>Advertising (Google Ads, Meta, TikTok)</span>
              <input
                type="checkbox"
                checked={advertising}
                onChange={(e) => setAdvertising(e.target.checked)}
                className="h-4 w-4"
              />
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {managing ? (
            <button
              onClick={() => save({ analytics, advertising })}
              className="h-10 rounded-full bg-amber px-5 text-sm font-bold text-ink hover:bg-amber-deep transition-colors"
            >
              Save preferences
            </button>
          ) : (
            <>
              <button
                onClick={() => save({ analytics: true, advertising: true })}
                className="h-10 rounded-full bg-amber px-5 text-sm font-bold text-ink hover:bg-amber-deep transition-colors"
              >
                Accept all
              </button>
              <button
                onClick={() => save({ analytics: false, advertising: false })}
                className="h-10 rounded-full border border-white/20 px-5 text-sm font-bold text-white hover:border-white/40 transition-colors"
              >
                Reject all
              </button>
              <button
                onClick={() => setManaging(true)}
                className="text-sm font-medium text-paper-muted underline hover:text-white"
              >
                Manage
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
