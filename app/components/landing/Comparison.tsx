const ROWS = [
  { feature: "Monthly price", us: "$29–$79", them: "$100–$300+", mono: true },
  { feature: "Time to first quote", us: "3 minutes", them: "Weeks to learn" },
  { feature: "Good / Better / Best tiers", us: true, them: false },
  { feature: "Open tracking on quotes", us: true, them: false },
  { feature: "Automatic Day 1/3/7 follow-up", us: true, them: "Add-on / manual" },
  { feature: "Scheduling, dispatch, payroll", us: false, them: true },
];

function Cell({ value, mono }: { value: boolean | string; mono?: boolean }) {
  if (value === true)
    return <span className="text-green-600 font-bold">✓</span>;
  if (value === false)
    return <span className="text-ink-muted/40 font-bold">—</span>;
  return (
    <span className={`text-sm ${mono ? "font-mono font-semibold" : ""}`}>
      {value}
    </span>
  );
}

export function Comparison() {
  return (
    <section className="px-6 py-20 bg-paper">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-center mb-3 text-ink">
          Not another all-in-one tool
        </h2>
        <p className="text-center text-ink-muted mb-12 max-w-lg mx-auto">
          Jobber, Housecall Pro and ServiceTitan are great once you have a
          team and a full schedule. Most 1–5 person operations just need to
          win the job first.
        </p>

        <div className="rounded-2xl border border-ink/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="bg-ink text-white">
                <th className="text-left font-semibold px-4 py-3">Feature</th>
                <th className="font-semibold px-3 py-3 text-amber">
                  QuikeQuotes
                </th>
                <th className="font-semibold px-3 py-3 text-paper-muted">
                  All-in-one tools
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={i % 2 === 0 ? "bg-paper" : "bg-paper-warm"}
                >
                  <td className="px-4 py-3 text-ink">{row.feature}</td>
                  <td className="px-3 py-3 text-center text-ink">
                    <Cell value={row.us} mono={row.mono} />
                  </td>
                  <td className="px-3 py-3 text-center text-ink">
                    <Cell value={row.them} mono={row.mono} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-sm text-ink-muted mt-6 max-w-md mx-auto">
          Jobber is for running your whole business.{" "}
          <span className="font-medium text-ink">
            QuikeQuotes is for winning the job in the first place.
          </span>
        </p>
      </div>
    </section>
  );
}
