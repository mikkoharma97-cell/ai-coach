"use client";

import { HelpVideoCard } from "@/components/ui/HelpVideoCard";
import { CoachScreenHeader } from "@/components/ui/CoachScreenHeader";
import { Container } from "@/components/ui/Container";
import { CoachSystemStatus } from "@/components/ui/CoachSystemStatus";
import { useTranslation } from "@/hooks/useTranslation";
import {
  buildCoachEngineBundle,
  mergeExceptionIntoDailyPlan,
  normalizeProfileForEngine,
  resolveExceptionGuidance,
} from "@/lib/coach";
import { trackEvent } from "@/lib/analytics";
import { dayKeyFromDate } from "@/lib/dateKey";
import { generateDailyPlan } from "@/lib/dailyEngine";
import { getRebalanceMessage } from "@/lib/nutrition/rebalance";
import {
  EXCEPTION_STATE_CHANGED,
  loadActiveExceptionForDay,
} from "@/lib/exceptionStorage";
import { getProgramPackage, packageLabel } from "@/lib/programPackages";
import { dateLocaleForUi, type MessageKey, type TranslateFn } from "@/lib/i18n";
import { FoodVoiceQuickBlock } from "@/components/food/FoodVoiceQuickBlock";
import { FoodLibraryQuickBlock } from "@/components/food/FoodLibraryQuickBlock";
import { FoodOffPlanQuickBlock } from "@/components/food/FoodOffPlanQuickBlock";
import { FoodIntelligenceBlock } from "@/components/food/FoodIntelligenceBlock";
import { FoodMealSlotBlock } from "@/components/food/FoodMealSlotBlock";
import { FoodShoppingListBlock } from "@/components/food/FoodShoppingListBlock";
import { FoodTodayStrip } from "@/components/food/FoodTodayStrip";
import { foodDataFallbackKey } from "@/lib/dataConfidence";
import { generateWeeklyShoppingListForProfile } from "@/lib/food/shoppingList";
import {
  foodEnergyStatusKey,
  foodGoalSupportEnergyKey,
  foodWhyThisMealKey,
} from "@/lib/foodRecommendationCopy";
import {
  generateDailyMeals,
  nextSwapIndex,
  optionsForSlot,
  type MealOption,
} from "@/lib/mealEngine";
import {
  addQuickFromSaved,
  addSavedMeal,
  appendFoodLog,
  loadFoodLog,
  loadSavedMeals,
  removeFoodLogItem,
  removeSavedMeal,
} from "@/lib/foodStorage";
import { estimateConsumedFromKcalLog } from "@/lib/food/dayMacros";
import { nutritionKcalRangeHint } from "@/lib/nutrition";
import { loadOffPlanMealsForDay, saveOffPlanMealsForDay } from "@/lib/food/offPlanStorage";
import type { OffPlanMeal } from "@/lib/food/offPlan";
import { concreteMealIdeasForDay } from "@/lib/mealPackageConfig";
import { CoachAppShortcuts } from "@/components/app/CoachAppShortcuts";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useAsyncButtonState } from "@/hooks/useAsyncButtonState";
import { useOverlayLayer } from "@/hooks/useOverlayLayer";
import { useClientProfile } from "@/hooks/useClientProfile";
import { foodCoachLineKey } from "@/lib/coachPresenceCopy";
import { getCoachFeatureToggles } from "@/lib/coachFeatureToggles";
import { loadOutcomeHint } from "@/lib/storage";
import { getMondayBasedIndex } from "@/lib/plan";
import Link from "next/link";
import type { FoodLibraryItem } from "@/lib/foodLibrary";
import type {
  DailyMacros,
  MealSlot,
  MealStructurePreference,
  OnboardingAnswers,
  SavedMeal,
} from "@/types/coach";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { flowLog } from "@/lib/flowLog";
import { logButtonClick } from "@/lib/uiInteractionDebug";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

function mealCardSubtitleKey(
  structure: MealStructurePreference,
  slot: MealSlot,
): MessageKey {
  if (slot === "breakfast") return "food.mealSubtitleBreakfast";
  if (slot === "snack") return "food.mealSubtitleSnack";
  if (slot === "dinner" && structure === "lighter_evening") {
    return "food.mealSubtitleLight";
  }
  return "food.mealSubtitleWarm";
}

function slotFlowCaption(
  structure: MealStructurePreference,
  slot: MealSlot,
  t: TranslateFn,
): { title: string; sub: string } {
  switch (slot) {
    case "breakfast":
      return { title: t("food.flowMorning"), sub: t("food.flowMorningSub") };
    case "lunch":
      return { title: t("food.flowDay"), sub: t("food.flowDaySub") };
    case "snack":
      return { title: t("food.flowBridge"), sub: t("food.flowBridgeSub") };
    case "dinner":
      return structure === "lighter_evening"
        ? { title: t("food.flowEvening"), sub: t("food.flowEveningLightSub") }
        : { title: t("food.flowEvening"), sub: t("food.flowEveningSub") };
  }
}

