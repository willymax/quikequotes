import { BellOffIcon, ClockIcon, ScribbleIcon } from "../icons";
import { SectionHeading } from "./SectionHeading";

const PROBLEMS = [
  {
    Icon: ClockIcon,
    title: "Slow quotes lose jobs",
    lead: "You're on a ladder all day, so the quote gets written at 9pm — or three days later.",
    rest: "Homeowners get 3 bids, and the first professional quote often wins. By the time you reply, momentum is gone.",
  },
  {
    Icon: BellOffIcon,
    title: "Nobody follows up",
    lead: "You send a quote and then... nothing.",
    rest: "No reminder, no \"any questions?\" text. The job silently goes to the competitor who called back twice. Follow-up pays off more than almost anything else you do — and it's the thing you're worst at, because it's awkward and you're busy.",
  },
  {
    Icon: ScribbleIcon,
    title: "Quotes look amateur",
    lead: "A price texted as \"itll be around 450\" loses to a branded quote with photos, line items, and an Accept button — even at a higher price.",
    rest: "Looking professional lets you charge more, and you're leaving that on the table.",
  },
];

export function Problem() {
  return (
    <section className="px-6 py-20 bg-paper-warm">
      <div className="max-w-5xl mx-auto">
        <SectionHeading eyebrow="The leak" title="Sound familiar?">
          If any of this is costing you jobs, you&apos;re not alone — and
          it&apos;s fixable.
        </SectionHeading>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map(({ Icon, ...p }) => (
            <div
              key={p.title}
              className="rounded-2xl border border-line bg-paper p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="w-11 h-11 rounded-xl bg-amber/15 text-amber-deep flex items-center justify-center mb-4">
                <Icon size={22} />
              </div>
              <p className="font-bold mb-2 text-ink">{p.title}</p>
              <p className="text-sm text-ink-muted leading-relaxed">
                <strong className="text-ink font-semibold">{p.lead}</strong>{" "}
                {p.rest}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
