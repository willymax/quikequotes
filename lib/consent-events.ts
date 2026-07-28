const REOPEN_EVENT = "qq-open-consent-manager";

export function requestConsentManagerOpen() {
  window.dispatchEvent(new CustomEvent(REOPEN_EVENT));
}

export function onConsentManagerOpenRequest(handler: () => void) {
  window.addEventListener(REOPEN_EVENT, handler);
  return () => window.removeEventListener(REOPEN_EVENT, handler);
}
