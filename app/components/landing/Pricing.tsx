import { CheckIcon } from "../icons";
import { CtaButton } from "./CtaButton";
import { SectionHeading } from "./SectionHeading";
import { PLANS } from "./plans";

export function Pricing({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="px-6 py-20 bg-paper">
      <div className="max-w-5xl mx-auto">
        <SectionHeading eyebrow="Pricing" title="Simple pricing, no surprises">
          Launch pricing. Free to start right now — no credit card required —
          and if you join during early access, your price is locked in for as
          long as you&apos;re a member.
        </SectionHeading>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col relative transition-all hover:-translate-y-1 ${
                plan.highlight
                  ? "border-2 border-ink bg-paper shadow-xl"
                  : "border border-line bg-paper-warm hover:shadow-lg"
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
                <span className="type-num text-3xl font-extrabold text-ink">
                  {plan.price}
                </span>
                <span className="text-ink-muted text-sm"> / month</span>
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="text-sm text-ink-muted flex gap-2 items-start"
                  >
                    <CheckIcon
                      size={15}
                      className="shrink-0 mt-0.5 text-accepted-rail"
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <CtaButton
                href={signedIn ? "/dashboard" : "/sign-up"}
                size="lg"
                variant={plan.highlight ? "accent" : "outline"}
                className="w-full"
              >
                {signedIn ? "Go to dashboard" : "Start free"}
              </CtaButton>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-ink-muted mt-8">
          30-day money-back guarantee once billing launches. No minimum term —
          cancel any time.
        </p>
      </div>
    </section>
  );
}
