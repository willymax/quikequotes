/**
 * Terminal statuses that freeze a quote.
 *
 * ACCEPTED and DECLINED are client-decided outcomes — changing prices under a
 * signature is the thing to prevent. EXPIRED stays editable so a stale quote can
 * be revived by extending `validUntil`.
 */
export const LOCKED_STATUSES = ["ACCEPTED", "DECLINED"] as const;

export function isQuoteLocked(status: string): boolean {
  return (LOCKED_STATUSES as readonly string[]).includes(status);
}

export function lockedMessage(status: string): string {
  return status === "ACCEPTED"
    ? "This quote has been accepted and can no longer be edited."
    : "This quote was declined and can no longer be edited.";
}
