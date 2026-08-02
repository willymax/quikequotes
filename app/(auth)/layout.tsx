import Link from "next/link";

/**
 * Both auth screens previously rendered on a plain grey background with no
 * wordmark at all — a visitor arriving from the landing page had no signal
 * they were still in the same product. One shell now brands both.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-paper-warm">
      <header className="bg-ink on-ink px-6 py-5">
        <div className="max-w-sm mx-auto">
          <Link
            href="/"
            className="type-display text-lg font-extrabold text-paper"
          >
            Quike<span className="text-amber">Quotes</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
