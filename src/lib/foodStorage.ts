import type { FoodLogItem, MealSlot, SavedMeal } from "@/types/coach";
import { emitCoachEvent, FOOD_LOG_CHANGED, TODAY_STATE_CHANGED } from "./coachEvents";
import { getDayKey } from "./dayKey";

const SAVED_KEY = "ai-coach-saved-meals-v1";
const LOG_PREFIX = "ai-coach-food-log-v1:";

function legacyUnpaddedDayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function emitFoodCoachEvents(): void {
  emitCoachEvent(FOOD_LOG_CHANGED);
  emitCoachEvent(TODAY_STATE_CHANGED, { kind: "food" });
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadSavedMeals(): SavedMeal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedMeal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSavedMeals(meals: SavedMeal[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(meals.slice(0, 24)));
  } catch {
    /* ignore */
  }
}

export function addSavedMeal(label: string, kcal: number): SavedMeal {
  const meals = loadSavedMeals();
  const meal: SavedMeal = { id: newId(), label: label.trim(), kcal };
  const next = [meal, ...meals.filter((m) => !(m.label === meal.label && m.kcal === meal.kcal))];
  saveSavedMeals(next);
  return meal;
}

export function removeSavedMeal(id: string): void {
  const meals = loadSavedMeals().filter((m) => m.id !== id);
  saveSavedMeals(meals);
}

export function loadFoodLog(date: Date): FoodLogItem[] {
  if (typeof window === "undefined") return [];
  const canonical = getDayKey(date);
  const legacy = legacyUnpaddedDayKey(date);
  try {
    const rawNew = localStorage.getItem(LOG_PREFIX + canonical);
    if (rawNew) {
      const parsed = JSON.parse(rawNew) as FoodLogItem[];
      if (Array.isArray(parsed)) return parsed;
    }
    if (legacy !== canonical) {
      const rawLeg = localStorage.getItem(LOG_PREFIX + legacy);
      if (rawLeg) {
        const parsed = JSON.parse(rawLeg) as FoodLogItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          persistLog(date, parsed);
          return parsed;
        }
      }
    }
  } catch {
    return [];
  }
  return [];
}

function persistLog(date: Date, items: FoodLogItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const canonical = getDayKey(date);
    const legacy = legacyUnpaddedDayKey(date);
    const kNew = LOG_PREFIX + canonical;
    if (items.length === 0) {
      localStorage.removeItem(kNew);
      if (legacy !== canonical) {
        localStorage.removeItem(LOG_PREFIX + legacy);
      }
    } else {
      localStorage.setItem(kNew, JSON.stringify(items));
      if (legacy !== canonical) {
        localStorage.removeItem(LOG_PREFIX + legacy);
      }
    }
  } catch {
    /* ignore */
  }
}

export function appendFoodLog(
  date: Date,
  item: Omit<FoodLogItem, "id">,
): FoodLogItem {
  const log = loadFoodLog(date);
  const row: FoodLogItem = { ...item, id: newId() };
  persistLog(date, [...log, row]);
  emitFoodCoachEvents();
  return row;
}

export function removeFoodLogItem(date: Date, id: string): void {
  const log = loadFoodLog(date).filter((x) => x.id !== id);
  persistLog(date, log);
  emitFoodCoachEvents();
}

export function addQuickFromSaved(
  date: Date,
  saved: SavedMeal,
  slot: MealSlot,
): FoodLogItem {
  return appendFoodLog(date, {
    label: saved.label,
    kcal: saved.kcal,
    slot,
  });
}
