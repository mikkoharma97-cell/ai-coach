/**
 * Reitit, joilla `AppShell` (bottom nav) on käytössä — globaalin build-merkin offset.
 */
const APP_SHELL_PATHS = new Set([
  "/app",
  "/food",
  "/workout",
  "/progress",
  "/more",
  "/review",
  "/adjustments",
  "/settings",
  "/preferences",
  "/plans",
  "/nutrition-plans",
  "/food-library",
  "/packages",
  "/profile",
  "/plan",
  "/pro",
  "/scan",
]);

export function isAppShellRoute(pathname: string): boolean {
  const p = pathname.split("?")[0] ?? "";
  return APP_SHELL_PATHS.has(p);
}
