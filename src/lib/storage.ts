import { LOCALE_STORAGE_KEY } from "@/lib/i18n";
import { emptyAnswers } from "@/lib/plan";
import { PRO_WORKSPACE_KEY } from "@/lib/proWorkspace";
import {
  ensureTrialStarted,
  SUBSCRIPTION_STORAGE_KEY,
} from "@/lib/subscription";
import { savePlannedEvents } from "@/lib/eventsStorage";
import { clearWorkShiftStorage } from "@/lib/workShiftStorage";
import { clearExceptionStorage } from "@/lib/exceptionStorage";
import { normalizeNutritionBlueprintId } from "@/lib/nutritionBlueprints";
import { normalizeProgramPackageId } from "@/lib/programPackages";
import { normalizeProgramBlueprintId } from "@/lib/programBlueprints";
import { normalizeProgramTrackId } from "@/lib/programTracks";
import type { CoachMode, DayOutcomeHint, OnboardingAnswers } from "@/types/coach";

function normalizeCoachMode(m: unknown): CoachMode {
  return m === "pro" ? "pro" : "guided";
}

export const PROFILE_KEY_V3 = "ai-coach-profile-v3";
const PROFILE_KEY_V2 = "ai-coach-profile-v2";
const DAY_DONE_PREFIX = "ai-coach-day-done:";
const OUTCOME_HINT_PREFIX = "ai-coach-outcome-hint:";

/** Kun outcome-hint päivittyy (esim. pikamuistiinpano) — Today voi päivittyä */
export const OUTCOME_HINT_CHANGED = "coach-outcome-hint-changed";
const FOOD_LOG_PREFIX = "ai-coach-food-log-v1:";
const SAVED_MEALS_KEY = "ai-coach-saved-meals-v1";

export function saveProfile(answers: OnboardingAnswers): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY_V3, JSON.stringify(answers));
    localStorage.removeItem(PROFILE_KEY_V2);
    ensureTrialStarted();
  } catch {
    /* ignore */
  }
}

/** Removes only persisted profile keys (v2/v3). Use when JSON is unparseable. */
export function clearCorruptCoachData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PROFILE_KEY_V3);
    localStorage.removeItem(PROFILE_KEY_V2);
  } catch {
    /* ignore */
  }
}

export function loadProfile(): OnboardingAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const v3 = localStorage.getItem(PROFILE_KEY_V3);
    if (v3) {
      let parsed: OnboardingAnswers;
      try {
        parsed = JSON.parse(v3) as OnboardingAnswers;
      } catch (e) {
        console.warn("[coach] profile parse failed (v3 JSON)", e);
        clearCorruptCoachData();
        return null;
      }
      try {
        return {
          ...emptyAnswers(),
          ...parsed,
          selectedPackageId: normalizeProgramPackageId(parsed.selectedPackageId),
          programTrackId: normalizeProgramTrackId(parsed.programTrackId),
          mode: normalizeCoachMode(parsed.mode),
          programBlueprintId:
            normalizeProgramBlueprintId(parsed.programBlueprintId) ?? undefined,
          nutritionBlueprintId:
            normalizeNutritionBlueprintId(parsed.nutritionBlueprintId) ??
            undefined,
        } as OnboardingAnswers;
      } catch (e) {
        console.warn("[coach] profile normalize failed (v3)", e);
        clearCorruptCoachData();
        return null;
      }
    }
    const v2 = localStorage.getItem(PROFILE_KEY_V2);
    if (v2) {
      let parsed: OnboardingAnswers;
      try {
        parsed = JSON.parse(v2) as OnboardingAnswers;
      } catch (e) {
        console.warn("[coach] profile parse failed (v2 JSON)", e);
        try {
          localStorage.removeItem(PROFILE_KEY_V2);
        } catch {
          /* ignore */
        }
        return null;
      }
      const merged = {
        ...emptyAnswers(),
        ...parsed,
        selectedPackageId: normalizeProgramPackageId(parsed.selectedPackageId),
        programTrackId: normalizeProgramTrackId(parsed.programTrackId),
        mode: normalizeCoachMode(parsed.mode),
        programBlueprintId:
          normalizeProgramBlueprintId(parsed.programBlueprintId) ?? undefined,
        nutritionBlueprintId:
          normalizeNutritionBlueprintId(parsed.nutritionBlueprintId) ??
          undefined,
      } as OnboardingAnswers;
      saveProfile(merged);
      return merged;
    }
    return null;
  } catch (e) {
    console.warn("[coach] loadProfile unexpected error", e);
    return null;
  }
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PROFILE_KEY_V3);
    localStorage.removeItem(PROFILE_KEY_V2);
  } catch {
    /* ignore */
  }
}

