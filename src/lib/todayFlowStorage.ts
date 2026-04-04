/**
 * Today-näkymän päiväkohtainen tila — kevyt localStorage, ei backendia.
 */

export const TODAY_FLOW_CHANGED = "ai-coach-today-flow-changed";

export type TodayFlowUiState =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped";

export type TodaySkipKind = "light" | "tomorrow";

export type TodayFlowFeedback = "good_continue" | "done_day";

type DayRecord = {
  /** Käyttäjän eksplisiittinen tila (completed/skip/in_progress). */
  flowState: TodayFlowUiState;
  skipKind?: TodaySkipKind;
  /** Merkitään kun käyttäjä klikkaa pää-CTA:ta (jatka-polu). */
  primaryTapped?: boolean;
  feedback?: TodayFlowFeedback | null;
  /** feedback piilotetaan kun Date.now() > tämä */
  feedbackUntil?: number;
};

const STORAGE_KEY = "ai-coach-today-flow-v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function loadStore(): Record<string, DayRecord> {
  if (typeof window === "undefined") return {};
  return safeParse<Record<string, DayRecord>>(localStorage.getItem(STORAGE_KEY)) ?? {};
}

function saveStore(store: Record<string, DayRecord>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent(TODAY_FLOW_CHANGED));
  } catch {
    /* ignore */
  }
}

export function loadTodayFlowRecord(dayKey: string): DayRecord | null {
  const s = loadStore();
  return s[dayKey] ?? null;
}

export function setPrimaryCtaTapped(dayKey: string): void {
  const s = loadStore();
  const prev = s[dayKey] ?? { flowState: "not_started" as const };
  if (prev.flowState === "completed" || prev.flowState === "skipped") return;
  s[dayKey] = {
    ...prev,
    primaryTapped: true,
    flowState: "in_progress",
  };
  saveStore(s);
}

export function markTodaySkipped(args: {
  dayKey: string;
  kind: TodaySkipKind;
  feedback: TodayFlowFeedback;
}): void {
  const { dayKey, kind, feedback } = args;
  const s = loadStore();
  s[dayKey] = {
    flowState: "skipped",
    skipKind: kind,
    feedback,
    feedbackUntil: Date.now() + 8000,
  };
  saveStore(s);
}

export function clearFeedbackForDay(dayKey: string): void {
  const s = loadStore();
  const prev = s[dayKey];
  if (!prev) return;
  const { feedback: _f, feedbackUntil: _u, ...rest } = prev;
  s[dayKey] = rest;
  saveStore(s);
}

export function readActiveFeedback(
  dayKey: string,
): { kind: TodayFlowFeedback; until: number } | null {
  const prev = loadTodayFlowRecord(dayKey);
  if (
    !prev?.feedback ||
    !prev.feedbackUntil ||
    Date.now() > prev.feedbackUntil
  ) {
    return null;
  }
  return { kind: prev.feedback, until: prev.feedbackUntil };
}
