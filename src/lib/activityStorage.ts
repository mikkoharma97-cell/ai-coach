import { totalActivityEnergyBonusKcal } from "@/lib/activityEnergy";
import { dayKeyForMondayOffset } from "@/lib/plan";
import type { DailyActivity } from "@/types/activity";

const PREFIX = "ai-coach-daily-activities-v1:";

export const DAILY_ACTIVITIES_CHANGED = "coach-daily-activities-changed";

function storageKey(dateKey: string): string {
  return `${PREFIX}${dateKey}`;
}

function dispatchChanged(dateKey: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(DAILY_ACTIVITIES_CHANGED, { detail: { dateKey } }),
  );
}

function isDailyActivity(x: unknown): x is DailyActivity {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const types = new Set([
    "walk",
    "dog_walk",
    "cycling",
    "active_work",
    "other",
  ]);
  const intens = new Set(["light", "moderate", "hard"]);
  return (
    typeof o.id === "string" &&
    typeof o.type === "string" &&
    types.has(o.type) &&
    typeof o.durationMin === "number" &&
    Number.isFinite(o.durationMin) &&
    typeof o.intensity === "string" &&
    intens.has(o.intensity) &&
    typeof o.date === "string"
  );
}

export function loadDailyActivitiesForDate(dateKey: string): DailyActivity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(dateKey));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isDailyActivity);
  } catch {
    return [];
  }
}

export type ActivityWeekSummaryDay = {
  dateKey: string;
  activities: DailyActivity[];
  bonusKcal: number;
};

export function loadActivityWeekSummary(ref: Date): ActivityWeekSummaryDay[] {
  const out: ActivityWeekSummaryDay[] = [];
  for (let i = 0; i < 7; i++) {
    const dateKey = dayKeyForMondayOffset(ref, i);
    const activities = loadDailyActivitiesForDate(dateKey);
    out.push({
      dateKey,
      activities,
      bonusKcal: totalActivityEnergyBonusKcal(activities),
    });
  }
  return out;
}

export type DailyActivityDraft = Omit<DailyActivity, "id" | "date">;

export function appendDailyActivity(
  dateKey: string,
  entry: DailyActivityDraft,
): DailyActivity {
  const id = `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const full: DailyActivity = {
    ...entry,
    id,
    date: dateKey,
  };
  const list = loadDailyActivitiesForDate(dateKey);
  list.push(full);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(storageKey(dateKey), JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }
  dispatchChanged(dateKey);
  return full;
}

export function removeDailyActivity(dateKey: string, id: string): void {
  const list = loadDailyActivitiesForDate(dateKey).filter((a) => a.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(storageKey(dateKey), JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }
  dispatchChanged(dateKey);
}