/** Profile, food logs, saved meals, day marks, outcome hints, planned events, subscription — local only. */
export function clearAllCoachLocalData(): void {
  if (typeof window === "undefined") return;
  clearProfile();
  clearWorkShiftStorage();
  try {
    localStorage.removeItem(PRO_WORKSPACE_KEY);
    localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
    localStorage.removeItem(SAVED_MEALS_KEY);
    savePlannedEvents([]);
    clearExceptionStorage();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (
        k.startsWith(DAY_DONE_PREFIX) ||
        k.startsWith(OUTCOME_HINT_PREFIX) ||
        k.startsWith(FOOD_LOG_PREFIX) ||
        k.startsWith("ai-coach-day-exec-v1:") ||
        k.startsWith("ai-coach-thinkless-v1:")
      ) {
        localStorage.removeItem(k);
      }
    }
  } catch {
    /* ignore */
  }
}

/** JSON snapshot of all coach-related localStorage keys (backup before clear). */
export function exportCoachDataJson(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith("ai-coach-") || k === LOCALE_STORAGE_KEY) {
        data[k] = localStorage.getItem(k);
      }
    }
    return JSON.stringify(
      { exportedAt: new Date().toISOString(), data },
      null,
      2,
    );
  } catch {
    return null;
  }
}

export function probeLocalStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const k = "__ai_coach_ls_probe__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function isDayMarkedDone(date: Date = new Date()): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(DAY_DONE_PREFIX + dayKey(date)) === "1";
  } catch {
    return false;
  }
}

export function setDayMarkedDone(
  done: boolean,
  date: Date = new Date(),
): void {
  if (typeof window === "undefined") return;
  try {
    const k = DAY_DONE_PREFIX + dayKey(date);
    if (done) localStorage.setItem(k, "1");
    else localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

/** Optional hints for a completed day (e.g. future quick log). Safe no-op if unset. */
export function loadOutcomeHint(date: Date): DayOutcomeHint | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(OUTCOME_HINT_PREFIX + dayKey(date));
    if (!raw) return null;
    return JSON.parse(raw) as DayOutcomeHint;
  } catch {
    return null;
  }
}

export function saveOutcomeHint(date: Date, hint: DayOutcomeHint): void {
  if (typeof window === "undefined") return;
  try {
    const k = OUTCOME_HINT_PREFIX + dayKey(date);
    const hasContent =
      Boolean(hint.caloriesOver) ||
      Boolean(hint.skippedWorkout) ||
      Boolean(hint.activityUnder) ||
      Boolean(hint.quickNote?.trim());
    if (!hasContent) {
      localStorage.removeItem(k);
      window.dispatchEvent(new Event(OUTCOME_HINT_CHANGED));
      return;
    }
    localStorage.setItem(k, JSON.stringify(hint));
    window.dispatchEvent(new Event(OUTCOME_HINT_CHANGED));
  } catch {
    /* ignore */
  }
}

/** Yhdistää eilisen/päivän outcome-vihjeen (1-tap Skip jne.). */
export function mergeOutcomeHint(
  date: Date,
  partial: Partial<DayOutcomeHint>,
): void {
  const prev = loadOutcomeHint(date) ?? {};
  saveOutcomeHint(date, { ...prev, ...partial });
}

/** True once the user has marked at least one day complete (avoids “missed” on first visit). */
export function hasEverMarkedDayDone(): boolean {
  if (typeof window === "undefined") return false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k?.startsWith(DAY_DONE_PREFIX) &&
        localStorage.getItem(k) === "1"
      ) {
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}
