import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="bg-ink px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-sm font-medium text-paper-muted hover:text-white transition-colors">
            ← Back to QuikeQuotes
          </Link>
          <span className="font-extrabold text-lg tracking-tight text-white">
            QuikeQuotes
          </span>
        </div>
      </header>

      <main className="flex-1 px-6 py-16">
        <article className="mx-auto max-w-3xl [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-[-0.02em] [&_h1]:text-ink [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-ink-muted [&_p]:leading-relaxed [&_p]:mb-4 [&_li]:text-ink-muted [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_a]:text-ink [&_a]:underline">
          {children}
        </article>
      </main>

      <footer className="bg-ink px-6 py-8 text-center text-sm text-paper-muted">
        © {new Date().getFullYear()} QuikeQuotes. Built for the ladder, not the boardroom.
      </footer>
    </div>
  );
}
