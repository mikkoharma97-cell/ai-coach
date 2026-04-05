/**
 * Entitlement: kokeilu + tilaus.
 *
 * **Mock (oletus):** `localStorage` + `subscribed`-boolean — nimetty eksplisiittisesti, ei sekoiteta tuotannon kanssa.
 * **Production:** `NEXT_PUBLIC_COACH_SUBSCRIPTION_MODE=production` + korvaa `read()`/`write()` oikealla kuitti/entitlement-rajapinnalla.
 *
 * Paywallin yksi totuus (hasAccess, syy, billingMode): `getPaywallTruth()` → `src/lib/paywallPolicy.ts`.
 */

/** Yksi totuus käyttäjätilasta (profiili + mock-maksu). */
export type UserSubscriptionState =
  | "NO_PROFILE"
  | "ACTIVE_PAID"
  | "ACTIVE_FREE";

/** Profiilimerkki paywall-tilalle (erillinen `ai-coach-profile-v3` -JSONista). */
export const COACH_PROFILE_STORAGE_KEY = "coach_profile";
export const COACH_PAID_STORAGE_KEY = "coach_paid";

/** `mock` = localStorage-demo. `production` = varattu oikealle billingille (env-lippu + toteutus). */
export type CoachSubscriptionMode = "mock" | "production";

export function getCoachSubscriptionMode(): CoachSubscriptionMode {
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_COACH_SUBSCRIPTION_MODE === "production"
  ) {
    return "production";
  }
  return "mock";
}

/**
 * Legacy trial JSON (ai-coach-subscription-v1):
 * - käyttää `trialStartedAt` + `subscribed` mock-kenttiä
 * - EI ole nykyinen paywall-gaten päätotuus
 */
export const SUBSCRIPTION_STORAGE_KEY = "ai-coach-subscription-v1";
const KEY = SUBSCRIPTION_STORAGE_KEY;
const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

export type SubscriptionState = {
  trialStartedAt: string | null;
  subscribed: boolean;
};

export type SubscriptionAccessDecision = {
  state: UserSubscriptionState;
  hasProfile: boolean;
  hasPaidAccess: boolean;
  inTrial: boolean;
  trialExpired: boolean;
  trialStartedAt: string | null;
  trialEndsAt: number | null;
  hasAccess: boolean;
  shouldShowPaywall: boolean;
  billingMode: CoachSubscriptionMode;
};

function read(): SubscriptionState {
  if (typeof window === "undefined") {
    return { trialStartedAt: null, subscribed: false };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { trialStartedAt: null, subscribed: false };
    const p = JSON.parse(raw) as SubscriptionState;
    return {
      trialStartedAt:
        typeof p.trialStartedAt === "string" ? p.trialStartedAt : null,
      subscribed: Boolean(p.subscribed),
    };
  } catch {
    return { trialStartedAt: null, subscribed: false };
  }
}

