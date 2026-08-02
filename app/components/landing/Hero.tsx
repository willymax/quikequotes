import { ArrowDownIcon, StarIcon } from "../icons";
import { StatusBadge } from "../ui/StatusBadge";
import { Money } from "../ui/Money";
import { CtaButton } from "./CtaButton";

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative bg-ink on-ink px-6 pt-10 pb-20 overflow-hidden">
      {/* Atmosphere — soft amber glow behind the mockup */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(245,166,35,0.18),transparent)] hidden lg:block"
      />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 lg:gap-12 lg:items-center">
        <div className="text-center lg:text-left">
          {/* Johnson Box — previews what's below to hook skimmers */}
          <div className="animate-fade-up inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mb-7 px-4 py-2 rounded-full bg-white/10 text-xs sm:text-sm text-paper-muted font-medium">
            <ArrowDownIcon size={14} className="text-amber" />
            <span>Below: a 3-minute quote</span>
            <span className="text-white/20">·</span>
            <span>a tracked client link</span>
            <span className="text-white/20">·</span>
            <span>follow-ups that run themselves</span>
          </div>

          <h1 className="type-display animate-fade-up [animation-delay:100ms] text-[2.75rem] sm:text-6xl font-extrabold mb-6 text-paper">
            Still texting{" "}
            <span className="text-amber">&quot;it&apos;ll be around $450&quot;</span>?
          </h1>
          <p className="animate-fade-up [animation-delay:200ms] text-lg sm:text-xl text-paper-muted mb-9 leading-relaxed max-w-xl mx-auto lg:mx-0">
            <strong className="text-paper font-semibold">
              The first professional quote usually wins the job.
            </strong>{" "}
            Here&apos;s how to send one from the driveway in 3 minutes — and
            never forget to follow up again.
          </p>

          <div className="animate-fade-up [animation-delay:300ms]">
            <CtaButton href={signedIn ? "/dashboard" : "/sign-up"} size="xl">
              {signedIn ? "Go to dashboard →" : "Start free →"}
            </CtaButton>
            <p className="mt-4 text-sm text-paper-muted">
              No credit card required. First quote sent in under 3 minutes.
            </p>
          </div>
        </div>

        {/*
          Show, don't tell — this is the real client view, built from the same
          <Money> and <StatusBadge> the product renders, so what a visitor sees
          here is what actually ships.
        */}
        <div className="animate-fade-up [animation-delay:400ms] mt-14 lg:mt-0 relative max-w-xs mx-auto lg:mx-0">
          <p className="text-center text-xs font-medium text-paper-muted mb-3">
            This is what your client sees — they tap to accept any option
          </p>
          <div className="rounded-3xl bg-paper shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-4 text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center text-amber text-xs font-bold">
                  A
                </div>
                <span className="text-sm font-semibold text-ink">
                  Ace Painting Co.
                </span>
              </div>
              <StatusBadge status="VIEWED" />
            </div>
            <p className="type-eyebrow text-[10px] text-ink-muted mb-2">
              Options
            </p>
            <div className="space-y-2">
              <div className="rounded-xl border border-line bg-paper-warm p-2.5 flex items-center justify-between">
                <span className="text-sm font-bold text-ink">Good</span>
                <Money cents={185000} size="xs" />
              </div>
              <div className="rounded-xl border-2 border-amber bg-amber-wash p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-ink">Better</span>
                  <Money cents={240000} size="xs" />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-deep bg-amber/20 rounded-full px-2 py-0.5 mb-2">
                  <StarIcon size={10} />
                  Most clients pick this
                </span>
                <div className="h-8 rounded-lg bg-amber text-ink text-xs font-bold flex items-center justify-center">
                  Accept Better
                </div>
              </div>
              <div className="rounded-xl border border-line bg-paper-warm p-2.5 flex items-center justify-between">
                <span className="text-sm font-bold text-ink">Best</span>
                <Money cents={310000} size="xs" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
