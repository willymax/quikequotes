const PROBLEMS = [
  {
    icon: "🐢",
    title: "Slow quotes lose jobs",
    lead: "You're on a ladder all day, so the quote gets written at 9pm — or three days later.",
    rest: "Homeowners get 3 bids, and the first professional quote often wins. By the time you reply, momentum is gone.",
  },
  {
    icon: "📵",
    title: "Nobody follows up",
    lead: "You send a quote and then... nothing.",
    rest: "No reminder, no \"any questions?\" text. The job silently goes to the competitor who called back twice. Follow-up is the highest-ROI thing in your business — and the one you're worst at, because it's awkward and you're busy.",
  },
  {
    icon: "📝",
    title: "Quotes look amateur",
    lead: "A price texted as \"itll be around 450\" loses to a branded quote with photos, line items, and an Accept button — even at a higher price.",
    rest: "Professionalism is a pricing lever you're not using.",
  },
];

export function Problem() {
  return (
    <section className="px-6 py-20 bg-paper-warm">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-center mb-3 text-ink">
          Sound familiar?
        </h2>
        <p className="text-center text-ink-muted mb-12 max-w-lg mx-auto">
          If any of this is costing you jobs, you&apos;re not alone — and
          it&apos;s fixable.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-ink/10 bg-paper p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="w-11 h-11 rounded-xl bg-amber/15 flex items-center justify-center text-2xl mb-4">
                {p.icon}
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
