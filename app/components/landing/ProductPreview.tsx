import { StarIcon } from "../icons";
import { Money } from "../ui/Money";
import { SectionHeading } from "./SectionHeading";

const WIZARD_STEPS = [
  { num: 1, label: "Client" },
  { num: 2, label: "Template" },
  { num: 3, label: "Details" },
];

export function ProductPreview() {
  return (
    <section className="px-6 py-20 bg-paper-warm">
      <div className="max-w-5xl mx-auto">
        <SectionHeading eyebrow="Both sides" title="What it actually looks like">
          Not a mockup — this is the real flow, start to finish.
        </SectionHeading>

        <div className="grid gap-8 md:grid-cols-2">
          {/* You create it */}
          <div>
            <p className="type-eyebrow text-[10px] text-ink-muted mb-3 text-center">
              You create it
            </p>
            <div className="rounded-3xl bg-paper border border-line shadow-xl overflow-hidden">
              <div className="bg-ink px-5 py-3 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-6">
                  {WIZARD_STEPS.map((s, i) => (
                    <div key={s.num} className="flex items-center gap-1.5 flex-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === 0
                            ? "bg-amber text-ink"
                            : "bg-line text-ink-muted"
                        }`}
                      >
                        {s.num}
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          i === 0 ? "text-ink" : "text-ink-muted"
                        }`}
                      >
                        {s.label}
                      </span>
                      {i < WIZARD_STEPS.length - 1 && (
                        <div className="flex-1 h-px bg-line" />
                      )}
                    </div>
                  ))}
                </div>

                <p className="type-eyebrow text-[9px] text-ink-muted mb-1.5">
                  Quote title
                </p>
                <div className="h-10 rounded-lg border border-line bg-paper-warm px-3 flex items-center text-sm text-ink-muted mb-3">
                  Exterior painting — 123 Main St
                </div>
                <p className="type-eyebrow text-[9px] text-ink-muted mb-1.5">
                  Client name
                </p>
                <div className="h-10 rounded-lg border border-line bg-paper-warm px-3 flex items-center text-sm text-ink-muted mb-4">
                  John Smith
                </div>
                <div className="h-10 rounded-lg bg-ink text-paper text-sm font-semibold flex items-center justify-center">
                  Next
                </div>
              </div>
            </div>
          </div>

          {/* They see it */}
          <div>
            <p className="type-eyebrow text-[10px] text-ink-muted mb-3 text-center">
              They see it
            </p>
            <div className="rounded-3xl bg-paper border border-line shadow-xl overflow-hidden">
              <div className="bg-ink px-5 py-3 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center text-amber text-xs font-bold">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight text-ink">
                      Exterior painting
                    </p>
                    <p className="text-xs text-ink-muted leading-tight">
                      Prepared for John Smith
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-4">
                  <div className="aspect-square rounded-lg bg-paper-warm border border-line" />
                  <div className="aspect-square rounded-lg bg-paper-warm border border-line" />
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg border border-line bg-paper-warm p-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-ink">Good</span>
                    <Money cents={185000} size="xs" />
                  </div>
                  <div className="rounded-lg border-2 border-amber bg-amber-wash p-2">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
