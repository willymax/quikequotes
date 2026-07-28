import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  alternates: { canonical: "/refunds" },
};

export default function RefundsPage() {
  return (
    <>
      <h1>Refund &amp; Cancellation Policy</h1>
      <p>Last updated: [PLACEHOLDER — set effective date before launch]</p>

      <h2>Cancellation</h2>
      <p>
        There is no minimum term. You can cancel your QuikeQuotes
        subscription at any time from Settings, effective at the end of your
        current billing period. You won&apos;t be charged again after
        cancelling.
      </p>

      <h2>Refunds</h2>
      <p>
        Once billing is live, new subscribers are covered by a 30-day
        money-back guarantee: if QuikeQuotes isn&apos;t a fit within your
        first 30 days, contact us for a full refund of that period.
      </p>
      <p>
        [PLACEHOLDER — this guarantee is currently conditional on billing not
        yet being live (see landing page pricing section). Update this page
        to remove the &quot;once billing launches&quot; qualifier and add a
        firm start date the day billing actually goes live, so this policy
        and the pricing page stay in agreement.]
      </p>

      <h2>Contact</h2>
      <p>
        [PLACEHOLDER — replace with a registered business name and address.
        Interim contact: william.k.makau@gmail.com]
      </p>
    </>
  );
}
