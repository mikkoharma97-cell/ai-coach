"use client";

import { Container } from "@/components/ui/Container";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useTranslation } from "@/hooks/useTranslation";
import { trackEvent } from "@/lib/analytics";
import {
  applyProgramLibraryEntry,
  recommendProgramForProfile,
} from "@/lib/coachProgramCatalog";
import { flowLog } from "@/lib/flowLog";
import { recommendNutritionForProfile } from "@/lib/nutritionLibrary";
import { emptyAnswers } from "@/lib/plan";
import { loadProfile, saveProfile } from "@/lib/storage";
import type {
  DaysPerWeek,
  DietaryRestriction,
  DietType,
  Goal,
  Level,
  MealStructurePreference,
  MealsPerDayCount,
  OnboardingAnswers,
} from "@/types/coach";
import type { MessageKey } from "@/lib/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

const BUILD_DELAY_MS = 900;

type GoalChoice = "lose_weight" | "build_muscle" | "improve_fitness" | "lifestyle";
type DaysBucket = "t23" | "t34" | "t5";
type FoodChoice = "easy" | "precise" | "whatever";

function mapGoalToCoachGoal(g: GoalChoice): Goal {
  if (g === "lifestyle") return "improve_fitness";
  return g;
}

function daysBucketToDaysPerWeek(b: DaysBucket): DaysPerWeek {
  if (b === "t23") return 3;
  if (b === "t34") return 4;
  return 5;
}

function mapMealsToStructure(n: MealsPerDayCount): MealStructurePreference {
  if (n <= 2) return "lighter_evening";
  if (n === 3) return "three_meals";
  return "snack_forward";
}

function pushUnique(list: string[], value: string) {
  const v = value.toLowerCase();
  if (!list.some((x) => x.toLowerCase() === v)) list.push(value);
}

function applyPersonalization(
  base: OnboardingAnswers,
  mealsPerDay: MealsPerDayCount,
  diet: DietType,
  restrictions: DietaryRestriction[],
  rhythm: "regular" | "shift_work",
): OnboardingAnswers {
  const foodPreferences = [...(base.foodPreferences ?? [])];
  const foodDislikes = [...(base.foodDislikes ?? [])];

  if (diet === "vegetarian") {
    pushUnique(foodPreferences, "kasvis");
    pushUnique(foodDislikes, "kana");
    pushUnique(foodDislikes, "liha");
  } else if (diet === "vegan") {
    pushUnique(foodPreferences, "vegaani");
    pushUnique(foodDislikes, "kana");
    pushUnique(foodDislikes, "liha");
    pushUnique(foodDislikes, "maito");
    pushUnique(foodDislikes, "juusto");
    pushUnique(foodDislikes, "muna");
  }

  for (const r of restrictions) {
    if (r === "lactose_free") pushUnique(foodDislikes, "laktoosi");
    if (r === "gluten_free") {
      pushUnique(foodDislikes, "gluteeni");
      pushUnique(foodDislikes, "vehnä");
    }
    if (r === "dairy_free") {
      pushUnique(foodDislikes, "maito");
      pushUnique(foodDislikes, "juusto");
    }
  }

  return {
    ...base,
    mealsPerDay,
    dietType: diet,
    dietaryRestrictions: restrictions,
    mealStructure: mapMealsToStructure(mealsPerDay),
    lifeSchedule: rhythm === "shift_work" ? "shift_work" : "regular",
    shiftMode: rhythm === "shift_work",
    foodPreferences,
    foodDislikes,
  };
}

function buildBaseAnswers(
  goalChoice: GoalChoice,
  level: Level,
  daysBucket: DaysBucket,
  foodChoice: FoodChoice,
): OnboardingAnswers {
  const daysPerWeek = daysBucketToDaysPerWeek(daysBucket);
  const goal = mapGoalToCoachGoal(goalChoice);

  let eatingHabits: OnboardingAnswers["eatingHabits"];
  let flexibility: OnboardingAnswers["flexibility"];
  if (foodChoice === "easy") {
    eatingHabits = "okay";
    flexibility = "flexible";
  } else if (foodChoice === "precise") {
    eatingHabits = "good";
    flexibility = "structured";
  } else {
    eatingHabits = "okay";
    flexibility = "balanced";
  }

  return {
    ...emptyAnswers(),
    goal,
    level,
    trainingLevel: level,
    daysPerWeek,
    eatingHabits,
    flexibility,
    mealStructure: "three_meals",
    biggestChallenge: "dont_know_what_to_do",
    lastBestShape: "within_2y",
    recentTrainingFreq: daysPerWeek >= 5 ? "weekly_most" : "weekly_few",
    trainingVenue: "mixed",
    socialEatingFrequency: "sometimes",
    eventDisruption: "snap_back",
  };
}

