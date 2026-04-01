import type { MealOption } from "@/lib/mealEngine";
import type { MealSlotOverrideV1 } from "@/lib/mealSlotOverrideStorage";

function sameVegetarianLine(a: MealOption, b: MealOption): boolean {
  const va = a.tags.includes("vegetarian");
  const vb = b.tags.includes("vegetarian");
  return va === vb;
}

/**
 * Sama makrorivi (ei satunnaista hyppää): proteiini + energia lähellä, kasvislinja sama.
 */
export function isCompatibleSubstitution(
  current: MealOption,
  candidate: MealOption,
): boolean {
  if (!sameVegetarianLine(current, candidate)) return false;
  const dP = Math.abs(current.protein - candidate.protein);
  const dK = Math.abs(current.calories - candidate.calories);
  const pOk = dP <= Math.max(12, current.protein * 0.24);
  const kOk = dK <= Math.max(130, current.calories * 0.22);
  return pOk && kOk;
}

function distance(a: MealOption, b: MealOption): number {
  return (
    Math.abs(a.protein - b.protein) * 3 +
    Math.abs(a.calories - b.calories) * 0.4
  );
}

/** Muut kuin nykyinen; ensin yhteensopivat, muuten koko pooli (ei tyhjää listaa). */
/** Näytettävä ehdotus: override > pool[0]. */
export function resolveDisplayedMeal(
  pool: MealOption[],
  o: MealSlotOverrideV1 | null,
): MealOption | null {
  if (pool.length === 0) return null;
  if (o?.kind === "custom") {
    return {
      name: o.name,
      calories: o.calories,
      protein: o.protein,
      carbsG: o.carbsG,
      fatG: o.fatG,
      tags: ["custom"],
    };
  }
  if (o?.kind === "template") {
    const hit = pool.find((x) => x.templateId === o.templateId);
    if (hit) return hit;
  }
  return pool[0];
}

export function listSubstituteCandidates(
  current: MealOption,
  pool: MealOption[],
): MealOption[] {
  const id = current.templateId;
  const others = pool.filter((o) =>
    id && o.templateId ? o.templateId !== id : o.name !== current.name,
  );
  if (others.length === 0) return [];
  const compat = others.filter((o) => isCompatibleSubstitution(current, o));
  const use = compat.length > 0 ? compat : others;
  return [...use].sort((x, y) => distance(current, x) - distance(current, y));
}
