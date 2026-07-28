import type { Metadata, Viewport } from "next";
import { Sora, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import { ConsentBanner } from "./components/ConsentBanner";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["500", "600"],
  subsets: ["latin"],
});

const SITE_URL = "https://quikequotes.com";
const SITE_DESCRIPTION =
  "Send a professional quote from your phone in 3 minutes, with tiers, tracking, and follow-up that runs itself.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "QuikeQuotes — Quote fast, follow up automatically",
    template: "%s · QuikeQuotes",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "quoting software",
    "painting quotes",
    "pressure washing quotes",
    "home service CRM",
    "quote follow up automation",
    "contractor quote app",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "QuikeQuotes",
    title: "QuikeQuotes — Quote fast, follow up automatically",
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuikeQuotes — Quote fast, follow up automatically",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14171c",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "QuikeQuotes",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {/* Google Consent Mode v2 default: denied until the visitor chooses in
            the cookie banner. Must run before the GTM container parses. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'denied',
                wait_for_update: 500
              });
            `,
          }}
        />
        {gtmId && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-paper text-ink">
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
