const EXAMPLES = [
  {
    emoji: "🎨",
    quote: "\"I used to lose the good jobs to whoever texted back first. Now I send the quote from the truck.\"",
    role: "Solo painter, illustrative example",
  },
  {
    emoji: "💦",
    quote: "\"The tiers alone bumped my average job up — clients pick 'Better' way more than I expected.\"",
    role: "Pressure washing owner, illustrative example",
  },
  {
    emoji: "🧹",
    quote: "\"I'm terrible at following up. Now it just happens, and I still get the credit for checking in.\"",
    role: "Cleaning business owner, illustrative example",
  },
];

export function Testimonials() {
  return (
    <section className="px-6 py-20 bg-paper-warm">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-center mb-2 text-ink">
          What this kind of owner tells us
        </h2>
        <p className="text-center text-xs text-ink-muted/70 mb-12 max-w-md mx-auto italic">
          Illustrative examples built from target-customer interviews —
          not yet live customer quotes. We&apos;ll swap in real ones as early
          members come on board.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLES.map((t) => (
            <div
              key={t.role}
              className="rounded-2xl bg-paper p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="w-11 h-11 rounded-xl bg-amber/15 flex items-center justify-center text-2xl mb-4">
                {t.emoji}
              </div>
              <p className="font-semibold text-sm leading-relaxed mb-3 text-ink">
                {t.quote}
              </p>
              <p className="text-xs text-ink-muted">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
