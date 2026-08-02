import { CtaButton } from "./CtaButton";

export function ClosingCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative bg-ink on-ink px-6 py-24 text-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[radial-gradient(closest-side,rgba(245,166,35,0.14),transparent)]"
      />
      <div className="relative max-w-lg mx-auto">
        <h2 className="type-display text-3xl sm:text-[2.75rem] font-extrabold mb-5 text-paper">
          Win more of the quotes you already send
        </h2>
        <p className="text-paper-muted mb-9 leading-relaxed">
          Jobber is for running your whole business.{" "}
          <span className="text-amber font-medium">
            QuikeQuotes is for winning the job in the first place.
          </span>{" "}
          Start free, no credit card required.
        </p>
        <CtaButton href={signedIn ? "/dashboard" : "/sign-up"} size="xl">
          {signedIn ? "Go to dashboard →" : "Start free →"}
        </CtaButton>
      </div>
    </section>
  );
}
