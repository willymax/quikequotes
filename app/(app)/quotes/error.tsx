"use client";

import { buttonClass, PAGE_SHELL } from "@/lib/ui";

export default function QuotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={`${PAGE_SHELL} text-center space-y-4`}>
      <h1 className="type-display text-2xl font-extrabold">Something went wrong</h1>
      <p className="text-sm text-ink-muted break-words">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className={buttonClass()}
      >
        Try again
      </button>
    </div>
  );
}
