export default function DashboardLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-24 bg-zinc-100 rounded-lg animate-pulse" />
        <div className="h-10 w-28 bg-zinc-100 rounded-full animate-pulse" />
      </div>
      <ul className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <li key={i} className="rounded-2xl border border-zinc-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-zinc-100 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-zinc-100 rounded animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-zinc-100 rounded-full animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
