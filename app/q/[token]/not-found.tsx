export default function QuoteNotFound() {
  return (
    <div className="min-h-screen bg-paper-warm flex items-center justify-center px-4">
      <div className="max-w-sm rounded-2xl border border-line bg-surface px-6 py-10 text-center">
        <h1 className="type-display text-2xl font-extrabold mb-2">
          This link isn&apos;t live
        </h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          The quote may have been removed or replaced. Ask the business to send
          you a fresh link.
        </p>
      </div>
    </div>
  );
}
