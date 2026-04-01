/**
 * Päivä + slotti -kohtainen käyttäjän valitsema ateria (engine-template tai oma rivi).
 * Päivä vaihtuu → uusi avain; ei ylikirjoita eilistä ilman käyttäjän tekoa.
 */
import type { MealSlot } from "@/types/coach";

const KEY = "ai-coach-meal-slot-override-v1";

export type MealSlotOverrideV1 =
  | {
      v: 1;
      kind: "template";
      templateId: string;
    }
  | {
      v: 1;
      kind: "custom";
      name: string;
      calories: number;
      protein: number;
      carbsG?: number;
      fatG?: number;
    };

function storageKey(dayKey: string, slot: MealSlot): string {
  return `${dayKey}::${slot}`;
}

function loadMap(): Record<string, MealSlotOverrideV1> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as Record<string, MealSlotOverrideV1>;
    return p && typeof p === "object" ? p : {};
  } catch {
    return {};
  }
}

function saveMap(m: Record<string, MealSlotOverrideV1>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export function loadMealSlotOverride(
  dayKey: string,
  slot: MealSlot,
): MealSlotOverrideV1 | null {
  const m = loadMap();
  const o = m[storageKey(dayKey, slot)];
  if (!o || o.v !== 1) return null;
  return o;
}

export function saveMealSlotOverride(
  dayKey: string,
  slot: MealSlot,
  override: MealSlotOverrideV1,
): void {
  const m = loadMap();
  m[storageKey(dayKey, slot)] = override;
  saveMap(m);
}

export function clearMealSlotOverride(dayKey: string, slot: MealSlot): void {
  const m = loadMap();
  delete m[storageKey(dayKey, slot)];
  saveMap(m);
}