function write(s: SubscriptionState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/** Idempotent — call on profile save or first coach visit with a profile. */
export function ensureTrialStarted(): void {
  const s = read();
  if (s.trialStartedAt) return;
  write({
    ...s,
    trialStartedAt: new Date().toISOString(),
  });
}

/** Mock-tilassa: tallentaa booleanin. Production-tilassa: korvaa oikealla entitlement-päivityksellä. */
export function setSubscribed(value: boolean): void {
  if (typeof window === "undefined") return;
  // Active write path: keep legacy snapshot in sync, but `coach_paid` is the gate key.
  if (value) {
    localStorage.setItem(COACH_PAID_STORAGE_KEY, "1");
  } else {
    localStorage.removeItem(COACH_PAID_STORAGE_KEY);
  }
  const s = read();
  write({ ...s, subscribed: value });
}

/**
 * Yksi totuus: profiili (`coach_profile`) + mock-maksu (`coach_paid`).
 * `coach_profile` asetetaan `saveProfile` / `loadProfile` -polulla.
 * Tämä on aktiivinen gate-malli (`NO_PROFILE` / `ACTIVE_FREE` / `ACTIVE_PAID`).
 */
export function getUserSubscriptionState(): UserSubscriptionState {
  if (typeof window === "undefined") return "NO_PROFILE";
  const hasProfile = Boolean(localStorage.getItem(COACH_PROFILE_STORAGE_KEY));
  const isPaid = localStorage.getItem(COACH_PAID_STORAGE_KEY) === "1";
  if (!hasProfile) return "NO_PROFILE";
  if (isPaid) return "ACTIVE_PAID";
  return "ACTIVE_FREE";
}

/** Testi: merkitse maksu voimassa ilman oikeaa kuittia. */
export function activateFakeSubscription(): void {
  setSubscribed(true);
}

export function resetSubscription(): void {
  setSubscribed(false);
}

export function hasSubscriptionAccess(): boolean {
  return getSubscriptionAccessDecision().hasAccess;
}

/** Trial window ended, not subscribed. */
export function isTrialExpired(): boolean {
  return getSubscriptionAccessDecision().trialExpired;
}

export function hasTrialStarted(): boolean {
  return Boolean(read().trialStartedAt);
}

export function getSubscriptionSnapshot(): {
  subscribed: boolean;
  trialStartedAt: string | null;
  trialEndsAt: number | null;
  daysLeftInTrial: number;
  inTrial: boolean;
} {
  if (typeof window === "undefined") {
    return {
      subscribed: false,
      trialStartedAt: null,
      trialEndsAt: null,
      daysLeftInTrial: 0,
      inTrial: false,
    };
  }
  const s = read();
  if (s.subscribed) {
    return {
      subscribed: true,
      trialStartedAt: s.trialStartedAt,
      trialEndsAt: null,
      daysLeftInTrial: 0,
      inTrial: false,
    };
  }
  if (!s.trialStartedAt) {
    return {
      subscribed: false,
      trialStartedAt: null,
      trialEndsAt: null,
      daysLeftInTrial: 0,
      inTrial: false,
    };
  }
  const start = new Date(s.trialStartedAt).getTime();
  const end = start + TRIAL_MS;
  const left = Math.max(0, end - Date.now());
  const daysLeftRaw = Math.max(0, Math.ceil(left / (24 * 60 * 60 * 1000)));
  const inTrial = Date.now() < end;
  const mockDays = readCoachMockTrialDays();
  const daysLeftInTrial =
    mockDays != null && inTrial ? mockDays : daysLeftRaw;
  return {
    subscribed: false,
    trialStartedAt: s.trialStartedAt,
    trialEndsAt: end,
    daysLeftInTrial,
    inTrial,
  };
}

/** Dev / preview: `NEXT_PUBLIC_COACH_MOCK_TRIAL_DAYS=7` → näytä kokeilupäivät (0–14). */
function readCoachMockTrialDays(): number | null {
  if (typeof window === "undefined") return null;
  const raw = process.env.NEXT_PUBLIC_COACH_MOCK_TRIAL_DAYS;
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0 || n > 14) return null;
  return n;
}

/** Jäljellä olevat kokeilupäivät (0 jos ei kokeilussa / tilaus). */
export function getTrialDaysLeft(): number {
  return getSubscriptionSnapshot().daysLeftInTrial;
}

/** Alias — sama kuin getTrialDaysLeft. */
export function trialDaysLeft(): number {
  return getTrialDaysLeft();
}

export const TRIAL_DAYS = 7;

/**
 * Single source for access decisions used by gate/paywall/today.
 * Reads profile marker, paid marker and legacy trial snapshot in one place.
 */
export function getSubscriptionAccessDecision(): SubscriptionAccessDecision {
  if (typeof window === "undefined") {
    return {
      state: "NO_PROFILE",
      hasProfile: false,
      hasPaidAccess: false,
      inTrial: false,
      trialExpired: false,
      trialStartedAt: null,
      trialEndsAt: null,
      hasAccess: false,
      shouldShowPaywall: false,
      billingMode: getCoachSubscriptionMode(),
    };
  }

  const hasProfile = Boolean(localStorage.getItem(COACH_PROFILE_STORAGE_KEY));
  const hasPaidAccess = localStorage.getItem(COACH_PAID_STORAGE_KEY) === "1";
  const s = read();

  const trialStartedAt = s.trialStartedAt;
  const trialEndsAt = trialStartedAt
    ? new Date(trialStartedAt).getTime() + TRIAL_MS
    : null;
  const trialExpired =
    trialEndsAt != null ? Date.now() >= trialEndsAt : false;
  const inTrial = hasProfile && !hasPaidAccess && !trialExpired;

  const state: UserSubscriptionState = !hasProfile
    ? "NO_PROFILE"
    : hasPaidAccess
      ? "ACTIVE_PAID"
      : "ACTIVE_FREE";

  const hasAccess = hasProfile && (hasPaidAccess || inTrial);
  const shouldShowPaywall = hasProfile && !hasPaidAccess && trialExpired;

  return {
    state,
    hasProfile,
    hasPaidAccess,
    inTrial,
    trialExpired,
    trialStartedAt,
    trialEndsAt,
    hasAccess,
    shouldShowPaywall,
    billingMode: getCoachSubscriptionMode(),
  };
}
