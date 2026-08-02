import Link from "next/link";
import { getDbUser } from "@/lib/auth";
import { buttonClass } from "@/lib/ui";
import { PLANS } from "./components/landing/plans";
import { Hero } from "./components/landing/Hero";
import { Problem } from "./components/landing/Problem";
import { Solution } from "./components/landing/Solution";
import { FounderNote } from "./components/landing/FounderNote";
import { ProductPreview } from "./components/landing/ProductPreview";
import { Comparison } from "./components/landing/Comparison";
import { MidCta } from "./components/landing/MidCta";
import { Testimonials } from "./components/landing/Testimonials";
import { Pricing } from "./components/landing/Pricing";
import { Faq } from "./components/landing/Faq";
import { ClosingCta } from "./components/landing/ClosingCta";

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "QuikeQuotes",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: PLANS.map((plan) => ({
    "@type": "Offer",
    name: plan.name,
    price: plan.price.replace("$", ""),
    priceCurrency: "USD",
    description: plan.tagline,
  })),
};

export default async function LandingPage() {
  const user = await getDbUser();
  const signedIn = Boolean(user);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="bg-ink on-ink px-6 py-5">
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
          <span className="type-display font-extrabold text-lg text-paper">
            Quike<span className="text-amber">Quotes</span>
          </span>
          <div className="flex items-center gap-5">
            {user ? (
              <Link
                href="/dashboard"
                className={buttonClass({ variant: "accent", size: "sm", pill: true })}
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-paper-muted hover:text-paper transition-colors flex items-center"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className={buttonClass({ variant: "accent", size: "sm", pill: true })}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero signedIn={signedIn} />
        <Problem />
        <Solution />
        <FounderNote />
        <ProductPreview />
        <Comparison />
        <MidCta signedIn={signedIn} />
        <Testimonials />
        <Pricing signedIn={signedIn} />
        <Faq />
        <ClosingCta signedIn={signedIn} />
      </main>

      <footer className="bg-ink on-ink px-6 py-10 text-center text-sm text-paper-muted">
        <p className="type-display font-bold text-paper text-base">
          Built for the ladder, not the boardroom.
        </p>
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/privacy" className="hover:text-paper transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-paper transition-colors">
            Terms of Service
          </Link>
          <Link href="/cookies" className="hover:text-paper transition-colors">
            Cookie Policy
          </Link>
          <Link href="/refunds" className="hover:text-paper transition-colors">
            Refunds
          </Link>
        </nav>
        <p className="mt-4 text-xs text-paper-muted/70">
          © {new Date().getFullYear()} QuikeQuotes
        </p>
      </footer>
    </div>
  );
}
