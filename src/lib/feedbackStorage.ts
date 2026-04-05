/**
 * Client-only feedback queue (V2). No backend — localStorage.
 */
import { LOCALE_STORAGE_KEY, type Locale } from "@/lib/i18n";

export const FEEDBACK_STORAGE_KEY = "coach-feedback-v2";

export type FeedbackTypeV2 = "bug" | "confusing" | "idea";

export type FeedbackEntryV2 = {
  id: string;
  message: string;
  type: FeedbackTypeV2;
  path: string;
  device: string;
  viewport: { w: number; h: number };
  timestamp: number;
  lastAction?: string;
};

function isEntry(x: unknown): x is FeedbackEntryV2 {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.message === "string" &&
    (o.type === "bug" || o.type === "confusing" || o.type === "idea") &&
    typeof o.path === "string" &&
    typeof o.device === "string" &&
    typeof o.timestamp === "number" &&
    o.viewport !== null &&
    typeof o.viewport === "object" &&
    typeof (o.viewport as { w?: unknown }).w === "number" &&
    typeof (o.viewport as { h?: unknown }).h === "number"
  );
}

export function loadFeedbackEntries(): FeedbackEntryV2[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry);
  } catch {
    return [];
  }
}

export function appendFeedbackEntry(entry: FeedbackEntryV2): void {
  if (typeof window === "undefined") return;
  try {
    const prev = loadFeedbackEntries();
    window.localStorage.setItem(
      FEEDBACK_STORAGE_KEY,
      JSON.stringify([entry, ...prev]),
    );
    window.dispatchEvent(new CustomEvent("coach-feedback-updated"));
  } catch (e) {
    console.warn("[feedback] append failed", e);
  }
}

/**
 * Dev only: peilaa merkintä repossa olevaan `docs/feedback-log.json` -tiedostoon (API route).
 * Ei vaikuta tuotantoon / `next start` production -buildissa.
 */
export function mirrorFeedbackToDevLogFile(
  entry: FeedbackEntryV2,
  locale: Locale,
): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "development") return;
  const body = JSON.stringify({ ...entry, locale });
  void fetch("/api/dev/feedback-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  }).catch(() => {
    /* dev-tiedosto on lisä; älä häiritse UX:ää */
  });
}

export function clearFeedbackEntries(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(FEEDBACK_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getDeviceKind(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const coarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  return coarse || narrow ? "mobile" : "desktop";
}

export function readClientLocale(): Locale {
  if (typeof window === "undefined") return "fi";
  try {
    const s = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return s === "en" ? "en" : "fi";
  } catch {
    return "fi";
  }
}