function mealSlots(
  structure: MealStructurePreference,
  t: TranslateFn,
): { slot: MealSlot; label: string }[] {
  switch (structure) {
    case "three_meals":
      return [
        { slot: "breakfast", label: t("food.slotBreakfast") },
        { slot: "lunch", label: t("food.slotLunch") },
        { slot: "dinner", label: t("food.slotDinner") },
      ];
    case "lighter_evening":
      return [
        { slot: "breakfast", label: t("food.slotBreakfast") },
        { slot: "lunch", label: t("food.slotLunch") },
        { slot: "dinner", label: t("food.slotLightDinner") },
      ];
    case "snack_forward":
      return [
        { slot: "breakfast", label: t("food.slotBreakfast") },
        { slot: "lunch", label: t("food.slotLunch") },
        { slot: "snack", label: t("food.slotSnack") },
        { slot: "dinner", label: t("food.slotDinner") },
      ];
  }
}

function macroRatioBar(m: DailyMacros) {
  const t = m.proteinG + m.carbsG + m.fatG;
  if (t <= 0) return { p: 33, c: 34, f: 33 };
  return {
    p: (m.proteinG / t) * 100,
    c: (m.carbsG / t) * 100,
    f: (m.fatG / t) * 100,
  };
}

function structureHintKey(m: MealStructurePreference): MessageKey {
  const h: Record<MealStructurePreference, MessageKey> = {
    three_meals: "food.structThree",
    lighter_evening: "food.structLight",
    snack_forward: "food.structSnack",
  };
  return h[m];
}

function goalHeadlineKey(g: OnboardingAnswers["goal"]): MessageKey {
  const map: Record<OnboardingAnswers["goal"], MessageKey> = {
    lose_weight: "food.goalLose",
    build_muscle: "food.goalMuscle",
    improve_fitness: "food.goalFitness",
  };
  return map[g];
}

