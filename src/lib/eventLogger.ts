/**
 * Kevyt tapahtumalogi — sama rajapinta kuin analytics; ei ulkoista integraatiota vielä.
 */
import { trackEvent } from "@/lib/analytics";

export function logOpenHome(): void {
  trackEvent("open_home");
}

export function logOpenStart(): void {
  trackEvent("open_start");
}

export function logOpenApp(): void {
  trackEvent("open_app");
}

export function logOpenToday(): void {
  trackEvent("open_today");
}

export function logOpenFood(): void {
  trackEvent("open_food");
}

export function logOpenWorkout(): void {
  trackEvent("open_workout");
}

export function logOpenProgress(): void {
  trackEvent("open_progress");
}

export function logOpenReview(): void {
  trackEvent("open_review");
}

export function logOpenPaywall(): void {
  trackEvent("open_paywall");
}

export function logClickTrial(): void {
  trackEvent("click_trial");
}

export function logCompleteDay(): void {
  trackEvent("complete_day");
}

export function logAddFood(): void {
  trackEvent("add_food");
}

export function logAddActivity(): void {
  trackEvent("add_activity");
}
