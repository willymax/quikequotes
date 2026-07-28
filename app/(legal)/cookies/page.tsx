import type { Metadata } from "next";
import { ManageCookiesButton } from "./ManageCookiesButton";

export const metadata: Metadata = {
  title: "Cookie Policy",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <>
      <h1>Cookie Policy</h1>
      <p>Last updated: [PLACEHOLDER — set effective date before launch]</p>

      <p>
        We use a small number of cookie categories on our marketing site.
        Nothing outside &quot;Necessary&quot; loads until you choose to accept
        it in the cookie banner.
      </p>

      <h2>Necessary</h2>
      <p>
        Used to remember your cookie choice itself (<code>qq_consent</code>)
        and to keep you signed in. Always on — the site can&apos;t function
        without these.
      </p>

      <h2>Analytics</h2>
      <p>
        Google Analytics (GA4), loaded through Google Tag Manager, to
        understand how visitors use our marketing site.
      </p>

      <h2>Advertising</h2>
      <p>
        Google Ads, Meta (Facebook/Instagram) Pixel, and TikTok Pixel, loaded
        through Google Tag Manager, to measure and improve our ad campaigns.
        Google tags respect{" "}
        <a
          href="https://support.google.com/tagmanager/answer/10718549"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Consent Mode
        </a>
        : until you accept, Google receives no cookies and only anonymous,
        cookieless signals.
      </p>

      <p>
        You can change your choice at any time.{" "}
        <ManageCookiesButton />
      </p>
    </>
  );
}
