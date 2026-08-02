/**
 * One heading treatment for every landing section. The exact class string used
 * to be pasted into six files, so any change to the type scale had to be made
 * six times — and one of them always drifted.
 */
export function SectionHeading({
  eyebrow,
  title,
  children,
  tone = "ink",
}: {
  /** Short label above the heading. Skip it when the section doesn't need one. */
  eyebrow?: string;
  title: React.ReactNode;
  /** Sub-heading paragraph. */
  children?: React.ReactNode;
  tone?: "ink" | "paper";
}) {
  const dark = tone === "paper";
  return (
    <div className="text-center mb-12">
      {eyebrow && (
        <p
          className={`type-eyebrow text-[11px] mb-4 ${
            dark ? "text-amber" : "text-ink-muted"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`type-display text-3xl sm:text-[2.75rem] font-extrabold ${
          dark ? "text-paper" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {children && (
        <p
          className={`mt-4 max-w-lg mx-auto leading-relaxed ${
            dark ? "text-paper-muted" : "text-ink-muted"
          }`}
        >
          {children}
        </p>
      )}
    </div>
  );
}
