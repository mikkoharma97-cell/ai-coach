/**
 * Ruokavaihtoehdot tavoitteen mukaan — generaattori koostaa päivän, ei yksi kiinteä ateria.
 */
import type { Goal } from "@/types/coach";
import type { MealSlot } from "@/types/coach";
import type { MealOptionGroup } from "@/types/meal";

/** Vaihtoehtorivit per slotti (2–3 vaihtoehtoa / rivi) */
const BREAKFAST: Record<Goal, string[][]> = {
  lose_weight: [
    ["rahka + marjat + pähkinät", "proteiinijuoma + banaani"],
    ["kananmuna + täysjyväleipä", "puuro + marjat"],
  ],
  build_muscle: [
    ["rahka + marjat + pähkinät", "kananmuna + leipä + avokado", "proteiinijuoma + banaani"],
    ["puuro + proteiini", "munakas + peruna"],
  ],
  improve_fitness: [
    ["puuro + marjat", "leipä + juusto + kasvikset"],
    ["rahka + hedelmä", "smoothie (proteiini + marja)"],
  ],
};

const LUNCH: Record<Goal, string[][]> = {
  lose_weight: [
    ["kana + riisi + salaatti", "kala + peruna + kasvikset"],
    ["tofu + täysjyvä + vihreä", "keitto + leipä"],
  ],
  build_muscle: [
    ["lämmin ateria: proteiini + hiilari + kasvikset", "pasta + jauheliha + salaatti"],
    ["riisipata", "salaatti + kana + öljy"],
  ],
  improve_fitness: [
    ["lounas: proteiini + hiilari", "keitto + täysjyvä"],
    ["salaatti + kana", "vegepihvi + peruna"],
  ],
};

const DINNER: Record<Goal, string[][]> = {
  lose_weight: [
    ["kevyt proteiini + kasvikset", "kalakeitto + leipä"],
    ["munakas + salaatti", "uunikala + vihannes"],
  ],
  build_muscle: [
    ["proteiini + hiilari + kasvikset", "pasta + lihapulla"],
    ["pihvi + peruna", "kala + riisi"],
  ],
  improve_fitness: [
    ["lämmin ateria tasapainoisesti", "keitto + leipä"],
    ["kala + peruna", "kasvis + tofu"],
  ],
};

const SNACK: Record<Goal, string[][]> = {
  lose_weight: [["proteiinijogurtti", "hedelmä"], ["pähkinät (pieni annos)", "proteiinipatukka"]],
  build_muscle: [["proteiinijuoma", "banaani + pähkinät"], ["rahka", "leipä + juusto"]],
  improve_fitness: [["hedelmä", "pähkinät"], ["jogurtti", "välipala patukka"]],
};

function slotForKey(k: string): MealSlot {
  if (k === "breakfast") return "breakfast";
  if (k === "lunch") return "lunch";
  if (k === "dinner") return "dinner";
  return "snack";
}

/** Palauttaa vaihtoehtoryhmät (useita rivejä) annetulle slottille ja tavoitteelle */
export function mealOptionRowsForSlot(
  slot: MealSlot,
  goal: Goal,
): string[][] {
  const table =
    slot === "breakfast"
      ? BREAKFAST[goal]
      : slot === "lunch"
        ? LUNCH[goal]
        : slot === "dinner"
          ? DINNER[goal]
          : SNACK[goal];
  return table ?? [];
}

/** Rakentaa `MealOptionGroup`-olioita (type + options) — käytä näitä UI:ssa */
export function mealOptionGroupsForGoal(goal: Goal): MealOptionGroup[] {
  const keys = ["breakfast", "lunch", "dinner", "snack"] as const;
  const out: MealOptionGroup[] = [];
  for (const k of keys) {
    const slot = slotForKey(k);
    for (const row of mealOptionRowsForSlot(slot, goal)) {
      if (row.length >= 2) {
        out.push({
          type: slot,
          options: row.slice(0, 3),
        });
      }
    }
  }
  return out;
}
