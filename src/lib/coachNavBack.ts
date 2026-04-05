/**
 * Coach AppShell — takaisin: eksplisiittinen parent (luotettava kuin pelkkä history).
 * Älä käytä `router.back()` syvillä sivuilla — käytä `getCoachBackFallback` / `pushCoachBack`.
 * @see docs/adr/001-client-navigation.md
 */

function normalizePath(pathname: string): string {
  const raw = pathname.split("?")[0]?.split("#")[0] ?? "/";
  const trimmed = raw.replace(/\/+$/, "") || "/";
  return trimmed;
}

/** Päävälilehdet + juurinäkymät — ei erillistä backia. */
const COACH_ROOT_NO_BACK = new Set([
  "/app",
  "/more",
  "/food",
  "/progress",
  "/today",
]);

export function shouldShowCoachBack(pathname: string): boolean {
  const p = normalizePath(pathname);
  return !COACH_ROOT_NO_BACK.has(p);
}

/**
 * Turvallinen kohde kun käyttäjä haluaa “yksi taso ylös”.
 * Ei käytä `router.back()` — välttää tyhjän historian ja umpikujat.
 */
export function getCoachBackFallback(pathname: string): string {
  const p = normalizePath(pathname);

  if (p === "/workout") return "/app";
  if (p === "/paywall") return "/settings";

  if (p === "/home" || p === "/launch" || p === "/start") {
    return "/app";
  }

  if (p === "/food/day" || p === "/scan" || p === "/food-library") {
    return "/food";
  }

  const moreFamily = new Set([
    "/settings",
    "/preferences",
    "/plans",
    "/nutrition-plans",
    "/packages",
    "/profile",
    "/plan",
    "/pro",
    "/review",
    "/adjustments",
    "/program",
  ]);

  if (moreFamily.has(p)) return "/more";

  return "/app";
}

type RouterPush = {
  push: (href: string, options?: { scroll?: boolean }) => void;
};

/** Turvallinen takaisin-navigointi — sama kohde kuin header-back. */
export function pushCoachBack(router: RouterPush, pathname: string): void {
  router.push(getCoachBackFallback(pathname), { scroll: false });
}
