/**
 * Coach-layout: reitit, joille pääsee ilman tallennettua profiilia (SubscriptionGate).
 * Yksi lähde — älä kopioi Settiä eri tiedostoihin.
 */
export const COACH_ROUTES_WITHOUT_PROFILE_OK = new Set<string>([
  "/settings",
  "/preferences",
  "/profile",
  "/scan",
]);

export function coachRouteAllowsNoProfile(pathname: string): boolean {
  const p = pathname.split("?")[0] ?? "";
  return COACH_ROUTES_WITHOUT_PROFILE_OK.has(p);
}
