"use client";

import { FOOD_LIBRARY, type FoodLibraryItem } from "@/lib/foodLibrary";
import type { Locale } from "@/lib/i18n";
import type { MealSlot } from "@/types/coach";
import type { TranslateFn } from "@/lib/i18n";

function slotForItem(item: FoodLibraryItem): MealSlot {
  if (item.tags.includes("breakfast")) return "breakfast";
  if (item.tags.includes("snack")) return "snack";
  return "lunch";
}

export function FoodLibraryQuickBlock({
  onPick,
  t,
  locale,
}: {
  onPick: (slot: MealSlot, item: FoodLibraryItem) => void;
  t: TranslateFn;
  locale: Locale;
}) {
  return (
    <section
      className="mt-5 rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] px-4 py-4"
      aria-labelledby="food-library-heading"
    >
      <p
        id="food-library-heading"
        className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent/90"
      >
        {t("food.libraryEyebrow")}
      </p>
      <p className="mt-1 text-[12px] leading-snug text-muted-2">{t("food.libraryHint")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {FOOD_LIBRARY.map((item) => (
          <button
            key={item.id}
            type="button"
            className="rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-left text-[12px] font-medium leading-snug text-foreground transition hover:border-accent/35 hover:bg-white/[0.08]"
            onClick={() => onPick(slotForItem(item), item)}
          >
            <span className="block">
              {locale === "en" ? item.nameEn : item.nameFi}
            </span>
            <span className="text-[11px] font-normal text-muted-2">
              {item.kcal} kcal · P{item.proteinG}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
