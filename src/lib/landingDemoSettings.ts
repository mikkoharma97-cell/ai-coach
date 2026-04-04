import { useSyncExternalStore } from "react";

export type LandingGoal = "muscle" | "fat_loss";
export type LandingMealStyle = "light" | "flexible";
export type LandingSessionsPerWeek = 3 | 4 | 5 | 6;

export type LandingDemoSettings = {
  goal: LandingGoal;
  sessionsPerWeek: LandingSessionsPerWeek;
  mealStyle: LandingMealStyle;
};

const STORAGE_KEY = "coach-landing-demo-v1";

export const DEFAULT_LANDING_DEMO: LandingDemoSettings = {
  goal: "muscle",
  sessionsPerWeek: 3,
  mealStyle: "flexible",
};

let cache: LandingDemoSettings = DEFAULT_LANDING_DEMO;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function readFromStorage(): LandingDemoSettings {
  if (typeof window === "undefined") return DEFAULT_LANDING_DEMO;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LANDING_DEMO;
    const parsed = JSON.parse(raw) as Partial<LandingDemoSettings>;
    return {
      goal: parsed.goal === "fat_loss" ? "fat_loss" : "muscle",
      sessionsPerWeek: [3, 4, 5, 6].includes(
        parsed.sessionsPerWeek as LandingSessionsPerWeek,
      )
        ? (parsed.sessionsPerWeek as LandingSessionsPerWeek)
        : DEFAULT_LANDING_DEMO.sessionsPerWeek,
      mealStyle: parsed.mealStyle === "light" ? "light" : "flexible",
    };
  } catch {
    return DEFAULT_LANDING_DEMO;
  }
}

export function subscribeLandingDemo(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getLandingDemoSnapshot(): LandingDemoSettings {
  return cache;
}

export function getLandingDemoServerSnapshot(): LandingDemoSettings {
  return DEFAULT_LANDING_DEMO;
}

function settingsEqual(a: LandingDemoSettings, b: LandingDemoSettings): boolean {
  return (
    a.goal === b.goal &&
    a.sessionsPerWeek === b.sessionsPerWeek &&
    a.mealStyle === b.mealStyle
  );
}

export function hydrateLandingDemoFromStorage(): void {
  const next = readFromStorage();
  if (settingsEqual(next, DEFAULT_LANDING_DEMO)) {
    if (cache !== DEFAULT_LANDING_DEMO) {
      cache = DEFAULT_LANDING_DEMO;
      emit();
    }
    return;
  }
  if (settingsEqual(next, cache)) return;
  cache = { ...next };
  emit();
}

export function updateLandingDemo(patch: Partial<LandingDemoSettings>): void {
  const merged: LandingDemoSettings = {
    goal: patch.goal ?? cache.goal,
    sessionsPerWeek: patch.sessionsPerWeek ?? cache.sessionsPerWeek,
    mealStyle: patch.mealStyle ?? cache.mealStyle,
  };
  if (settingsEqual(merged, DEFAULT_LANDING_DEMO)) {
    cache = DEFAULT_LANDING_DEMO;
  } else {
    cache = { ...merged };
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
  emit();
}

export function useLandingDemoSettings(): LandingDemoSettings {
  return useSyncExternalStore(
    subscribeLandingDemo,
    getLandingDemoSnapshot,
    getLandingDemoServerSnapshot,
  );
}
