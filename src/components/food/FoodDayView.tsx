"use client";

import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { Container } from "@/components/ui/Container";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useTranslation } from "@/hooks/useTranslation";
import {
  buildCoachDailyPlanForSession,
  normalizeProfileForEngine,
} from "@/lib/coach";
import { dayKeyFromDate } from "@/lib/dateKey";
import {
  buildFoodDayLines,
  buildFoodMealBlocks,
} from "@/lib/food/foodDayContent";
import { generateWeeklyShoppingListForProfile } from "@/lib/food/shoppingList";
import { loadActiveExceptionForDay } from "@/lib/exceptionStorage";
import { loadMinimumDayForDay } from "@/lib/minimumDayStorage";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const FOOD_DAY_KEEP_KEY = "coach-food-flow-v1-keep-day";

export function FoodDayView() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());

  const normalizedProfile = useMemo(
    () => (profile ? normalizeProfileForEngine(profile) : null),
    [profile],
  );

  const dayKey = useMemo(() => dayKeyFromDate(now), [now]);

  const activeException = useMemo(
    () => loadActiveExceptionForDay(dayKey),
    [dayKey],
  );

  const minimumDayActive = useMemo(
    () => loadMinimumDayForDay(dayKey),
    [dayKey],
  );

  const plan = useMemo(() => {
    if (!normalizedProfile) return null;
    return buildCoachDailyPlanForSession({
      profile: normalizedProfile,
      now,
      locale,
      activeException,
      minimumDayActive,
    });
  }, [normalizedProfile, now, locale, activeException, minimumDayActive]);

  const lines = useMemo(() => {
    if (!plan || !normalizedProfile) return [];
    return buildFoodDayLines(plan, normalizedProfile, t).slice(0, 4);
  }, [plan, normalizedProfile, t]);

  const mealBlocks = useMemo(() => {
    if (!plan || !normalizedProfile) return [];
    return buildFoodMealBlocks(plan, normalizedProfile, t, locale, now);
  }, [plan, normalizedProfile, t, locale, now]);

  const weeklyShop = useMemo(() => {
    if (!plan || !normalizedProfile) return null;
    return generateWeeklyShoppingListForProfile(normalizedProfile, plan, {
      daySpan: 7,
      locale,
    });
  }, [plan, normalizedProfile, locale]);

  const [shopOpen, setShopOpen] = useState(false);

  const onKeep = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(FOOD_DAY_KEEP_KEY, dayKey);
      }
    } catch {
      /* ignore */
    }
    router.push("/app");
  };

  if (profile === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[15px] text-muted-2">
        {t("common.loading")}
      </div>
    );
  }

  if (!profile) {
    return <CoachProfileMissingFallback />;
  }

  if (!plan) {
    return (
      <main className="coach-page">
        <Container size="phone" className="px-5 py-12">
          <p className="text-[13px] leading-relaxed text-muted" role="status">
            {t("fallback.sharpensWithUse")}
          </p>
        </Container>
      </main>
    );
  }

  return (
    <main className="coach-page">
      <Container
        size="phone"
        className="flex min-h-[100dvh] flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-[1.25rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {t("foodFlowV1.pageTitle")}
          </h1>
          <button
            type="button"
            disabled={!weeklyShop}
            onClick={() => weeklyShop && setShopOpen(true)}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center self-start rounded-[var(--radius-lg)] border border-accent/40 bg-accent/10 px-4 text-[14px] font-semibold text-accent transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("foodFlowV1.shopWeekCta")}
          </button>
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <ul
            className="space-y-4 text-[15px] leading-snug text-foreground"
            aria-label={t("foodFlowV1.linesAria")}
          >
            {mealBlocks.map((block) => (
              <li
                key={block.slot}
                className="border-b border-white/[0.06] pb-4 last:border-b-0"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                  {block.slotLabel}
                </p>
                <p className="mt-1 text-[16px] font-semibold text-foreground">
                  {block.mealTitle}
                </p>
                <ul className="mt-2 space-y-1 text-[14px] font-medium text-muted">
                  {block.lines.map((ln, j) => (
                    <li key={j}>{ln}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          {mealBlocks.length === 0 ? (
            <ul className="space-y-2.5 text-[15px] leading-snug text-foreground">
              {lines.map((line, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 border-b border-white/[0.06] pb-2.5 last:border-b-0"
                >
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/80"
                    aria-hidden
                  />
                  <span className="min-w-0 text-balance">{line}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {shopOpen && weeklyShop ? (
          <div
            className="fixed inset-0 z-[var(--z-overlay-backdrop)] flex items-center justify-center px-4 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="food-shop-title"
          >
            <button
              type="button"
              tabIndex={-1}
              aria-label={t("common.close")}
              className="absolute inset-0 z-0 cursor-pointer border-0 bg-[color:var(--coach-modal-scrim)] p-0 backdrop-blur-md [touch-action:none]"
              onClick={() => setShopOpen(false)}
            />
            <div
              className="relative z-[var(--z-overlay-sheet)] max-h-[min(78dvh,88svh)] w-full max-w-md overflow-y-auto overscroll-contain rounded-[var(--radius-xl)] border border-[color:var(--coach-modal-panel-border)] bg-[color:var(--coach-modal-panel)] p-5 shadow-[var(--shadow-float)] [-webkit-overflow-scrolling:touch]"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <p
                id="food-shop-title"
                className="text-[17px] font-semibold leading-snug text-foreground"
              >
                {locale === "en" ? weeklyShop.titleEn : weeklyShop.titleFi}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {locale === "en" ? weeklyShop.leadEn : weeklyShop.leadFi}
              </p>
              <div className="mt-5 space-y-5">
                {weeklyShop.groups.map((g) => (
                  <div key={g.key}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                      {locale === "en" ? g.labelEn : g.labelFi}
                    </p>
                    <ul className="mt-2 space-y-2 text-[14px] text-foreground">
                      {g.items.map((it) => {
                        const amt =
                          it.unit === "g"
                            ? `${it.amount} g`
                            : it.unit === "ml"
                              ? `${it.amount} ml`
                              : `${it.amount} kpl`;
                        const name =
                          locale === "en" ? it.labelEn : it.labelFi;
                        return (
                          <li key={it.ingredientKey} className="flex justify-between gap-3">
                            <span className="min-w-0">{name}</span>
                            <span className="shrink-0 text-muted-2">{amt}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShopOpen(false)}
                className="mt-6 flex h-[52px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[16px] font-semibold text-white"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-auto shrink-0 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-6">
          <button
            type="button"
            onClick={onKeep}
            className="flex h-[56px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[17px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("foodFlowV1.ctaKeep")}
          </button>
        </div>
      </Container>
    </main>
  );
}
