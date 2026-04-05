/**
 * Keskitetyt poikkeavat coach-navigointitapaukset (muuten `next/navigation` + `Link`).
 * @see docs/adr/001-client-navigation.md
 */

/** Paywall-konversio: täysi dokumenttilataus mock-tilan päivityksen jälkeen. */
export function navigateAfterPaywallConvert(): void {
  if (typeof window === "undefined") return;
  window.location.href = "/app";
}
