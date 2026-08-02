import { BADGE_CLASS, statusMeta } from "@/lib/status";

export function StatusBadge({
  status,
  long = false,
  className = "",
}: {
  status: string;
  /** Detail pages have room for the "why it matters" wording. */
  long?: boolean;
  className?: string;
}) {
  const meta = statusMeta(status);
  return (
    <span className={`${BADGE_CLASS} ${meta.badge} ${className}`}>
      {long ? meta.longLabel : meta.label}
    </span>
  );
}
