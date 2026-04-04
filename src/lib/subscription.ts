/**
 * Entitlement: kokeilu + tilaus.
 *
 * **Mock (oletus):** `localStorage` + `subscribed`-boolean — nimetty eksplisiittisesti, ei sekoiteta tuotannon kanssa.
 * **Production:** `NEXT_PUBLIC_COACH_SUBSCRIPTION_MODE=production` + korvaa `read()`/`write()` oikealla kuitti/entitlement-rajapinnalla.
 *
 * Paywallin yksi totuus (hasAccess, syy, billingMode): `getPaywallTruth()` → `src/lib/paywallPolicy.ts`.
 */

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

export const SUBSCRIPTION_STORAGE_KEY = "ai-coach-subscription-v1";
const KEY = SUBSCRIPTION_STORAGE_KEY;
const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

export type SubscriptionState = {
  trialStartedAt: string | null;
  subscribed: boolean;
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
  const s = read();
  write({ ...s, subscribed: value });
}

export function hasSubscriptionAccess(): boolean {
  if (typeof window === "undefined") return true;
  const s = read();
  if (s.subscribed) return true;
  if (!s.trialStartedAt) return true;
  const start = new Date(s.trialStartedAt).getTime();
  return Date.now() < start + TRIAL_MS;
}

/** Trial window ended, not subscribed. */
export function isTrialExpired(): boolean {
  if (typeof window === "undefined") return false;
  const s = read();
  if (s.subscribed || !s.trialStartedAt) return false;
  return Date.now() >= new Date(s.trialStartedAt).getTime() + TRIAL_MS;
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
