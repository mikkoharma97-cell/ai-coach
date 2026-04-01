"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { EXAMPLE_MACRO_RATIO_PCT } from "@/lib/firstUserProgressUi";

/** Ennen ensimmäisiä kirjauksia — selvä esimerkki, ei valehtelevaa käyttäjädataa. */
export function FoodMacroExampleStrip() {
  const { t } = useTranslation();

  return (
    <section
      className="mb-6 rounded-[var(--radius-lg)] border border-dashed border-accent/35 bg-accent/[0.05] px-4 py-4"
      aria-labelledby="food-macro-ex-title"
    >
      <p
        id="food-macro-ex-title"
        className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent"
      >
        {t("food.exampleMacroBadge")}
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-2">
        {t("food.exampleMacroIntro")}
      </p>
      <div
        className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-surface-muted"
        role="img"
        aria-label={t("progress.exampleMacroCaption")}
      >
        <div
          className="bg-accent/55"
          style={{ width: `${EXAMPLE_MACRO_RATIO_PCT.p}%` }}
        />
        <div
          className="bg-accent/35"
          style={{ width: `${EXAMPLE_MACRO_RATIO_PCT.c}%` }}
        />
        <div
          className="bg-foreground/15"
          style={{ width: `${EXAMPLE_MACRO_RATIO_PCT.f}%` }}
        />
      </div>
      <p className="mt-3 text-[10px] leading-snug text-muted-2">
        {t("food.exampleMacroDisclaimer")}
      </p>
    </section>
  );
}