function PickButton({
  selected,
  children,
  onClick,
}: {
  selected?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[52px] w-full rounded-[var(--radius-xl)] border px-4 py-[14px] text-center text-[15px] font-medium leading-snug tracking-[-0.015em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] ${
        selected
          ? "border-accent bg-accent-soft text-accent shadow-[0_0_0_1px_rgb(42_92_191/0.12)]"
          : "border-border/90 bg-card/80 text-foreground hover:border-accent/35 hover:bg-card"
      }`}
    >
      {children}
    </button>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [building, setBuilding] = useState(false);
  const [existingProfile, setExistingProfile] = useState(false);

  const [goal, setGoal] = useState<GoalChoice | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [days, setDays] = useState<DaysBucket | null>(null);
  const [mealsPerDay, setMealsPerDay] = useState<MealsPerDayCount | null>(null);
  const [diet, setDiet] = useState<DietType | null>(null);
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [rhythm, setRhythm] = useState<"regular" | "shift_work" | null>(null);
  const [food, setFood] = useState<FoodChoice | null>(null);

  const toggleRestriction = useCallback((r: DietaryRestriction) => {
    setRestrictions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );
  }, []);

  useBodyScrollLock(building);

  useLayoutEffect(() => {
    try {
      setExistingProfile(Boolean(loadProfile()));
    } catch {
      setExistingProfile(false);
    }
  }, []);

  useEffect(() => {
    trackEvent("onboarding_start");
  }, []);

  useEffect(() => {
    if (step >= 1 && !goal) setStep(0);
    else if (step >= 2 && (!goal || !level)) setStep(0);
    else if (step >= 3 && (!goal || !level || !days)) setStep(0);
    else if (step >= 4 && (!goal || !level || !days || !mealsPerDay)) setStep(0);
    else if (step >= 5 && (!goal || !level || !days || !mealsPerDay || !diet)) {
      setStep(0);
    } else if (
      step >= 6 &&
      (!goal || !level || !days || !mealsPerDay || !diet)
    ) {
      setStep(0);
    } else if (
      step >= 7 &&
      (!goal || !level || !days || !mealsPerDay || !diet || !rhythm)
    ) {
      setStep(0);
    } else if (
      step >= 8 &&
      (!goal || !level || !days || !mealsPerDay || !diet || !rhythm || !food)
    ) {
      setStep(0);
    }
  }, [step, goal, level, days, mealsPerDay, diet, rhythm, food]);

  const startBuild = useCallback(() => {
    if (
      !goal ||
      !level ||
      !days ||
      !food ||
      !mealsPerDay ||
      !diet ||
      !rhythm
    ) {
      return;
    }

    const base = buildBaseAnswers(goal, level, days, food);
    const personalized = applyPersonalization(
      base,
      mealsPerDay,
      diet,
      restrictions,
      rhythm,
    );
    const rec = recommendProgramForProfile(personalized);
    const patch = applyProgramLibraryEntry(rec.id, personalized);
    const merged = { ...personalized, ...patch } as OnboardingAnswers;
    const recNut = recommendNutritionForProfile(merged);
    const final: OnboardingAnswers = {
      ...merged,
      recommendedProgramLibraryId: rec.id,
      recommendedNutritionLibraryId: recNut.id,
    };

    try {
      saveProfile(final);
      flowLog("onboarding.profileSaved");
    } catch (e) {
      console.warn("[coach] OnboardingFlow saveProfile failed", e);
    }

    setBuilding(true);
    window.setTimeout(() => {
      flowLog("onboarding.navigateToday");
      trackEvent("onboarding_complete");
      router.push("/app");
    }, BUILD_DELAY_MS);
    window.setTimeout(() => {
      setBuilding(false);
    }, BUILD_DELAY_MS + 10000);
  }, [days, diet, food, goal, level, mealsPerDay, restrictions, rhythm, router]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const goalLabelKey = (g: GoalChoice): MessageKey => {
    const m: Record<GoalChoice, MessageKey> = {
      lose_weight: "onboarding.fast.goalLose",
      build_muscle: "onboarding.fast.goalMuscle",
      improve_fitness: "onboarding.fast.goalFitness",
      lifestyle: "onboarding.fast.goalLifestyle",
    };
    return m[g];
  };

  const daysLabelKey = (b: DaysBucket): MessageKey => {
    const m: Record<DaysBucket, MessageKey> = {
      t23: "onboarding.fast.time23",
      t34: "onboarding.fast.time34",
      t5: "onboarding.fast.time5",
    };
    return m[b];
  };

  const foodLabelKey = (f: FoodChoice): MessageKey => {
    const m: Record<FoodChoice, MessageKey> = {
      easy: "onboarding.fast.foodEasy",
      precise: "onboarding.fast.foodPrecise",
      whatever: "onboarding.fast.foodWhatever",
    };
    return m[f];
  };

  const dietLabelKey = (d: DietType): MessageKey => {
    const m: Record<DietType, MessageKey> = {
      omnivore: "onboarding.dietOmnivore",
      vegetarian: "onboarding.dietVegetarian",
      vegan: "onboarding.dietVegan",
    };
    return m[d];
  };

  const restrLabelKey = (r: DietaryRestriction): MessageKey => {
    const m: Record<DietaryRestriction, MessageKey> = {
      lactose_free: "onboarding.restrLactose",
      gluten_free: "onboarding.restrGluten",
      dairy_free: "onboarding.restrDairy",
    };
    return m[r];
  };

  if (building) {
    return (
      <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-background/98 px-6 backdrop-blur-sm">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_40%,rgb(59_130_246/0.14),transparent_70%)]"
          aria-hidden
        />
        <p className="relative text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-2">
          {t("onboarding.buildingWait")}
        </p>
        <p className="relative mt-4 text-center text-[1.3125rem] font-semibold leading-tight tracking-[-0.035em] text-foreground">
          {t("onboarding.buildingTitle")}
        </p>
        <p className="relative mt-4 max-w-xs text-center text-[14px] font-medium leading-snug text-muted">
          {t("onboarding.buildingPromise")}
        </p>
        <div
          className="coach-onboarding-track relative mt-10 h-1 w-40 overflow-hidden rounded-full bg-surface-muted"
          aria-hidden
        >
          <div className="coach-onboarding-sweep h-full w-1/2 rounded-full bg-accent/90" />
        </div>
      </div>
    );
  }

  const stepLabel = `${step + 1}/9`;

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-card/[0.04] via-background to-background">
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.05] bg-[rgba(11,17,32,0.6)] px-4 py-2.5 backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(11,17,32,0.55)]">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="min-h-[44px] min-w-[44px] -translate-x-2 text-[14px] font-medium text-muted transition hover:text-foreground"
          >
            {t("onboarding.back")}
          </button>
        ) : (
          <Link
            href="/home"
            className="min-h-[44px] py-2 text-[13px] font-medium text-muted-2 transition hover:text-foreground"
          >
            {t("onboarding.home")}
          </Link>
        )}
        <span className="pointer-events-none text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-2">
          {t("onboarding.headerSetup")} · {stepLabel}
        </span>
        <div className="w-[44px]" aria-hidden />
      </header>

      {existingProfile ? (
        <div className="shrink-0 border-b border-white/[0.08] bg-accent/[0.06] px-5 py-3 text-center">
          <p className="text-[12px] leading-snug text-muted">
            {t("start.resumeHint")}
          </p>
          <Link
            href="/app"
            className="mt-2 inline-flex min-h-[44px] items-center justify-center text-[13px] font-semibold text-accent underline-offset-[3px] hover:underline"
          >
            {t("start.resumeToApp")}
          </Link>
        </div>
      ) : null}

      <main className="flex min-h-[calc(100dvh-3.25rem)] flex-1 flex-col">
        <Container
          size="phone"
          className="flex h-full min-h-0 flex-1 flex-col items-center px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
        >
          {step === 0 ? (
            <section
              className="flex w-full max-w-md flex-col items-center"
              aria-labelledby="ob-q-goal"
            >
              <h1
                id="ob-q-goal"
                className="w-full text-balance text-center text-[1.375rem] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground"
              >
                {t("onboarding.fast.pickGoal")}
              </h1>
              <div className="mt-6 flex w-full flex-col justify-center gap-2.5">
                {(
                  [
                    "lose_weight",
                    "build_muscle",
                    "improve_fitness",
                    "lifestyle",
                  ] as const
                ).map((g) => (
                  <PickButton
                    key={g}
                    selected={goal === g}
                    onClick={() => {
                      setGoal(g);
                      setStep(1);
                    }}
                  >
                    {t(goalLabelKey(g))}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 1 && goal ? (
            <section
              className="flex w-full max-w-md flex-col items-center"
              aria-labelledby="ob-q-level"
            >
              <h1
                id="ob-q-level"
                className="w-full text-balance text-center text-[1.375rem] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground"
              >
                {t("onboarding.fast.qLevel")}
              </h1>
              <div className="mt-6 flex w-full flex-col justify-center gap-2.5">
                {(
                  [
                    { value: "beginner" as const, labelKey: "onboarding.levelBeginner" as const },
                    { value: "intermediate" as const, labelKey: "onboarding.levelMid" as const },
                    { value: "advanced" as const, labelKey: "onboarding.levelAdvanced" as const },
                  ] as const
                ).map((o) => (
                  <PickButton
                    key={o.value}
                    selected={level === o.value}
                    onClick={() => {
                      setLevel(o.value);
                      setStep(2);
                    }}
                  >
                    {t(o.labelKey)}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 2 && goal && level ? (
            <section
              className="flex w-full max-w-md flex-col items-center"
              aria-labelledby="ob-q-days"
            >
              <h1
                id="ob-q-days"
                className="w-full text-balance text-center text-[1.375rem] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground"
              >
                {t("onboarding.fast.qTrainFreq")}
              </h1>
              <div className="mt-6 flex w-full flex-col justify-center gap-2.5">
                {(["t23", "t34", "t5"] as const).map((b) => (
                  <PickButton
                    key={b}
                    selected={days === b}
                    onClick={() => {
                      setDays(b);
                      setStep(3);
                    }}
                  >
                    {t(daysLabelKey(b))}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 3 && goal && level && days ? (
            <section
              className="flex w-full max-w-md flex-col items-center"
              aria-labelledby="ob-q-meals"
            >
              <h1
                id="ob-q-meals"
                className="w-full text-balance text-center text-[1.375rem] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground"
              >
                {t("onboarding.qMealsPerDay")}
              </h1>
              <div className="mt-6 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3">
                {([2, 3, 4, 5, 6] as const).map((n) => (
                  <PickButton
                    key={n}
                    selected={mealsPerDay === n}
                    onClick={() => {
                      setMealsPerDay(n);
                      setStep(4);
                    }}
                  >
                    {t("onboarding.mealsN", { n })}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 4 && goal && level && days && mealsPerDay ? (
            <section
              className="flex w-full max-w-md flex-col items-center"
              aria-labelledby="ob-q-diet"
            >
              <h1
                id="ob-q-diet"
                className="w-full text-balance text-center text-[1.375rem] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground"
              >
                {t("onboarding.qDiet")}
              </h1>
              <div className="mt-6 flex w-full flex-col justify-center gap-2.5">
                {(["omnivore", "vegetarian", "vegan"] as const).map((d) => (
                  <PickButton
                    key={d}
                    selected={diet === d}
                    onClick={() => {
                      setDiet(d);
                      setStep(5);
                    }}
                  >
                    {t(dietLabelKey(d))}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 5 && goal && level && days && mealsPerDay && diet ? (
            <section
              className="flex w-full max-w-md flex-1 flex-col items-center"
              aria-labelledby="ob-q-restr"
            >
              <h1
                id="ob-q-restr"
                className="w-full text-balance text-center text-[1.375rem] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground"
              >
                {t("onboarding.qRestrictions")}
              </h1>
              <p className="mt-2 max-w-sm text-center text-[13px] leading-snug text-muted">
                {t("onboarding.restrictionsHint")}
              </p>
              <div className="mt-6 flex w-full flex-col justify-center gap-2.5">
                {(["lactose_free", "gluten_free", "dairy_free"] as const).map(
                  (r) => (
                    <PickButton
                      key={r}
                      selected={restrictions.includes(r)}
                      onClick={() => toggleRestriction(r)}
                    >
                      {t(restrLabelKey(r))}
                    </PickButton>
                  ),
                )}
              </div>
              <div className="mt-auto w-full shrink-0 pt-8">
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="flex h-[56px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[17px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("onboarding.continue")}
                </button>
              </div>
            </section>
          ) : null}

          {step === 6 && goal && level && days && mealsPerDay && diet ? (
            <section
              className="flex w-full max-w-md flex-col items-center"
              aria-labelledby="ob-q-rhythm"
            >
              <h1
                id="ob-q-rhythm"
                className="w-full text-balance text-center text-[1.375rem] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground"
              >
                {t("onboarding.qRhythm")}
              </h1>
              <div className="mt-6 flex w-full flex-col justify-center gap-2.5">
                <PickButton
                  selected={rhythm === "regular"}
                  onClick={() => {
                    setRhythm("regular");
                    setStep(7);
                  }}
                >
                  {t("onboarding.rhythmRegular")}
                </PickButton>
                <PickButton
                  selected={rhythm === "shift_work"}
                  onClick={() => {
                    setRhythm("shift_work");
                    setStep(7);
                  }}
                >
                  {t("onboarding.rhythmShift")}
                </PickButton>
              </div>
            </section>
          ) : null}

          {step === 7 &&
          goal &&
          level &&
          days &&
          mealsPerDay &&
          diet &&
          rhythm ? (
            <section
              className="flex w-full max-w-md flex-col items-center"
              aria-labelledby="ob-q-foodline"
            >
              <h1
                id="ob-q-foodline"
                className="w-full text-balance text-center text-[1.375rem] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground"
              >
                {t("onboarding.fast.qEatHow")}
              </h1>
              <div className="mt-6 flex w-full flex-col justify-center gap-2.5">
                {(["easy", "precise", "whatever"] as const).map((f) => (
                  <PickButton
                    key={f}
                    selected={food === f}
                    onClick={() => {
                      setFood(f);
                      setStep(8);
                    }}
                  >
                    {t(foodLabelKey(f))}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 8 &&
          goal &&
          level &&
          days &&
          mealsPerDay &&
          diet &&
          rhythm &&
          food ? (
            <section
              className="flex w-full max-w-md flex-1 flex-col items-center justify-between"
              aria-labelledby="ob-summary"
            >
              <div className="w-full">
                <h1
                  id="ob-summary"
                  className="w-full text-balance text-center text-[1.375rem] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground"
                >
                  {t("onboarding.fast.summaryProgram")}
                </h1>
                <ul className="mt-5 w-full space-y-3 text-[14px] leading-snug">
                  <li className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-3 text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                      {t("onboarding.fast.summaryGoal")}
                    </span>
                    <span className="font-medium text-foreground">
                      {t(goalLabelKey(goal))}
                    </span>
                  </li>
                  <li className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-3 text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                      {t("onboarding.fast.summaryDays")}
                    </span>
                    <span className="font-medium text-foreground">
                      {t(daysLabelKey(days))}
                    </span>
                  </li>
                  <li className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-3 text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                      {t("onboarding.summaryMeals")}
                    </span>
                    <span className="font-medium text-foreground">
                      {t("onboarding.mealsN", { n: mealsPerDay })}
                    </span>
                  </li>
                  <li className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-3 text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                      {t("onboarding.summaryDiet")}
                    </span>
                    <span className="font-medium text-foreground">
                      {t(dietLabelKey(diet))}
                    </span>
                  </li>
                  <li className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-3 text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                      {t("onboarding.summaryRhythm")}
                    </span>
                    <span className="font-medium text-foreground">
                      {rhythm === "shift_work"
                        ? t("onboarding.rhythmShift")
                        : t("onboarding.rhythmRegular")}
                    </span>
                  </li>
                  <li className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-3 text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                      {t("onboarding.fast.summaryFood")}
                    </span>
                    <span className="font-medium text-foreground">
                      {t(foodLabelKey(food))}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 w-full shrink-0 pt-2">
                <button
                  type="button"
                  onClick={startBuild}
                  className="flex h-[56px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[17px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("onboarding.fast.cta")}
                </button>
              </div>
            </section>
          ) : null}
        </Container>
      </main>
    </div>
  );
}
