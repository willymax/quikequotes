import { SectionHeading } from "./SectionHeading";

const FAQS = [
  {
    q: "Does this work for my trade?",
    a: "Yes. Templates cover painting, pressure washing, cleaning, HVAC and landscaping — and you can start from a blank quote for anything else. Line items and tiers work the same regardless of trade.",
  },
  {
    q: "I already just text or call clients a price — why change?",
    a: "You can keep doing that for the jobs where it works. QuikeQuotes is for the jobs worth more than a five-minute text: it looks more professional, offers tiers that lift average job value, and follows up automatically so you don't have to remember to.",
  },
  {
    q: "How long does setup actually take?",
    a: "Add your business name and logo, and you're ready. Your first quote — using a template — takes about 3 minutes from opening the app to sending the link.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. Sign up and start sending quotes for free, right now, with no card on file.",
  },
  {
    q: "What happens if a client doesn't respond?",
    a: "The follow-up sequence takes over: an SMS on Day 1, an email on Day 3, and a nudge on Day 7 — then it stops automatically the moment they reply or accept.",
  },
];

export function Faq() {
  return (
    <section className="px-6 py-20 bg-paper-warm">
      <div className="max-w-2xl mx-auto">
        <SectionHeading title="Questions, answered" />

        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl bg-paper border border-line p-5"
            >
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between gap-4 text-ink">
                {f.q}
                <span className="shrink-0 w-6 h-6 rounded-full bg-amber/15 text-amber-deep flex items-center justify-center text-lg leading-none group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-sm text-ink-muted leading-relaxed mt-3">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
