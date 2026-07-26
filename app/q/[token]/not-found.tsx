export default function QuoteNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">🔍</p>
        <h1 className="text-xl font-bold mb-2">Quote Not Found</h1>
        <p className="text-zinc-500 text-sm">
          This quote link may have expired or been removed. Contact the business
          for a new link.
        </p>
      </div>
    </div>
  );
}
