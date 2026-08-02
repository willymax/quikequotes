export function FounderNote() {
  return (
    <section className="px-6 py-16 bg-paper">
      <div className="max-w-2xl mx-auto flex gap-5 items-start">
        {/* A monogram rather than a waving-hand emoji — this is a real person
            signing a note, not a chat bubble. */}
        <div className="shrink-0 w-12 h-12 rounded-full bg-ink text-amber type-display text-lg font-extrabold flex items-center justify-center">
          W
        </div>
        <div>
          <p className="text-sm leading-relaxed text-ink-muted">
            <strong className="text-ink font-semibold">
              Hi — I&apos;m building QuikeQuotes because home-service pros keep
              losing jobs to slow, sloppy follow-up, not bad work.
            </strong>{" "}
            This isn&apos;t a big company with a sales team — it&apos;s an
            early, hands-on product, and I read every reply. If something is
            missing for your trade, tell me. I&apos;m building this with
            painters and pressure washers, not just for them.
          </p>
        </div>
      </div>
    </section>
  );
}
