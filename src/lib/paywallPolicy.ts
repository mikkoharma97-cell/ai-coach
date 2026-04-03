/**
 * Yksi totuus: milloin käyttäjä on premium-tilassa ja milloin paywall näkyy.
 * Kaikki pääsyn ja overlay-päätökset täältä — Today, SubscriptionGate, PaywallV1Screen, ei hajautettuja ehtoja.
 */

import {
  countDaysMarkedDoneTotal,
  hasPaywallV1Ack,
} from "@/lib/storage";
import {
  getSubscriptionSnapshot,
  hasSubscriptionAccess,
} from "@/lib/subscription";

/**
 * Onko käyttäjällä oikeus käyttää coach-sisältöä (kokeilu tai tilaus).
 * Sama kuin hasSubscriptionAccess — nimetty tuotteen kielellä.
 */
export function canAccessPremium(): boolean {
  return hasSubscriptionAccess();
}

/**
 * SubscriptionGate: ohjaa /paywall kun ei ole enää käyttöoikeutta.
 */
export function shouldRedirectToPaywall(): boolean {
  return !canAccessPremium();
}

/**
 * Today: pehmeä overlay kun kokeilu vielä voimassa mutta 2+ päivää suoritettu eikä tilausta/ack.
 * Kovalevy: trial loppu → shouldRedirectToPaywall, ei overlayta.
 */
export function shouldShowTodayPaywallOverlay(
  overlayDismissed: boolean,
): boolean {
  if (!canAccessPremium()) return false;
  const { subscribed } = getSubscriptionSnapshot();
  if (subscribed) return false;
  if (hasPaywallV1Ack()) return false;
  if (overlayDismissed) return false;
  return countDaysMarkedDoneTotal() >= 2;
}
