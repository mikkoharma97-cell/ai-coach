/**
 * Dev / preview — automaattinen paikallinen reset uuden build-id:n yhteydessä.
 * Ei tuotantologiikkaa; `devAutoResetOnBuildEnabled()` on false productionissa ilman eksplisiittistä lippua.
 */

export const DEV_LS_LAST_BUILD_ID = "dev-last-build-id";
export const DEV_LS_LAST_RESET_BUILD_ID = "dev-last-reset-build-id";
export const DEV_LS_LAST_RESET_AT = "dev-last-reset-at";
/** Session: estää reload-loopin jos localStorage ei päivity odotetusti */
export const DEV_SS_RELOAD_GUARD = "dev-auto-reset-reloaded";
/** Session: lyhyt “reset ok” -vihje BuildMarkerille ensimmäisellä renderillä reloadin jälkeen */
export const DEV_SS_RESET_OK_FLASH = "dev-reset-ok-flash";

export function devAutoResetOnBuildEnabled(): boolean {
  const f = process.env.NEXT_PUBLIC_DEV_AUTO_RESET_ON_BUILD?.trim().toLowerCase();
  if (f === "false" || f === "0") return false;
  if (f === "true" || f === "1") return true;
  return process.env.NODE_ENV !== "production";
}
