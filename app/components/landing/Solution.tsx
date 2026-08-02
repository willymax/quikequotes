import { BoltIcon, EyeIcon, RepeatIcon } from "../icons";
import { SectionHeading } from "./SectionHeading";

/**
 * These are numbered because they genuinely are a sequence — quote, then send,
 * then follow up. The number carries information a reader needs.
 */
const STEPS = [
  {
    num: "1",
    Icon: BoltIcon,
    title: "Send a professional quote from your phone in 3 minutes",
    lead: "Pick a trade template, add your line items and photos, and offer Good / Better / Best options — no retyping the same job twice.",
    rest: "Offering tiers alone tends to lift average job value 15–30%, and it turns \"should I hire them?\" into \"which package should I pick?\"",
  },
  {
    num: "2",
    Icon: EyeIcon,
    title: "Your client gets a link, not an attachment",
    lead: "A branded, mobile-friendly quote with your photos, your pricing tiers, and an Accept button.",
    rest: "The moment they open it, you'll know — so you can call them while they're still looking at the price, not two days later.",
  },
  {
    num: "3",
    Icon: RepeatIcon,
    title: "Follow-up runs on autopilot",
    lead: "Day 1 SMS, Day 3 email, Day 7 nudge — sent automatically, and stopped the instant they reply or accept.",
    rest: "One recovered $400 job pays for a year of this. You'll never again lose a job just because you forgot to check back in.",
  },
];

export function Solution() {
  return (
    <section className="px-6 py-20 bg-paper">
      <div className="max-w-5xl mx-auto">
        <SectionHeading eyebrow="The fix" title="How QuikeQuotes fixes it">
          Not an all-in-one tool — just the part that wins the job in the first
          place.
        </SectionHeading>

        <div className="space-y-6 max-w-3xl mx-auto">
          {STEPS.map(({ Icon, ...s }) => (
            <div
              key={s.num}
              className="flex gap-5 rounded-2xl border border-line bg-paper-warm p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="shrink-0 w-11 h-11 rounded-full bg-ink text-paper type-num font-bold flex items-center justify-center ring-4 ring-amber/20">
                {s.num}
              </div>
              <div>
                <p className="font-bold mb-1.5 text-ink flex items-start gap-2">
                  <Icon size={18} className="mt-0.5 shrink-0 text-amber-deep" />
                  <span>{s.title}</span>
                </p>
                <p className="text-sm text-ink-muted leading-relaxed">
                  <strong className="text-ink font-semibold">{s.lead}</strong>{" "}
                  {s.rest}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
