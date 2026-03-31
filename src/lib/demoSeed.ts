/**
 * Demo-tila videota / esittelyä varten — kirjoittaa profiilin ja esimerkkilogit.
 */
import { appendWeightLogEntry } from "@/lib/progress";
import { emptyAnswers } from "@/lib/plan";
import { appendFoodLog } from "@/lib/foodStorage";
import { saveProfile, setDayMarkedDone } from "@/lib/storage";
import type { OnboardingAnswers } from "@/types/coach";
import { calendarDayKey } from "@/lib/dateKeys";

const DEMO_FLAG = "coach-demo-seeded-v1";

export type DemoPresetId = "muscle" | "fat_loss" | "busy";

export const DEMO_PRESET_PROFILE: OnboardingAnswers = {
  ...emptyAnswers(),
  goal: "build_muscle",
  level: "intermediate",
  trainingLevel: "intermediate",
  daysPerWeek: 4,
  eatingHabits: "good",
  biggestChallenge: "lack_of_time",
  mealStructure: "three_meals",
  flexibility: "balanced",
  socialEatingFrequency: "sometimes",
  recentTrainingFreq: "weekly_most",
  trainingVenue: "gym",
  currentWeight: 81.4,
  targetWeight: 84,
  selectedPackageId: "muscle_rhythm",
  programTrackId: "muscle_growth",
};

/** Adobe / video: lihas, laihdutus, kiire — eri Today/Food/Progress fiilikset */
export const DEMO_PRESETS: Record<DemoPresetId, OnboardingAnswers> = {
  muscle: DEMO_PRESET_PROFILE,
  fat_loss: {
    ...emptyAnswers(),
    goal: "lose_weight",
    level: "beginner",
    trainingLevel: "beginner",
    daysPerWeek: 3,
    eatingHabits: "okay",
    biggestChallenge: "fall_off_after_starting",
    mealStructure: "three_meals",
    flexibility: "structured",
    socialEatingFrequency: "sometimes",
    recentTrainingFreq: "weekly_few",
    trainingVenue: "gym",
    currentWeight: 88,
    targetWeight: 82,
    selectedPackageId: "light_cut",
    programTrackId: "light_fat_loss",
  },
  busy: {
    ...emptyAnswers(),
    goal: "improve_fitness",
    level: "intermediate",
    trainingLevel: "intermediate",
    daysPerWeek: 3,
    eatingHabits: "okay",
    biggestChallenge: "lack_of_time",
    mealStructure: "snack_forward",
    flexibility: "flexible",
    socialEatingFrequency: "often",
    recentTrainingFreq: "weekly_few",
    trainingVenue: "home",
    currentWeight: 76,
    targetWeight: 76,
    selectedPackageId: "steady_start",
    programTrackId: "daily_rhythm",
  },
};

function seedWeightTrend(referenceDate: Date): void {
  const base = 80.2;
  for (let i = 14; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const wobble = Math.sin(i * 0.35) * 0.15;
    const trend = (14 - i) * 0.06;
    appendWeightLogEntry(Math.round((base + trend + wobble) * 10) / 10, d);
  }
}

function seedTodayFood(referenceDate: Date): void {
  appendFoodLog(referenceDate, {
    label: "Kaurapuuro + marjat",
    kcal: 380,
    slot: "breakfast",
  });
  appendFoodLog(referenceDate, {
    label: "Kana + riisi",
    kcal: 520,
    slot: "lunch",
  });
  appendFoodLog(referenceDate, {
    label: "Proteiinirahka + marjat",
    kcal: 220,
    slot: "snack",
  });
  appendFoodLog(referenceDate, {
    label: "Lohi, peruna, kasvikset",
    kcal: 640,
    slot: "dinner",
  });
}

/** Merkitse edelliset päivät tehdyikä — streak / review näyttävät eläviltä. */
function seedPastCompletedDays(referenceDate: Date): void {
  for (let i = 1; i <= 7; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    setDayMarkedDone(true, d);
  }
}

function seedPastFoodLogs(referenceDate: Date): void {
  for (const i of [1, 2, 3] as const) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    appendFoodLog(d, {
      label: "Aamiainen",
      kcal: 410,
      slot: "breakfast",
    });
    appendFoodLog(d, {
      label: "Lounas",
      kcal: 560,
      slot: "lunch",
    });
    appendFoodLog(d, {
      label: "Päivällinen",
      kcal: 620,
      slot: "dinner",
    });
  }
}

function demoSessionKey(preset: DemoPresetId): string {
  return `${DEMO_FLAG}:${preset}`;
}

/** Kirjoittaa demo-datan. `preset` oletus muscle (vanha `?demo=1`). */
export function applyDemoPreset(
  referenceDate: Date = new Date(),
  preset: DemoPresetId = "muscle",
): void {
  if (typeof window === "undefined") return;
  const profile = DEMO_PRESETS[preset] ?? DEMO_PRESET_PROFILE;
  saveProfile(profile);
  seedWeightTrend(referenceDate);
  seedPastCompletedDays(referenceDate);
  seedPastFoodLogs(referenceDate);
  seedTodayFood(referenceDate);
  try {
    sessionStorage.setItem(
      demoSessionKey(preset),
      calendarDayKey(referenceDate),
    );
  } catch {
    /* ignore */
  }
}

function demoParamToPreset(raw: string | null): DemoPresetId | null {
  if (raw === "1" || raw === "muscle") return "muscle";
  if (raw === "fat_loss" || raw === "cut") return "fat_loss";
  if (raw === "busy" || raw === "reset") return "busy";
  return null;
}

export function shouldRunDemoFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  if (demoParamToPreset(q.get("demo")) != null) return true;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "1") return true;
  return false;
}

export function hasDemoAlreadySeeded(): boolean {
  if (typeof window === "undefined") return true;
  const q = new URLSearchParams(window.location.search);
  const preset = demoParamToPreset(q.get("demo")) ?? "muscle";
  try {
    return sessionStorage.getItem(demoSessionKey(preset)) != null;
  } catch {
    return true;
  }
}

/**
 * Kutsu clientissä kerran (esim. layout). Tyhjentää ?demo=1 ja lataa sivun uudelleen.
 */
export function runDemoPresetIfNeeded(): void {
  if (typeof window === "undefined") return;
  if (!shouldRunDemoFromUrl()) return;
  if (hasDemoAlreadySeeded()) {
    const url = new URL(window.location.href);
    if (url.searchParams.has("demo")) {
      url.searchParams.delete("demo");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
    return;
  }
  const q = new URLSearchParams(window.location.search);
  const preset = demoParamToPreset(q.get("demo")) ?? "muscle";
  applyDemoPreset(new Date(), preset);
  const url = new URL(window.location.href);
  url.searchParams.delete("demo");
  window.location.replace(url.pathname + url.search);
}
