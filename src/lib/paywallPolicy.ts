/**
 * Paywall — yksi totuus: pääsy, näyttöpäätökset, syy ja billing-tila.
 * Käyttäjät: SubscriptionGate, Today overlay, /paywall (PaywallV1Screen). /subscribe ja /premium → redirect /paywall.
 */

import {
  countDaysMarkedDoneTotal,
  hasPaywallV1Ack,
} from "@/lib/storage";
import {
  getCoachSubscriptionMode,
  getSubscriptionAccessDecision,
  type CoachSubscriptionMode,
} from "@/lib/subscription";

/** Sama kuin subscription.ts — mock = localStorage-demo, production = tuleva oikea kuitti. */
export type PaywallBillingMode = CoachSubscriptionMode;

/** Miksi paywall on esillä (analytics / tuote). */
export type PaywallReason =
  | "none"
  | "trial_expired"
  | "engagement_milestone";

/**
 * Keskitetty tila: pääsy, täysi paywall (kokeilu loppu), syy, billing.
 * Overlay-päätös on erillinen (`getTodayPaywallOverlayDecision`) — vain kun `hasAccess`.
 */
export type PaywallTruth = {
  hasAccess: boolean;
  /** True = käyttäjä pitää ohjata /paywall tai näyttää täysi Paywall V1 (ei trial-pääsyä). */
  shouldShowPaywall: boolean;
  /** Kun `shouldShowPaywall`, aina `trial_expired`; muuten `none`. */
  paywallReason: PaywallReason;
  billingMode: PaywallBillingMode;
  /** Selvä erottelu: mock on localStorage-boolean; production odottaa oikeaa entitlement-koodia. */
  isMockBilling: boolean;
};

export type TodayPaywallOverlayDecision = {
  shouldShow: boolean;
  /** Kun näkyy, analytics-syy. */
  paywallReason: "none" | "engagement_milestone";
};

/** Yksi totuus: näytetäänkö täysi paywall (profiili olemassa, ei maksua). */
export function shouldShowPaywall(): boolean {
  return getSubscriptionAccessDecision().shouldShowPaywall;
}

/**
 * Yksi lähde: access + täysi paywall + billing.
 * Ei sisällä Today-overlay-logiikkaa (vaatii erillisen päätöksen).
 */
export function getPaywallTruth(): PaywallTruth {
  const decision = getSubscriptionAccessDecision();
  const billingMode = getCoachSubscriptionMode();
  return {
    hasAccess: decision.hasAccess,
    shouldShowPaywall: decision.shouldShowPaywall,
    paywallReason: decision.shouldShowPaywall ? "trial_expired" : "none",
    billingMode,
    isMockBilling: billingMode === "mock",
  };
}

/**
 * Today: pehmeä overlay vain trial-käyttäjälle kun 2+ päivää tehty eikä ack/dismiss ole asetettu.
 * Jos access päättynyt → full paywall gate, ei overlayta.
 */
export function getTodayPaywallOverlayDecision(
  overlayDismissed: boolean,
): TodayPaywallOverlayDecision {
  const decision = getSubscriptionAccessDecision();
  if (!decision.hasProfile) {
    return { shouldShow: false, paywallReason: "none" };
  }
  if (decision.shouldShowPaywall) {
    return { shouldShow: false, paywallReason: "none" };
  }
  if (decision.hasPaidAccess) {
    return { shouldShow: false, paywallReason: "none" };
  }
  if (!decision.inTrial) {
    return { shouldShow: false, paywallReason: "none" };
  }
  if (hasPaywallV1Ack()) return { shouldShow: false, paywallReason: "none" };
  if (overlayDismissed) return { shouldShow: false, paywallReason: "none" };
  if (countDaysMarkedDoneTotal() < 2) {
    return { shouldShow: false, paywallReason: "none" };
  }
  return { shouldShow: true, paywallReason: "engagement_milestone" };
}

export function shouldShowTodayPaywallOverlay(
  overlayDismissed: boolean,
): boolean {
  return getTodayPaywallOverlayDecision(overlayDismissed).shouldShow;
}

/** Onko käyttäjällä oikeus coach-sisältöön (kokeilu tai tilaus). */
export function canAccessPremium(): boolean {
  return getPaywallTruth().hasAccess;
}

/** SubscriptionGate + täysi paywall -reitti: ohjaa kun ei pääsyä. */
export function shouldRedirectToPaywall(): boolean {
  return getPaywallTruth().shouldShowPaywall;
}
