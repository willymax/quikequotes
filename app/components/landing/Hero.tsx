import { CtaButton } from "./CtaButton";

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative bg-ink px-6 pt-10 pb-20 overflow-hidden">
      {/* Atmosphere — soft amber glow behind the mockup */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(245,166,35,0.18),transparent)] hidden lg:block"
      />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 lg:gap-12 lg:items-center">
        <div className="text-center lg:text-left">
          {/* Johnson Box — previews what's below to hook skimmers */}
          <div className="animate-fade-up inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mb-7 px-4 py-2 rounded-full bg-white/10 text-xs sm:text-sm text-paper-muted font-medium">
            <span>👇 Below: a 3-minute quote</span>
            <span className="text-white/20">·</span>
            <span>a tracked client link</span>
            <span className="text-white/20">·</span>
            <span>follow-ups that run themselves</span>
          </div>

          <h1 className="animate-fade-up [animation-delay:100ms] text-4xl sm:text-6xl font-extrabold tracking-[-0.02em] leading-[1.05] mb-6 text-white">
            Still texting{" "}
            <span className="text-amber">&quot;it&apos;ll be around $450&quot;</span>?
          </h1>
          <p className="animate-fade-up [animation-delay:200ms] text-lg sm:text-xl text-paper-muted mb-9 leading-relaxed max-w-xl mx-auto lg:mx-0">
            <strong className="text-white font-semibold">
              The first professional quote usually wins the job.
            </strong>{" "}
            Here&apos;s how to send one from the driveway in 3 minutes — and
            never forget to follow up again.
          </p>

          <div className="animate-fade-up [animation-delay:300ms]">
            <CtaButton href={signedIn ? "/dashboard" : "/sign-up"}>
              {signedIn ? "Go to Dashboard →" : "Start free →"}
            </CtaButton>
            <p className="mt-3 text-sm text-paper-muted">
              No credit card required. First quote sent in under 3 minutes.
            </p>
          </div>
        </div>

        {/* Show, don't tell — mini mockup of the client-facing quote */}
        <div className="animate-fade-up [animation-delay:400ms] mt-14 lg:mt-0 relative max-w-xs mx-auto lg:mx-0">
          <p className="text-center text-xs font-medium text-paper-muted mb-3">
            This is what your client sees — they tap to accept any tier
          </p>
          <div className="rounded-3xl bg-paper shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-4 text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center text-white text-xs font-bold">
                  A
                </div>
                <span className="text-sm font-semibold text-ink">
                  Ace Painting Co.
                </span>
              </div>
              <span className="text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                👀 Viewed 2m ago
              </span>
            </div>
            <p className="text-xs text-ink-muted uppercase tracking-wide font-semibold mb-2">
              Options
            </p>
            <div className="space-y-2">
              <div className="rounded-xl border border-ink/10 bg-paper-warm p-2.5 flex items-center justify-between">
                <span className="text-sm font-bold text-ink">Good</span>
                <span className="text-sm font-bold text-ink font-mono">
                  $1,850
                </span>
              </div>
              <div className="rounded-xl border-2 border-amber bg-amber/10 p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-ink">Better</span>
                  <span className="text-sm font-bold text-ink font-mono">
                    $2,400
                  </span>
                </div>
                <span className="inline-block text-[10px] font-bold text-amber-deep bg-amber/20 rounded-full px-2 py-0.5 mb-2">
                  ⭐ Client&apos;s pick
                </span>
                <div className="h-8 rounded-lg bg-amber text-ink text-xs font-bold flex items-center justify-center">
                  Accept This Option
                </div>
              </div>
              <div className="rounded-xl border border-ink/10 bg-paper-warm p-2.5 flex items-center justify-between">
                <span className="text-sm font-bold text-ink">Best</span>
                <span className="text-sm font-bold text-ink font-mono">
                  $3,100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
