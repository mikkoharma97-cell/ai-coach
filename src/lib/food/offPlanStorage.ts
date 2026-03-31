import type { OffPlanMeal } from "@/lib/food/offPlan";

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const PREFIX = "ai-coach-offplan-v1:";

export function loadOffPlanMealsForDay(date: Date): OffPlanMeal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(PREFIX + dayKey(date));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OffPlanMeal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOffPlanMealsForDay(date: Date, meals: OffPlanMeal[]): void {
  if (typeof window === "undefined") return;
  try {
    const k = PREFIX + dayKey(date);
    if (meals.length === 0) sessionStorage.removeItem(k);
    else sessionStorage.setItem(k, JSON.stringify(meals.slice(0, 24)));
  } catch {
    /* ignore */
  }
}
