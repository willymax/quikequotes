import { PAGE_SHELL } from "@/lib/ui";

/** Mirrors the real dashboard's shape so the page doesn't jump when data lands. */
export default function DashboardLoading() {
  return (
    <div className={PAGE_SHELL}>
      <div className="flex items-center justify-between mb-5">
        <div className="h-9 w-32 bg-line rounded-lg animate-pulse" />
        <div className="h-9 w-20 bg-line rounded-full animate-pulse" />
      </div>

      <div className="rounded-2xl bg-ink p-5 mb-4">
        <div className="h-2.5 w-24 bg-white/15 rounded animate-pulse" />
        <div className="h-10 w-48 bg-white/10 rounded-lg animate-pulse mt-3" />
        <div className="h-3 w-32 bg-white/10 rounded animate-pulse mt-3" />
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
          <div className="h-5 w-20 bg-white/10 rounded animate-pulse" />
          <div className="h-5 w-12 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      <div className="flex gap-2 mb-3 mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-16 bg-line rounded-full animate-pulse" />
        ))}
      </div>

      <div className="h-10 w-full bg-line rounded-xl animate-pulse mb-5" />

      <ul className="space-y-2.5">
        {[...Array(4)].map((_, i) => (
          <li
            key={i}
            className="rounded-2xl border border-l-[5px] border-line bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-line rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-line rounded animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-line rounded-full animate-pulse" />
            </div>
            <div className="mt-3 h-4 w-24 bg-line rounded animate-pulse" />
          </li>
        ))}
      </ul>
    </div>
  );
}
