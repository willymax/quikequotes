import type { Metadata } from "next";
import { PLANS } from "@/app/components/landing/plans";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>Last updated: [PLACEHOLDER — set effective date before launch]</p>

      <p>
        These Terms of Service govern your use of QuikeQuotes, a quoting and
        automated follow-up tool for home-service businesses. By creating an
        account, you agree to these terms.
      </p>

      <h2>The service</h2>
      <p>
        QuikeQuotes lets you build quotes with good/better/best pricing
        tiers, send clients a shareable, trackable, e-signable quote link, and
        automatically follow up by SMS and email until the client responds or
        accepts.
      </p>

      <h2>Subscriptions and billing</h2>
      <ul>
        {PLANS.map((plan) => (
          <li key={plan.name}>
            {plan.name} — {plan.price}/month: {plan.tagline}.
          </li>
        ))}
      </ul>
      <p>
        Plans bill monthly and may be cancelled at any time, effective at the
        end of the current billing period. See our{" "}
        <a href="/refunds">Refund &amp; Cancellation Policy</a>.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree to use QuikeQuotes only for legitimate business quoting and
        follow-up communication, and to only message clients who have
        requested or expect contact from you. You are responsible for the
        accuracy of quotes and messages you send through the service.
      </p>

      <h2>Account termination</h2>
      <p>
        We may suspend or terminate accounts that violate these terms or
        applicable law. You may close your account at any time from Settings.
      </p>

      <h2>Intellectual property</h2>
      <p>
        QuikeQuotes and its branding are our property. Quote content, client
        data, and photos you upload remain yours.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        QuikeQuotes is provided &quot;as is.&quot; To the maximum extent
        permitted by law, we are not liable for indirect, incidental, or
        consequential damages arising from your use of the service.
      </p>

      <h2>Governing law</h2>
      <p>[PLACEHOLDER — jurisdiction to be determined]</p>

      <h2>Contact</h2>
      <p>
        [PLACEHOLDER — replace with a registered business name and address.
        Interim contact: william.k.makau@gmail.com]
      </p>
    </>
  );
}