export function FoodScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());
  const [, refresh] = useReducer((x: number) => x + 1, 0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetSlot, setSheetSlot] = useState<MealSlot>("lunch");
  const [swapBySlot, setSwapBySlot] = useState<Partial<Record<MealSlot, number>>>(
    {},
  );

  const [formLabel, setFormLabel] = useState("");
  const [formKcal, setFormKcal] = useState("");
  const [saveRepeat, setSaveRepeat] = useState(false);
  const [shopListDays, setShopListDays] = useState<3 | 7>(7);
  const [offPlanMeals, setOffPlanMeals] = useState<OffPlanMeal[]>([]);
  const [missedMeals, setMissedMeals] = useState(0);
  const [exTick, setExTick] = useState(0);
  const addFood = useAsyncButtonState({
    name: "FoodScreen.addFood",
    timeoutMs: 3000,
  });
  const [portalReady, setPortalReady] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (profile === undefined) return;
    if (!profile) {
      console.debug("[coach] FoodScreen: no profile → /start");
      router.replace("/start");
    }
  }, [profile, router]);

  useEffect(() => {
    setOffPlanMeals(loadOffPlanMealsForDay(now));
  }, [now]);

  useEffect(() => {
    const b = () => setExTick((x) => x + 1);
    window.addEventListener(EXCEPTION_STATE_CHANGED, b);
    return () => window.removeEventListener(EXCEPTION_STATE_CHANGED, b);
  }, []);

  const dayKeyFood = useMemo(() => dayKeyFromDate(now), [now]);
  const activeException = useMemo(
    () => loadActiveExceptionForDay(dayKeyFood),
    [dayKeyFood, exTick],
  );

  const normalizedProfile = useMemo(
    () => (profile ? normalizeProfileForEngine(profile) : null),
    [profile],
  );

  const plan = useMemo(() => {
    if (!normalizedProfile) return null;
    try {
      const base = generateDailyPlan(normalizedProfile, now, locale);
      return activeException
        ? mergeExceptionIntoDailyPlan(base, activeException, locale)
        : base;
    } catch {
      return null;
    }
  }, [normalizedProfile, now, locale, activeException]);

  const coachEngine = useMemo(() => {
    if (!normalizedProfile || !plan) return null;
    return buildCoachEngineBundle({
      profile: normalizedProfile,
      locale,
      now,
      plan,
      activeException: Boolean(activeException),
    });
  }, [normalizedProfile, plan, locale, now, activeException]);

  const foodEngineLine = useMemo(() => {
    const toggles = getCoachFeatureToggles(normalizedProfile ?? null);
    if (!toggles.showCoachLines || !coachEngine) return null;
    return coachEngine.lines.food;
  }, [normalizedProfile, coachEngine]);

  const exceptionGuidanceFood = useMemo(() => {
    if (!activeException) return null;
    return resolveExceptionGuidance(
      locale,
      activeException.id,
      activeException.severity,
    );
  }, [activeException, locale]);

  const packageRhythmLine = useMemo(() => {
    if (!profile) return null;
    return packageLabel(
      getProgramPackage(profile.selectedPackageId),
      locale === "en" ? "en" : "fi",
    ).rhythm;
  }, [profile, locale]);

  const dateSalt = useMemo(() => dayKeyFromDate(now), [now]);

  const slotList = useMemo(
    () => (profile ? mealSlots(profile.mealStructure, t) : []),
    [profile, t],
  );

  const dailyMeals = useMemo(() => {
    if (!normalizedProfile || !plan) return null;
    return generateDailyMeals(
      normalizedProfile,
      {
        caloriesTarget: plan.todayCalories,
        proteinTarget: plan.todayMacros.proteinG,
      },
      dateSalt,
      locale,
    );
  }, [normalizedProfile, plan, dateSalt, locale]);

  const macros = plan?.todayMacros;
  const p = macros?.proteinG ?? 0;
  const c = macros?.carbsG ?? 0;
  const f = macros?.fatG ?? 0;

  const energyStatusKey = useMemo(() => {
    if (!normalizedProfile || !plan || !macros) return "food.goalLose" as MessageKey;
    return foodEnergyStatusKey(normalizedProfile, plan, { p, c, f });
  }, [normalizedProfile, plan, macros, p, c, f]);

  const goalSupportEnergyKey = useMemo(() => {
    if (!plan) return "food.goalLose" as MessageKey;
    return foodGoalSupportEnergyKey(plan);
  }, [plan]);

  const todayIdxFood = useMemo(() => getMondayBasedIndex(now), [now]);

  const hasTrainingToday = useMemo(() => {
    if (!plan) return false;
    return !plan.weeklyPlan.days[todayIdxFood]?.isRest;
  }, [plan, todayIdxFood]);

  const concreteIdeas = useMemo(() => {
    if (!profile || !plan) return [];
    return concreteMealIdeasForDay({
      packageId: profile.selectedPackageId,
      goal: profile.goal,
      hasTrainingToday,
      caloriesTarget: plan.todayCalories,
    });
  }, [profile, plan, hasTrainingToday]);

  const weeklyShopping = useMemo(() => {
    if (!profile || !plan) return null;
    return generateWeeklyShoppingListForProfile(profile, plan, {
      daySpan: shopListDays,
      locale,
    });
  }, [profile, plan, shopListDays, locale]);

  const log = loadFoodLog(now);
  const foodFallbackKey = foodDataFallbackKey(now);
  const saved = loadSavedMeals();

  const loggedSlots = useMemo(
    () => new Set(log.map((x) => x.slot)),
    [log],
  );
  const remainingMealSlots = useMemo(() => {
    const n = slotList.filter((s) => !loggedSlots.has(s.slot)).length;
    return Math.max(1, n);
  }, [slotList, loggedSlots]);

  const nextMealSlot = useMemo(() => {
    for (const s of slotList) {
      if (!loggedSlots.has(s.slot)) return s;
    }
    return null;
  }, [slotList, loggedSlots]);

  const nextMealOption = useMemo(() => {
    if (!nextMealSlot || !dailyMeals) return null;
    const opts = optionsForSlot(nextMealSlot.slot, dailyMeals);
    if (opts.length === 0) return null;
    const len = opts.length;
    const idx = (swapBySlot[nextMealSlot.slot] ?? 0) % len;
    return opts[idx] ?? null;
  }, [nextMealSlot, dailyMeals, swapBySlot]);

  const bump = useCallback(() => {
    refresh();
  }, []);

  const openAdd = useCallback(
    (slot: MealSlot, option?: MealOption | null) => {
      logButtonClick("FoodScreen", "openAdd");
      setSheetError(null);
      setSheetSlot(slot);
      if (option) {
        setFormLabel(option.name);
        setFormKcal(String(option.calories));
      } else {
        setFormLabel("");
        setFormKcal("");
      }
      setSaveRepeat(false);
      setSheetOpen(true);
    },
    [],
  );

  const onLibraryPick = useCallback(
    (slot: MealSlot, item: FoodLibraryItem) => {
      openAdd(slot, {
        name: locale === "en" ? item.nameEn : item.nameFi,
        calories: item.kcal,
        protein: item.proteinG,
        tags: item.tags,
      });
    },
    [locale, openAdd],
  );

  const kcalRangeHintText = useMemo(() => {
    if (!profile) return null;
    const r = nutritionKcalRangeHint(profile);
    if (!r) return null;
    return t("food.kcalRangeHint", { range: r });
  }, [profile, t]);

  const closeSheet = useCallback(() => {
    logButtonClick("FoodScreen", "closeSheet");
    setSheetOpen(false);
    setSheetError(null);
    addFood.reset();
  }, [addFood]);

  useOverlayLayer(sheetOpen, closeSheet);

  const onSubmitAdd = (e: FormEvent) => {
    e.preventDefault();
    const kcal = Math.round(Number(formKcal));
    const label = formLabel.trim();
    if (!label || !Number.isFinite(kcal) || kcal <= 0) return;
    setSheetError(null);
    void addFood.run(async () => {
      try {
        appendFoodLog(now, { label, kcal, slot: sheetSlot });
        trackEvent("log_food");
        trackEvent("add_food");
        if (saveRepeat) addSavedMeal(label, kcal);
        bump();
        flowLog("food.logged");
        setFormLabel("");
        setFormKcal("");
        setSaveRepeat(false);
        setSheetOpen(false);
      } catch (err) {
        console.error("[FoodScreen] add food", err);
        setSheetError(t("food.sheetSaveFailed"));
        throw err;
      }
    });
  };

  const onRepeat = (meal: SavedMeal) => {
    addQuickFromSaved(now, meal, "lunch");
    trackEvent("log_food");
    bump();
  };

  if (profile === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[15px] text-muted-2">
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
          <Link
            href="/start"
            className="mt-6 inline-flex min-h-[44px] items-center text-[14px] font-semibold text-accent underline-offset-2 hover:underline"
          >
            {t("fallback.openStart")}
          </Link>
        </Container>
      </main>
    );
  }

  const target = plan.todayCalories;
  const consumed = log.reduce((s, x) => s + x.kcal, 0);
  const hintToday = loadOutcomeHint(now);
  const offKcalSum = offPlanMeals.reduce((s, m) => s + m.calories, 0);
  const totalKcalApprox = consumed + offKcalSum;
  const showDerailedQuick =
    offPlanMeals.length > 0 ||
    Boolean(hintToday?.caloriesOver) ||
    totalKcalApprox > target * 1.03;
  const remaining = Math.max(0, target - consumed);
  const over = consumed > target;
  const fillPct = Math.min(100, (consumed / target) * 100);
  const adjusted =
    Boolean(plan.foodAdjustmentNote) || Boolean(plan.rebalancePlan);
  const slots = slotList;
  const ratio = macroRatioBar(plan.todayMacros);
  const ft = getCoachFeatureToggles(normalizedProfile ?? profile);

  return (
    <main className="coach-page">
      <Container size="phone" className="relative px-5">
        <CoachScreenHeader
          eyebrow={t("food.eyebrow")}
          eyebrowClassName="sr-only"
          title={
            plan.rebalancePlan && ft.showNutritionCorrections
              ? t("food.rebalanceTitle")
              : adjusted
                ? t("food.titleGuidanceAdjusted")
                : t("food.titleGuidance")
          }
          description={plan.todayFoodTask}
          action={
            <p className="text-[11px] font-medium leading-snug text-muted-2">
              {t(goalHeadlineKey(profile.goal))} ·{" "}
              {t(structureHintKey(profile.mealStructure))}
            </p>
          }
        />

        {foodEngineLine ? (
          <p className="mt-3 max-w-xl text-[12px] font-semibold leading-snug text-muted">
            {foodEngineLine}
          </p>
        ) : null}

        {nextMealSlot && nextMealOption ? (
          <div
            className="mt-5 rounded-[var(--radius-xl)] border border-accent/40 bg-gradient-to-b from-accent/[0.12] to-white/[0.02] px-4 py-4"
            role="region"
            aria-labelledby="food-next-meal"
          >
            <p
              id="food-next-meal"
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent"
            >
              {t("food.nextMealEyebrow")}
            </p>
            <p className="mt-2 text-[1.0625rem] font-semibold leading-tight text-foreground">
              {nextMealSlot.label} · {nextMealOption.name}
            </p>
            <p className="mt-1.5 text-[12px] leading-snug text-muted">
              {t("food.eatThisNowLine")}
            </p>
            <button
              type="button"
              className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-accent px-4 text-[13px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)]"
              onClick={() => openAdd(nextMealSlot.slot, nextMealOption)}
            >
              {t("food.eatThisNowCta")}
            </button>
          </div>
        ) : null}

        {foodFallbackKey ? (
          <p
            className="mt-4 text-[11px] leading-relaxed text-muted-2"
            role="status"
          >
            {t(foodFallbackKey)}
          </p>
        ) : null}

        <HelpVideoCard
          pageId="food"
          enabled={ft.showHelpVideos}
          className="mt-4"
        />

        <FoodTodayStrip
          todaySummary={plan.todayFoodTask}
          consumedKcal={consumed}
          targetKcal={target}
          rebalanceLine={
            plan.rebalancePlan && ft.showNutritionCorrections
              ? getRebalanceMessage(plan.rebalancePlan, locale)
              : null
          }
          shoppingTeaser={
            weeklyShopping
              ? locale === "fi"
                ? `${weeklyShopping.items.length} riviä ostoslistalla`
                : `${weeklyShopping.items.length} lines on your list`
              : null
          }
          showRebalanceUi={Boolean(
            ft.showNutritionCorrections && plan.rebalancePlan,
          )}
        />

        {kcalRangeHintText ? (
          <p
            className="mt-3 max-w-[26rem] text-[11px] leading-relaxed text-muted-2"
            role="status"
          >
            {kcalRangeHintText}
          </p>
        ) : null}

        <FoodLibraryQuickBlock
          locale={locale}
          t={t}
          onPick={onLibraryPick}
        />

        {ft.showCoachLines ? (
          <p className="mt-4 max-w-[26rem] border-l-2 border-accent/40 pl-3 text-[14px] font-semibold leading-snug text-foreground">
            {t(
              foodCoachLineKey({
                rebalanceActive: Boolean(plan.rebalancePlan),
                dayKey: dayKeyFood,
              }),
            )}
          </p>
        ) : null}

        {ft.showVoiceWorkout ? (
          <FoodVoiceQuickBlock referenceDate={now} onAfter={() => refresh()} />
        ) : null}

        {ft.showNutritionCorrections && plan.rebalancePlan ? (
          <div
            className="mt-4 rounded-[var(--radius-lg)] border border-accent/25 bg-white/[0.04] px-4 py-3.5"
            role="region"
            aria-labelledby="food-rebalance-label"
          >
            <p
              id="food-rebalance-label"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent"
            >
              {t("food.rebalanceTitle")}
            </p>
            <p className="mt-2 text-[12px] leading-snug text-muted">
              {getRebalanceMessage(plan.rebalancePlan, locale)}
            </p>
            <p className="mt-2 text-[13px] font-medium leading-snug text-foreground">
              {t("rebalance.noPunishLine")}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
              <Link
                href="/progress"
                className="font-semibold text-accent underline-offset-[3px] hover:underline"
              >
                {t("food.linkSeeProgress")}
              </Link>
              <Link
                href="/adjustments"
                className="font-semibold text-accent underline-offset-[3px] hover:underline"
              >
                {t("food.linkAdjustCoach")}
              </Link>
            </div>
          </div>
        ) : null}

        {exceptionGuidanceFood ? (
          <div
            className="mt-4 rounded-[var(--radius-lg)] border border-accent/30 bg-white/[0.04] px-4 py-3.5"
            role="region"
            aria-labelledby="food-exception-label"
          >
            <p
              id="food-exception-label"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent"
            >
              {t("exception.foodEyebrow")}
            </p>
            <p className="mt-2 text-[13px] font-medium leading-snug text-foreground">
              {exceptionGuidanceFood.food}
            </p>
            <p className="mt-2 text-[12px] leading-snug text-muted">
              {exceptionGuidanceFood.recovery}
            </p>
            <p className="mt-2 text-[10px] leading-snug text-muted-2">
              {t("exception.safetyFooter")}
            </p>
          </div>
        ) : null}

        {ft.showNutritionCorrections && showDerailedQuick ? (
          <FoodOffPlanQuickBlock
            referenceDate={now}
            onAddOffPlan={(m) => {
              setOffPlanMeals((prev) => {
                const next = [...prev, m];
                saveOffPlanMealsForDay(now, next);
                return next;
              });
            }}
            onMissedMeal={() =>
              setMissedMeals((n) => Math.min(4, n + 1))
            }
            onAfter={bump}
            t={t}
          />
        ) : null}

        <p className="mt-4 max-w-[22rem] text-[11px] font-medium leading-snug text-muted-2">
          {t("food.rhythmLeadLine")}
        </p>

        <div className="flex flex-col justify-center sm:justify-start">
          <CoachSystemStatus text={t("systemStatus.food")} />
          {packageRhythmLine ? (
            <p className="mt-2 max-w-[22rem] text-[11px] font-medium leading-snug text-muted-2">
              {packageRhythmLine}
            </p>
          ) : null}
        </div>

        <section
          className="coach-panel-food-hero relative isolate mt-6 overflow-hidden px-5 pb-6 pt-7 ring-1 ring-white/[0.05] opacity-[0.97]"
          aria-labelledby="cal-target"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_85%_at_100%_-10%,var(--panel-glow),transparent_55%)]"
            aria-hidden
          />
          <div className="coach-topline" aria-hidden />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p id="cal-target" className="coach-section-label-sm">
                {t("food.todayEnergy")}
              </p>
              <p className="mt-2 text-[1.85rem] font-semibold tabular-nums leading-none tracking-tight text-foreground sm:text-[2rem]">
                {target.toLocaleString(dateLocaleForUi(locale))}
                <span className="ml-1 text-[1rem] font-semibold text-muted-2">
                  {t("food.kcalUnit")}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="coach-section-label-sm">{t("food.logged")}</p>
              <p
                className={`mt-2 text-[1.25rem] font-semibold tabular-nums leading-none ${over ? "text-accent" : "text-foreground"}`}
              >
                {consumed.toLocaleString(dateLocaleForUi(locale))}
              </p>
            </div>
          </div>

          <div
            className="relative mt-5 h-2 overflow-hidden rounded-full bg-surface-muted"
            role="presentation"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${
                over ? "bg-accent/85" : "bg-accent/55"
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <p className="mt-3 text-[12px] leading-snug text-muted">
            {consumed === 0
              ? t("food.logHintZero")
              : over
                ? t("food.logHintOver", {
                    over: (consumed - target).toLocaleString(
                      dateLocaleForUi(locale),
                    ),
                  })
                : t("food.logHintRemain", {
                    n: remaining.toLocaleString(dateLocaleForUi(locale)),
                  })}
          </p>

          <div className="mt-5 border-t border-border/45 pt-5">
            <p id="macro-shape" className="sr-only">
              {t("food.macroShape")}
            </p>
            <div
              className="flex h-1.5 overflow-hidden rounded-full bg-surface-muted"
              role="img"
              aria-labelledby="macro-shape"
            >
              <div className="bg-accent/80" style={{ width: `${ratio.p}%` }} />
              <div className="bg-accent/45" style={{ width: `${ratio.c}%` }} />
              <div className="bg-foreground/18" style={{ width: `${ratio.f}%` }} />
            </div>
            <p className="mt-2 text-[11px] tabular-nums text-muted">
              <span className="font-semibold text-foreground">{p}g P</span>
              <span className="mx-1.5 text-border-strong">·</span>
              <span className="font-semibold text-foreground">{c}g C</span>
              <span className="mx-1.5 text-border-strong">·</span>
              <span className="font-semibold text-foreground">{f}g F</span>
            </p>
            <p
              className="mt-2 text-[10px] font-medium leading-snug text-muted-2"
              role="status"
            >
              {t(energyStatusKey)}
            </p>
          </div>
        </section>

        {ft.showNutritionCorrections && plan.foodAdjustmentNote ? (
          <div className="mt-5 rounded-[var(--radius-lg)] border border-accent/30 bg-[rgba(41,92,255,0.12)] px-4 py-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
              {t("food.dayChangedTitle")}
            </p>
            <p className="mt-1 text-[12px] font-medium leading-snug text-muted">
              {t("food.balanceRestLine")}
            </p>
            <p
              className="mt-2.5 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-foreground"
              role="status"
            >
              {plan.foodAdjustmentNote}
            </p>
          </div>
        ) : null}

        <section className="mt-8" aria-labelledby="meals-heading">
          <div className="flex items-end justify-between gap-3">
            <h2
              id="meals-heading"
              className="text-[1.0625rem] font-semibold leading-tight tracking-[-0.03em] text-foreground"
            >
              {t("food.recommendedSection")}
            </h2>
          </div>
          <p className="sr-only">{t("food.mealsHint")}</p>
          <div
            className="mt-4 flex flex-wrap items-center gap-2"
            role="status"
            aria-label={t("food.proofTitle")}
          >
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t("ui.builtFromPrefs")}
            </span>
            {plan.foodAdjustmentNote || plan.systemLine ? (
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                {t("ui.adjustedToday")}
              </span>
            ) : null}
            {profile.flexibility === "flexible" ? (
              <span className="rounded-full border border-accent/30 bg-accent-soft/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                {t("food.chipFlexibleDinner")}
              </span>
            ) : null}
          </div>
          <div
            className="mt-4 rounded-[var(--radius-lg)] border border-border/40 bg-surface-subtle/55 px-3.5 py-4"
            role="status"
          >
            <p className="text-[12px] font-semibold leading-snug text-foreground">
              {t("food.goalSupportIntro")}
            </p>
            <ul className="mt-2 space-y-1 text-[12px] font-medium leading-snug text-muted">
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold text-accent">+</span>
                <span>{t("food.goalSupportProtein")}</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold text-accent">+</span>
                <span>{t(goalSupportEnergyKey)}</span>
              </li>
            </ul>
            <div className="mt-4 border-t border-border/35 pt-4">
              <p className="text-[12px] font-semibold leading-snug text-foreground">
                {t("food.concreteNowTitle")}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-muted-2">
                {t("food.concreteNowLead")}
              </p>
              <ul className="mt-3 space-y-2.5 text-[13px] font-medium leading-snug text-foreground/95">
                {concreteIdeas.map((idea) => (
                  <li key={idea.fi} className="flex gap-2">
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/80"
                      aria-hidden
                    />
                    <span>{locale === "en" ? idea.en : idea.fi}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-3 text-[10px] leading-snug text-muted-2">
            <span>{t("food.scanInline")}</span>{" "}
            <Link href="/scan" className="font-semibold text-accent hover:underline">
              {t("nav.scan")}
            </Link>
          </p>
          <div className="mt-5 flex flex-col gap-3">
            {slots.map(({ slot, label }, i) => {
              const items = log.filter((x) => x.slot === slot);
              const opts =
                dailyMeals ? optionsForSlot(slot, dailyMeals) : [];
              const len = opts.length;
              const idx =
                len > 0 ? (swapBySlot[slot] ?? 0) % len : 0;
              const current = len > 0 ? opts[idx] : null;
              const whyKey = foodWhyThisMealKey(slot, profile, plan, current);
              const slotWeight =
                i === 0 ? "lead" : i === 1 ? "mid" : "light";
              const isLastMealSlot = i === slots.length - 1;
              const hoursToNextMeal = Math.max(2, 6 - i);
              return (
                <FoodMealSlotBlock
                  key={slot}
                  slotLabel={label}
                  mealOrdinal={i + 1}
                  mealSubtitleKey={mealCardSubtitleKey(
                    profile.mealStructure,
                    slot,
                  )}
                  flowCaption={slotFlowCaption(
                    profile.mealStructure,
                    slot,
                    t,
                  )}
                  slotWeight={slotWeight}
                  showDefaultBadge={i === 0}
                  whyLine={t(whyKey)}
                  logItems={items}
                  current={current}
                  canSwap={len > 1}
                  onSwap={() =>
                    setSwapBySlot((s) => ({
                      ...s,
                      [slot]: nextSwapIndex(s[slot] ?? 0, len),
                    }))
                  }
                  onAdd={(prefill) => openAdd(slot, prefill)}
                  onRemoveLog={(id) => {
                    removeFoodLogItem(now, id);
                    bump();
                  }}
                  isLastMealSlot={isLastMealSlot}
                  hoursToNextMeal={hoursToNextMeal}
                  t={t}
                />
              );
            })}
          </div>
        </section>

        {ft.showNutritionCorrections ? (
          <FoodIntelligenceBlock
            profile={profile}
            plan={plan}
            referenceDate={now}
            hasTrainingToday={hasTrainingToday}
            consumedFromLog={estimateConsumedFromKcalLog(
              consumed,
              plan.todayMacros,
            )}
            offPlanMeals={offPlanMeals}
            onAddOffPlan={(m) => {
              setOffPlanMeals((prev) => {
                const next = [...prev, m];
                saveOffPlanMealsForDay(now, next);
                return next;
              });
              bump();
            }}
            missedMeals={missedMeals}
            onAddMissedMeal={() =>
              setMissedMeals((n) => Math.min(4, n + 1))
            }
            remainingMealSlots={remainingMealSlots}
            locale={locale}
            t={t}
          />
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => openAdd("lunch")}
            className="flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-border/55 bg-transparent px-4 text-[14px] font-semibold text-muted transition hover:border-accent/35 hover:text-foreground active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("food.addYourOwn")}
          </button>
          <Link
            href="/adjustments"
            className="flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-border/40 bg-surface-subtle/30 px-4 text-[13px] font-medium text-muted-2 transition hover:border-accent/35 hover:text-foreground"
          >
            {t("food.addEventShort")}
          </Link>
        </div>

        {weeklyShopping ? (
          <div id="food-shopping" className="scroll-mt-6">
            <FoodShoppingListBlock
              weekly={weeklyShopping}
              shopDays={shopListDays}
              onShopDaysChange={setShopListDays}
              locale={locale}
              t={t}
            />
          </div>
        ) : null}

        <section className="mt-9 border-t border-border/40 pt-8" aria-labelledby="saved-meals">
          <h2
            id="saved-meals"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2"
          >
            {t("food.savedRepeat")}
          </h2>
          {saved.length === 0 ? (
            <p className="mt-2.5 text-[12px] leading-relaxed text-muted-2">
              {t("food.savedEmpty")}
            </p>
          ) : (
            <>
              <p className="mt-2 text-[10px] leading-snug text-muted-2">
                {t("food.savedQuickHint")}
              </p>
              <ul className="mt-3 space-y-2">
              {saved.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border/55 bg-surface-subtle/40 px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-foreground">
                      {m.label}
                    </p>
                    <p className="text-[12px] tabular-nums text-muted-2">
                      {m.kcal} {t("food.kcalUnit")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onRepeat(m)}
                      className="rounded-[var(--radius-md)] bg-accent px-3 py-2 text-[12px] font-semibold text-white"
                    >
                      {t("food.log")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removeSavedMeal(m.id);
                        bump();
                      }}
                      className="px-2 py-2 text-[12px] font-medium text-muted-2 hover:text-foreground"
                      aria-label={t("food.removeSavedAria", { label: m.label })}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
              </ul>
            </>
          )}
        </section>

        <CoachAppShortcuts compact omit={["/food"]} />

        <p className="mt-8 text-center text-[10px] leading-relaxed text-muted-2">
          {t("food.footNote")}
        </p>
      </Container>

      {portalReady && sheetOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex touch-manipulation flex-col justify-end"
              role="presentation"
            >
              <button
                type="button"
                tabIndex={-1}
                aria-label={t("food.cancel")}
                className="absolute inset-0 z-0 cursor-default border-0 bg-foreground/30 backdrop-blur-[3px] p-0 [touch-action:manipulation]"
                onClick={closeSheet}
              />
              <div
                className="relative z-[130] mt-auto w-full max-h-[85dvh] overflow-y-auto rounded-t-[var(--radius-2xl)] border border-border/80 bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 shadow-[var(--shadow-float)] pointer-events-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-food-title"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-strong/80" />
            <h2
              id="add-food-title"
              className="text-[1.125rem] font-semibold tracking-[-0.02em]"
            >
              {t("food.sheetTitle")}
            </h2>
            <p className="mt-1 text-[13px] text-muted-2">{t("food.sheetHint")}</p>
            {sheetError ? (
              <p className="mt-3 text-[13px] font-medium text-accent" role="alert">
                {sheetError}
              </p>
            ) : null}
            <form
              className="mt-6 space-y-5"
              onSubmit={onSubmitAdd}
              aria-busy={addFood.loading}
            >
              <div>
                <label
                  htmlFor="food-label"
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2"
                >
                  {t("food.sheetWhat")}
                </label>
                <input
                  id="food-label"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  disabled={addFood.loading}
                  className="mt-2 w-full rounded-[var(--radius-lg)] border border-border bg-background px-4 py-3 text-[16px] text-foreground outline-none ring-accent/0 transition focus:border-accent/50 focus:ring-2 focus:ring-accent/25 disabled:opacity-60"
                  placeholder={t("food.sheetPlaceholderLabel")}
                  autoComplete="off"
                />
              </div>
              <div>
                <label
                  htmlFor="food-kcal"
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2"
                >
                  {t("food.sheetKcal")}
                </label>
                <input
                  id="food-kcal"
                  inputMode="numeric"
                  value={formKcal}
                  onChange={(e) => setFormKcal(e.target.value.replace(/[^\d]/g, ""))}
                  disabled={addFood.loading}
                  className="mt-2 w-full rounded-[var(--radius-lg)] border border-border bg-background px-4 py-3 text-[16px] tabular-nums text-foreground outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/25 disabled:opacity-60"
                  placeholder={t("food.sheetPlaceholderKcal")}
                />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                  {t("food.sheetSlot")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {slots.map(({ slot, label }) => (
                    <button
                      key={slot}
                      type="button"
                      disabled={addFood.loading}
                      onClick={() => setSheetSlot(slot)}
                      className={`rounded-full border px-3.5 py-2 text-[12px] font-semibold transition disabled:opacity-50 ${
                        sheetSlot === slot
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-border/90 text-muted hover:border-accent/30"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-3 py-1">
                <input
                  type="checkbox"
                  checked={saveRepeat}
                  onChange={(e) => setSaveRepeat(e.target.checked)}
                  disabled={addFood.loading}
                  className="h-4 w-4 rounded border-border text-accent disabled:opacity-50"
                />
                <span className="text-[14px] text-muted">{t("food.saveRepeat")}</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeSheet}
                  className="min-h-[48px] flex-1 rounded-[var(--radius-lg)] border border-border bg-transparent text-[15px] font-semibold text-foreground"
                >
                  {t("food.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={addFood.loading}
                  className="min-h-[48px] flex-[1.2] rounded-[var(--radius-lg)] bg-accent text-[15px] font-semibold text-white shadow-[var(--shadow-primary-cta)] disabled:opacity-60"
                >
                  {addFood.loading ? t("food.addSaving") : t("food.add")}
                </button>
              </div>
            </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </main>
  );
}
