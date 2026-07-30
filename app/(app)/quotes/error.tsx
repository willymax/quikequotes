"use client";

export default function QuotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="text-sm text-zinc-500 break-words">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="h-11 px-6 rounded-xl bg-zinc-900 text-white font-semibold text-sm"
      >
        Try again
      </button>
    </div>
  );
}
