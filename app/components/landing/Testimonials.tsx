import { SectionHeading } from "./SectionHeading";

/**
 * No icon tile here. These are quotes — the words are the content, and an icon
 * beside each one was decoration standing in for a person who doesn't exist
 * yet. The trade label does the identifying work instead.
 */
const EXAMPLES = [
  {
    trade: "Painting",
    quote:
      "I used to lose the good jobs to whoever texted back first. Now I send the quote from the truck.",
    role: "Solo painter (example)",
  },
  {
    trade: "Pressure washing",
    quote:
      "The tiers alone bumped my average job up — clients pick 'Better' way more than I expected.",
    role: "Pressure washing owner (example)",
  },
  {
    trade: "Cleaning",
    quote:
      "I'm terrible at following up. Now it just happens, and I still get the credit for checking in.",
    role: "Cleaning business owner (example)",
  },
];

export function Testimonials() {
  return (
    <section className="px-6 py-20 bg-paper-warm">
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          eyebrow="From the field"
          title="What this kind of owner tells us"
        >
          <span className="text-sm italic">
            These are example quotes based on interviews with owners like you —
            not real customers yet. We&apos;ll swap in real ones as early
            members come on board.
          </span>
        </SectionHeading>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLES.map((t) => (
            <figure
              key={t.role}
              className="rounded-2xl bg-paper border border-line p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="type-eyebrow text-[10px] text-amber-deep mb-4">
                {t.trade}
              </p>
              <blockquote className="font-semibold text-[15px] leading-relaxed text-ink">
                “{t.quote}”
              </blockquote>
              <figcaption className="text-xs text-ink-muted mt-4">
                {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
