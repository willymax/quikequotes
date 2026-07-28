import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>Last updated: [PLACEHOLDER — set effective date before launch]</p>

      <p>
        This Privacy Policy explains what information QuikeQuotes
        (&quot;QuikeQuotes,&quot; &quot;we,&quot; &quot;us&quot;) collects from
        you, how we use it, and the choices you have. QuikeQuotes is a quoting
        and follow-up tool for home-service businesses.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Account information: your name, email address, and password (via our authentication provider).</li>
        <li>Business information: your company name, branding, and service templates.</li>
        <li>Client information you enter: your customers&apos; names, phone numbers, email addresses, service addresses, and job photos you upload to build a quote.</li>
        <li>Quote and communication data: quote contents, pricing tiers, e-signatures, acceptance/decline status, and message open/click activity.</li>
        <li>Usage and device data collected automatically, and analytics/advertising identifiers described below.</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To generate, send, and track quotes on your behalf.</li>
        <li>To send automated follow-up messages to your clients by SMS (via Twilio) on a Day 1 / Day 3 / Day 7 cadence, and by email (via Resend), stopping once a client replies or accepts.</li>
        <li>To authenticate your account and store your data securely (via Supabase, hosted on PostgreSQL).</li>
        <li>To operate, secure, and improve the service.</li>
      </ul>

      <h2>Analytics and advertising</h2>
      <p>
        With your consent, we use Google Analytics (GA4), Google Ads, Meta
        (Facebook/Instagram) Pixel, and TikTok Pixel — loaded through Google
        Tag Manager — to understand how visitors find and use our marketing
        site, and to measure the performance of our ad campaigns. These tools
        do not load or set cookies until you accept them in our cookie
        banner. See our{" "}
        <a href="/cookies">Cookie Policy</a> for details and how to change
        your choice at any time.
      </p>

      <h2>Sharing</h2>
      <p>
        We share data with the service providers named above (Twilio, Resend,
        Supabase) solely to operate QuikeQuotes, and with analytics/ad
        platforms only after you consent. We do not sell your personal
        information.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access,
        correct, delete, or export your data, and to opt out of the sale or
        sharing of personal information. To exercise these rights, contact us
        using the details below.
      </p>

      <h2>Contact</h2>
      <p>
        [PLACEHOLDER — replace with a registered business name, address, and a
        dedicated privacy contact such as privacy@quikequotes.com. Interim
        contact: william.k.makau@gmail.com]
      </p>
    </>
  );
}
