/**
 * Kevyt tapahtumaseuranta — console nyt, backend myöhemmin (sama rajapinta).
 */

export const ANALYTICS_EVENTS = [
  "open_home",
  "open_compare",
  "open_launch",
  "open_demo",
  "open_start",
  "open_app",
  "onboarding_start",
  "prestart_wall_continue",
  "onboarding_complete",
  "open_today",
  "open_food",
  "open_workout",
  "open_progress",
  "open_more",
  "open_review",
  "open_adjustments",
  "open_paywall",
  "click_trial",
  "complete_day",
  "minimum_day_activate",
  "autopilot_enable",
  "autopilot_disable",
  "log_food",
  "log_activity",
  "add_food",
  "add_activity",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export function trackEvent(
  name: AnalyticsEventName,
  payload?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  const row = {
    name,
    ts: Date.now(),
    path: window.location?.pathname ?? "",
    ...payload,
  };
  console.log("[analytics]", row);

  try {
    const q = JSON.parse(sessionStorage.getItem("analytics_queue") ?? "[]");
    if (Array.isArray(q) && q.length < 200) {
      q.push(row);
      sessionStorage.setItem("analytics_queue", JSON.stringify(q));
    }
  } catch {
    /* ignore */
  }
}
