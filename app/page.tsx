import Link from "next/link";
import { getDbUser } from "@/lib/auth";
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

export default async function LandingPage() {
  const user = await getDbUser();
  const signedIn = Boolean(user);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="bg-ink px-6 py-5">
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
          <span className="font-extrabold text-lg tracking-tight text-white">
            QuikeQuotes
          </span>
          <div className="flex items-center gap-5">
            {user ? (
              <Link
                href="/dashboard"
                className="h-9 px-4 rounded-full bg-amber text-ink text-sm font-bold flex items-center hover:bg-amber-deep transition-colors"
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-paper-muted hover:text-white transition-colors flex items-center"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="h-9 px-4 rounded-full bg-amber text-ink text-sm font-bold flex items-center hover:bg-amber-deep transition-colors"
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

      <footer className="bg-ink px-6 py-8 text-center text-sm text-paper-muted">
        © {new Date().getFullYear()} QuikeQuotes. Built for the ladder, not the boardroom.
      </footer>
    </div>
  );
}
