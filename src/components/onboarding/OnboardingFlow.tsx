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
  Goal,
  Level,
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
  const [food, setFood] = useState<FoodChoice | null>(null);

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
    else if (step >= 4 && (!goal || !level || !days || !food)) setStep(0);
  }, [step, goal, level, days, food]);

  const startBuild = useCallback(() => {
    if (!goal || !level || !days || !food) return;

    const base = buildBaseAnswers(goal, level, days, food);
    const rec = recommendProgramForProfile(base);
    const patch = applyProgramLibraryEntry(rec.id, base);
    const merged = { ...base, ...patch } as OnboardingAnswers;
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
  }, [days, food, goal, level, router]);

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

  const stepLabel = `${step + 1}/5`;

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
              aria-labelledby="ob-q-food"
            >
              <h1
                id="ob-q-food"
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
                      setStep(4);
                    }}
                  >
                    {t(foodLabelKey(f))}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 4 && goal && level && days && food ? (
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
                  <li className="flex flex-col gap-0.5 pb-1 text-center">
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
