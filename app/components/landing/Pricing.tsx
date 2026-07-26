import { CtaButton } from "./CtaButton";

const PLANS = [
  {
    name: "Solo",
    price: "$29",
    tagline: "For the one-truck operation",
    features: [
      "Up to 20 quotes / month",
      "Good / Better / Best tiers",
      "Shareable tracked quote links",
      "Automatic Day 1/3/7 follow-up",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    tagline: "For steady, growing crews",
    features: [
      "Unlimited quotes",
      "Everything in Solo",
      "Priority email + SMS support",
      "Custom branding on quotes",
    ],
    highlight: true,
  },
  {
    name: "Team",
    price: "$79",
    tagline: "For multi-crew businesses",
    features: [
      "Everything in Pro",
      "Higher-volume SMS/email sending",
      "Priority phone support",
      "Early access to new features",
    ],
    highlight: false,
  },
];

export function Pricing({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="px-6 py-20 bg-paper">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-center mb-3 text-ink">
          Simple pricing, no surprises
        </h2>
        <p className="text-center text-ink-muted mb-12 max-w-lg mx-auto">
          Launch pricing. Free to start right now — no credit card required —
          and if you join during early access, your price is locked in for
          as long as you&apos;re a member.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col relative transition-all hover:-translate-y-1 ${
                plan.highlight
                  ? "border-2 border-ink bg-paper shadow-xl"
                  : "border border-ink/10 bg-paper-warm hover:shadow-lg"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber text-ink text-xs font-bold px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}
              <p className="font-bold text-lg text-ink">{plan.name}</p>
              <p className="text-xs text-ink-muted mb-4">{plan.tagline}</p>
              <p className="mb-5">
                <span className="text-3xl font-extrabold font-mono text-ink">
                  {plan.price}
                </span>
                <span className="text-ink-muted text-sm"> / month</span>
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-ink-muted flex gap-2">
                    <span className="text-green-600 font-bold shrink-0">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <CtaButton
                href={signedIn ? "/dashboard" : "/sign-up"}
                size="md"
                variant={plan.highlight ? "primary" : "outline-ink"}
                className="w-full"
              >
                {signedIn ? "Go to Dashboard" : "Start free"}
              </CtaButton>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-ink-muted mt-8">
          30-day money-back guarantee once billing launches. No minimum term
          — cancel any time.
        </p>
      </div>
    </section>
  );
}
