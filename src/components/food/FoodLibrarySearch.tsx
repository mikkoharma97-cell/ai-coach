"use client";

import { FOOD_LIBRARY } from "@/lib/foodLibrary";
import type { FoodLibraryItem, FoodMealSlot } from "@/types/foodLibrary";
import type { Goal } from "@/types/coach";
import { useTranslation } from "@/hooks/useTranslation";
import { useMemo, useState } from "react";

type Filter = {
  q: string;
  goal: Goal | "all";
  mealSlot: FoodMealSlot | "all";
  highProtein: boolean;
  quick: boolean;
  cheap: boolean;
  postWorkout: boolean;
  shift: boolean;
};

function inferGoalFit(item: FoodLibraryItem): Goal[] {
  if (item.goalFit?.length) return item.goalFit;
  if (
    item.tags.includes("high_protein") ||
    item.proteinG / Math.max(1, item.kcal) > 0.08
  ) {
    return ["build_muscle", "lose_weight"];
  }
  return ["improve_fitness", "build_muscle", "lose_weight"];
}

function slotsOf(item: FoodLibraryItem): FoodMealSlot[] {
  if (item.mealSlots?.length) return item.mealSlots;
  if (item.mealSlot) return [item.mealSlot];
  if (item.category === "breakfast") return ["breakfast"];
  if (item.category === "postworkout") return ["postworkout"];
  if (item.category === "snack") return ["snack"];
  if (item.category === "meal") return ["lunch", "dinner"];
  return [];
}

function matches(item: FoodLibraryItem, f: Filter): boolean {
  const fi = item.nameFi.toLowerCase();
  const en = item.nameEn.toLowerCase();
  const tagStr = item.tags.join(" ").toLowerCase();
  if (f.q.trim()) {
    const qq = f.q.trim().toLowerCase();
    if (!fi.includes(qq) && !en.includes(qq) && !tagStr.includes(qq)) {
      return false;
    }
  }
  if (f.goal !== "all" && !inferGoalFit(item).includes(f.goal)) return false;
  if (f.mealSlot !== "all") {
    const sl = slotsOf(item);
    if (!sl.includes(f.mealSlot) && !sl.some((s) => s === f.mealSlot)) {
      return false;
    }
  }
  if (f.highProtein) {
    const ratio = item.proteinG / Math.max(1, item.kcal);
    if (ratio < 0.075 && item.proteinLevel !== "high") return false;
  }
  if (f.quick) {
    const ok =
      item.prepStyle === "quick" ||
      item.prepStyle === "easy" ||
      item.tags.includes("busy") ||
      item.tags.includes("quick");
    if (!ok) return false;
  }
  if (f.cheap) {
    if (
      item.cheap === false &&
      !item.cheapFriendly &&
      !item.tags.includes("cheap")
    ) {
      return false;
    }
  }
  if (f.postWorkout) {
    const ok =
      item.mealSlot === "postworkout" ||
      item.mealSlots?.includes("postworkout") ||
      item.tags.includes("postworkout") ||
      item.category === "postworkout";
    if (!ok) return false;
  }
  if (f.shift && item.shiftFriendly === false) return false;
  return true;
}

const SLOT_OPTS: { v: FoodMealSlot | "all"; fi: string; en: string }[] = [
  { v: "all", fi: "Kaikki slotit", en: "All slots" },
  { v: "breakfast", fi: "Aamiainen", en: "Breakfast" },
  { v: "lunch", fi: "Lounas", en: "Lunch" },
  { v: "dinner", fi: "Päivällinen", en: "Dinner" },
  { v: "snack", fi: "Välipala", en: "Snack" },
  { v: "postworkout", fi: "Treenin jälkeen", en: "Post-workout" },
];

export function FoodLibrarySearch() {
  const { t, locale } = useTranslation();
  const [f, setF] = useState<Filter>({
    q: "",
    goal: "all",
    mealSlot: "all",
    highProtein: false,
    quick: false,
    cheap: false,
    postWorkout: false,
    shift: false,
  });

  const list = useMemo(
    () => FOOD_LIBRARY.filter((item) => matches(item, f)),
    [f],
  );

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={f.q}
        onChange={(e) => setF((x) => ({ ...x, q: e.target.value }))}
        placeholder={t("foodLibrary.searchPlaceholder")}
        className="w-full rounded-[var(--radius-lg)] border border-border bg-background px-4 py-3 text-[16px] text-foreground outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/25"
        autoComplete="off"
      />
      <div className="flex flex-wrap gap-2">
        {(["all", "lose_weight", "build_muscle", "improve_fitness"] as const).map(
          (g) => (
            <button
              key={g}
              type="button"
              onClick={() => setF((x) => ({ ...x, goal: g }))}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                f.goal === g
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border/70 text-muted"
              }`}
            >
              {g === "all"
                ? locale === "fi"
                  ? "Kaikki"
                  : "All"
                : g === "lose_weight"
                  ? t("onboarding.goalLose")
                  : g === "build_muscle"
                    ? t("onboarding.goalMuscle")
                    : t("onboarding.goalFitness")}
            </button>
          ),
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {SLOT_OPTS.map(({ v, fi, en }) => (
          <button
            key={v}
            type="button"
            onClick={() => setF((x) => ({ ...x, mealSlot: v }))}
            className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${
              f.mealSlot === v
                ? "border-accent bg-accent-soft text-accent"
                : "border-border/70 text-muted"
            }`}
          >
            {locale === "fi" ? fi : en}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["highProtein", locale === "fi" ? "Korkea proteiini" : "High protein"],
            ["quick", locale === "fi" ? "Kiireinen" : "Quick"],
            ["cheap", locale === "fi" ? "Halpa" : "Budget"],
            ["postWorkout", locale === "fi" ? "Post-WOD" : "Post-WOD"],
            ["shift", locale === "fi" ? "Vuorotyö" : "Shift-friendly"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() =>
              setF((x) => ({ ...x, [key]: !x[key as keyof Filter] }))
            }
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
              f[key as keyof Filter]
                ? "border-accent bg-accent-soft text-accent"
                : "border-border/70 text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-[12px] text-muted-2" role="status">
        {list.length} {locale === "fi" ? "osumaa" : "matches"}
      </p>
      <ul className="space-y-2">
        {list.map((item) => (
          <li
            key={item.id}
            className="rounded-[var(--radius-lg)] border border-border/60 bg-card/50 px-4 py-3"
          >
            <p className="text-[15px] font-semibold text-foreground">
              {locale === "fi" ? item.nameFi : item.nameEn}
            </p>
            {(locale === "fi" ? item.whyFi : item.whyEn) ? (
              <p className="mt-1 text-[12px] leading-snug text-muted-2">
                {locale === "fi" ? item.whyFi : item.whyEn}
              </p>
            ) : null}
            <p className="mt-1 text-[12px] tabular-nums text-muted">
              {item.kcal} kcal · P {item.proteinG} g
              {item.prepStyle ? ` · ${item.prepStyle}` : ""}
            </p>
            {item.tags.length > 0 ? (
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-2">
                {item.tags.slice(0, 6).join(" · ")}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
