"use client";

import { PreStartSalesWall } from "@/components/start/PreStartSalesWall";
import { HelpVideoCard } from "@/components/ui/HelpVideoCard";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { ProgramPackageCards } from "@/components/packages/ProgramPackageCards";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { applyPackageToAnswers } from "@/lib/programPackages";
import { getCoachFeatureToggles } from "@/lib/coachFeatureToggles";
import { emptyAnswers } from "@/lib/plan";
import { PROGRAM_TRACKS } from "@/lib/programTracks";
import { trackEvent } from "@/lib/analytics";
import { flowLog } from "@/lib/flowLog";
import { loadProfile, saveProfile } from "@/lib/storage";
import type {
  BiggestChallenge,
  DaysPerWeek,
  LastBestShape,
  OnboardingAnswers,
  ProgramTrackId,
  RecentTrainingFreq,
  TrainingVenue,
} from "@/types/coach";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

const QUESTION_TOTAL = 11;
const PRESTART_SEEN_KEY = "coach_prestart_seen";
const BUILD_DELAY_MS = 1200;

const dayOptions: { value: DaysPerWeek; label: string }[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
];

const LAST_SHAPE_OPTS: {
  value: LastBestShape;
  labelKey:
    | "onboarding.lastShapeWithin6m"
    | "onboarding.lastShapeWithin2y"
    | "onboarding.lastShapeLongAgo"
    | "onboarding.lastShapeNotSure";
}[] = [
  { value: "within_6m", labelKey: "onboarding.lastShapeWithin6m" },
  { value: "within_2y", labelKey: "onboarding.lastShapeWithin2y" },
  { value: "long_ago", labelKey: "onboarding.lastShapeLongAgo" },
  { value: "not_sure", labelKey: "onboarding.lastShapeNotSure" },
];

const VENUE_OPTS: {
  value: TrainingVenue;
  labelKey:
    | "onboarding.venueGym"
    | "onboarding.venueHome"
    | "onboarding.venueOutdoor"
    | "onboarding.venueMixed";
}[] = [
  { value: "gym", labelKey: "onboarding.venueGym" },
  { value: "home", labelKey: "onboarding.venueHome" },
  { value: "outdoor", labelKey: "onboarding.venueOutdoor" },
  { value: "mixed", labelKey: "onboarding.venueMixed" },
];

const FREQ_OPTS: {
  value: RecentTrainingFreq;
  labelKey:
    | "onboarding.freqRare"
    | "onboarding.freqWeeklyFew"
    | "onboarding.freqWeeklyMost"
    | "onboarding.freqDaily";
}[] = [
  { value: "rare", labelKey: "onboarding.freqRare" },
  { value: "weekly_few", labelKey: "onboarding.freqWeeklyFew" },
  { value: "weekly_most", labelKey: "onboarding.freqWeeklyMost" },
  { value: "daily", labelKey: "onboarding.freqDaily" },
];

const CHALLENGE_OPTS: {
  value: BiggestChallenge;
  labelKey:
    | "onboarding.chMotivation"
    | "onboarding.chTime"
    | "onboarding.chUnsure"
    | "onboarding.chFallOff";
}[] = [
  { value: "motivation", labelKey: "onboarding.chMotivation" },
  { value: "lack_of_time", labelKey: "onboarding.chTime" },
  { value: "dont_know_what_to_do", labelKey: "onboarding.chUnsure" },
  { value: "fall_off_after_starting", labelKey: "onboarding.chFallOff" },
];

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
      className={`w-full rounded-[var(--radius-xl)] border px-5 py-4 text-left text-[15px] font-medium leading-snug tracking-[-0.015em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] ${
        selected
          ? "border-accent bg-accent-soft text-accent shadow-[0_0_0_1px_rgb(42_92_191/0.12)]"
          : "border-border/90 bg-card/80 text-foreground hover:border-accent/35 hover:bg-card"
      }`}
    >
      {children}
    </button>
  );
}

function initialFromStorage(): OnboardingAnswers {
  try {
    const p = loadProfile();
    return p ? { ...emptyAnswers(), ...p } : emptyAnswers();
  } catch (e) {
    console.warn("[coach] onboarding initialFromStorage failed", e);
    return emptyAnswers();
  }
}

export function StartFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [building, setBuilding] = useState(false);
  const [existingProfile, setExistingProfile] = useState(false);
  const [preStartDone, setPreStartDone] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>(() =>
    initialFromStorage(),
  );

  useLayoutEffect(() => {
    try {
      const has = Boolean(loadProfile());
      setExistingProfile(has);
      if (has) {
        setPreStartDone(true);
        return;
      }
      if (sessionStorage.getItem(PRESTART_SEEN_KEY) === "1") {
        setPreStartDone(true);
      }
    } catch {
      setExistingProfile(false);
    }
  }, []);

  useEffect(() => {
    trackEvent("onboarding_start");
  }, []);

  useBodyScrollLock(building);

  /** URL ↔ askel — luotettavampi mobiili-/WebView-navigointi kuin pelkkä onClick-state */
  useEffect(() => {
    const raw = searchParams.get("step");
    if (raw == null || raw === "") return;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    if (n >= 1 && n <= QUESTION_TOTAL) setStep(n);
  }, [searchParams]);

  const startBuild = useCallback(
    (next: OnboardingAnswers) => {
      try {
        saveProfile(next);
        flowLog("onboarding.profileSaved");
      } catch (e) {
        console.warn("[coach] saveProfile in startBuild failed", e);
      }
      setBuilding(true);
      window.setTimeout(() => {
        console.debug("[coach] onboarding: navigate /app after build");
        flowLog("onboarding.navigateApp");
        trackEvent("onboarding_complete");
        router.push("/app");
      }, BUILD_DELAY_MS);
      window.setTimeout(() => {
        setBuilding((b) => {
          if (b) {
            console.warn(
              "[coach] onboarding: build overlay failsafe — closing overlay",
            );
          }
          return false;
        });
      }, BUILD_DELAY_MS + 10000);
    },
    [router],
  );

  const patchAndNext = useCallback(
    (patch: Partial<OnboardingAnswers>) => {
      setAnswers((a) => ({ ...a, ...patch }));
      setStep((s) => {
        const ns = s + 1;
        console.debug("[coach] onboarding next step", ns);
        router.replace(`/start?step=${ns}`, { scroll: false });
        return ns;
      });
    },
    [router],
  );

  const back = useCallback(() => {
    setStep((s) => {
      if (s <= 0) return s;
      const ns = s - 1;
      if (ns <= 0) router.replace("/start", { scroll: false });
      else router.replace(`/start?step=${ns}`, { scroll: false });
      return ns;
    });
  }, [router]);

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
        <p className="relative mt-6 text-center text-[1.375rem] font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[1.5rem]">
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

  return (
    <div className="min-h-dvh bg-gradient-to-b from-card/[0.04] via-background to-background">
      <header className="sticky top-0 z-20 flex min-h-[3rem] items-center justify-between border-b border-white/[0.05] bg-[rgba(11,17,32,0.6)] px-5 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(11,17,32,0.55)] transition duration-[250ms] ease-in-out">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
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
          {step === 0
            ? t("onboarding.headerSetup")
            : t("onboarding.headerSystem")}
        </span>
        <div className="w-[44px]" aria-hidden />
      </header>

      {existingProfile ? (
        <div className="border-b border-white/[0.08] bg-accent/[0.06] px-5 py-3 text-center">
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

      <main className="pb-16 pt-8 sm:pt-10">
        <Container size="phone" className="px-5">
          {step === 0 && !preStartDone && !existingProfile ? (
            <PreStartSalesWall
              onContinue={() => {
                try {
                  sessionStorage.setItem(PRESTART_SEEN_KEY, "1");
                } catch {
                  /* ignore */
                }
                trackEvent("prestart_wall_continue");
                setPreStartDone(true);
                router.replace("/start", { scroll: false });
                window.scrollTo(0, 0);
              }}
            />
          ) : null}

          {step === 0 && (preStartDone || existingProfile) ? (
            <HelpVideoCard
              pageId="start"
              enabled={getCoachFeatureToggles(answers).showHelpVideos}
              className="mb-6"
            />
          ) : null}

          {step === 0 && (preStartDone || existingProfile) ? (
            <div className="flex min-h-[calc(100dvh-8.5rem)] flex-col">
              <div className="flex flex-1 flex-col justify-center pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                  {t("onboarding.introKicker")}
                </p>
                <h1 className="mt-6 text-balance text-[1.75rem] font-semibold leading-[1.12] tracking-[-0.04em] text-foreground sm:text-[2rem]">
                  {t("onboarding.introTitle")}
                </h1>
                <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted">
                  {t("onboarding.introBody")}
                </p>
                <p className="mt-4 max-w-sm text-[14px] font-medium leading-snug text-foreground/90">
                  {t("onboarding.introProof")}
                </p>
                <div className="mt-6 max-w-sm space-y-2 rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                  <p className="text-[13px] leading-relaxed text-muted">
                    {t("onboarding.trialRetention1")}
                  </p>
                  <p className="text-[13px] leading-relaxed text-muted">
                    {t("onboarding.trialRetention2")}
                  </p>
                </div>
              </div>
              <div className="relative z-10 flex-shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
                <button
                  type="button"
                  onClick={() => {
                    console.debug("[coach] onboarding: intro Jatka → step 1");
                    setStep(1);
                    router.replace("/start?step=1", { scroll: false });
                  }}
                  className="flex h-[52px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[16px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("onboarding.continue")}
                </button>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <section aria-labelledby="q-package">
              <OnboardingProgress current={1} total={QUESTION_TOTAL} />
              <h2
                id="q-package"
                className="mt-10 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground"
              >
                {t("onboarding.qPackage")}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {t("onboarding.packageHint")}
              </p>
              <div className="mt-8">
                <ProgramPackageCards
                  selectedId={answers.selectedPackageId}
                  onSelect={(id) => {
                    const patch = applyPackageToAnswers(id);
                    setAnswers((a) => {
                      const next = { ...a, ...patch };
                      try {
                        saveProfile(next);
                      } catch (e) {
                        console.warn("[coach] package step saveProfile failed", e);
                      }
                      return next;
                    });
                    setStep(2);
                    router.replace("/start?step=2", { scroll: false });
                  }}
                />
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section aria-labelledby="q-track">
              <OnboardingProgress current={2} total={QUESTION_TOTAL} />
              <h2
                id="q-track"
                className="mt-10 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground"
              >
                {t("onboarding.qProgramTrack")}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {t("onboarding.programTrackHint")}
              </p>
              <div className="mt-8 flex flex-col gap-2.5">
                {PROGRAM_TRACKS.map((tr) => (
                  <PickButton
                    key={tr.id}
                    selected={answers.programTrackId === tr.id}
                    onClick={() =>
                      patchAndNext({ programTrackId: tr.id as ProgramTrackId })
                    }
                  >
                    {t(`programTrack.${tr.id}` as const)}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section aria-labelledby="q-last-shape">
              <OnboardingProgress current={3} total={QUESTION_TOTAL} />
              <h2
                id="q-last-shape"
                className="mt-10 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground"
              >
                {t("onboarding.qLastBestShape")}
              </h2>
              <div className="mt-8 flex flex-col gap-2.5">
                {LAST_SHAPE_OPTS.map((o) => (
                  <PickButton
                    key={o.value}
                    selected={answers.lastBestShape === o.value}
                    onClick={() => patchAndNext({ lastBestShape: o.value })}
                  >
                    {t(o.labelKey)}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 4 ? (
            <section aria-labelledby="q-venue">
              <OnboardingProgress current={4} total={QUESTION_TOTAL} />
              <h2
                id="q-venue"
                className="mt-10 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground"
              >
                {t("onboarding.qTrainingVenue")}
              </h2>
              <div className="mt-8 flex flex-col gap-2.5">
                {VENUE_OPTS.map((o) => (
                  <PickButton
                    key={o.value}
                    selected={answers.trainingVenue === o.value}
                    onClick={() => patchAndNext({ trainingVenue: o.value })}
                  >
                    {t(o.labelKey)}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 5 ? (
            <section aria-labelledby="q-freq">
              <OnboardingProgress current={5} total={QUESTION_TOTAL} />
              <h2
                id="q-freq"
                className="mt-10 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground"
              >
                {t("onboarding.qRecentFreq")}
              </h2>
              <div className="mt-8 flex flex-col gap-2.5">
                {FREQ_OPTS.map((o) => (
                  <PickButton
                    key={o.value}
                    selected={answers.recentTrainingFreq === o.value}
                    onClick={() =>
                      patchAndNext({ recentTrainingFreq: o.value })
                    }
                  >
                    {t(o.labelKey)}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 6 ? (
            <section aria-labelledby="q-challenge">
              <OnboardingProgress current={6} total={QUESTION_TOTAL} />
              <h2
                id="q-challenge"
                className="mt-10 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground"
              >
                {t("onboarding.qChallenge")}
              </h2>
              <div className="mt-8 flex flex-col gap-2.5">
                {CHALLENGE_OPTS.map((o) => (
                  <PickButton
                    key={o.value}
                    selected={answers.biggestChallenge === o.value}
                    onClick={() => patchAndNext({ biggestChallenge: o.value })}
                  >
                    {t(o.labelKey)}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 7 ? (
            <section aria-labelledby="q-goal">
              <OnboardingProgress current={7} total={QUESTION_TOTAL} />
              <h2
                id="q-goal"
                className="mt-10 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground"
              >
                {t("onboarding.qGoal")}
              </h2>
              <div className="mt-8 flex flex-col gap-2.5">
                {(
                  [
                    { value: "lose_weight" as const, labelKey: "onboarding.goalLose" as const },
                    { value: "build_muscle" as const, labelKey: "onboarding.goalMuscle" as const },
                    {
                      value: "improve_fitness" as const,
                      labelKey: "onboarding.goalFitness" as const,
                    },
                  ] as const
                ).map((o) => (
                  <PickButton
                    key={o.value}
                    selected={answers.goal === o.value}
                    onClick={() => patchAndNext({ goal: o.value })}
                  >
                    {t(o.labelKey)}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 8 ? (
            <section aria-labelledby="q-level">
              <OnboardingProgress current={8} total={QUESTION_TOTAL} />
              <h2
                id="q-level"
                className="mt-10 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground"
              >
                {t("onboarding.qLevel")}
              </h2>
              <div className="mt-8 flex flex-col gap-2.5">
                {(
                  [
                    { value: "beginner" as const, labelKey: "onboarding.levelBeginner" as const },
                    { value: "intermediate" as const, labelKey: "onboarding.levelMid" as const },
                    { value: "advanced" as const, labelKey: "onboarding.levelAdvanced" as const },
                  ] as const
                ).map((o) => (
                  <PickButton
                    key={o.value}
                    selected={answers.level === o.value}
                    onClick={() =>
                      patchAndNext({ level: o.value, trainingLevel: o.value })
                    }
                  >
                    {t(o.labelKey)}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 9 ? (
            <section aria-labelledby="q-days">
              <OnboardingProgress current={9} total={QUESTION_TOTAL} />
              <h2
                id="q-days"
                className="mt-10 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground"
              >
                {t("onboarding.qDays")}
              </h2>
              <div className="mt-8 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                {dayOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => patchAndNext({ daysPerWeek: o.value })}
                    className={`flex min-h-[52px] items-center justify-center rounded-[var(--radius-lg)] border text-[17px] font-semibold tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 active:scale-[0.98] ${
                      answers.daysPerWeek === o.value
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border/90 bg-card/80 text-foreground hover:border-accent/35"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 10 ? (
            <section aria-labelledby="q-eating">
              <OnboardingProgress current={10} total={QUESTION_TOTAL} />
              <h2
                id="q-eating"
                className="mt-10 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground"
              >
                {t("onboarding.qFoodDirection")}
              </h2>
              <div className="mt-8 flex flex-col gap-2.5">
                {(
                  [
                    { value: "irregular" as const, labelKey: "onboarding.eatIrregular" as const },
                    { value: "okay" as const, labelKey: "onboarding.eatOkay" as const },
                    { value: "good" as const, labelKey: "onboarding.eatGood" as const },
                  ] as const
                ).map((o) => (
                  <PickButton
                    key={o.value}
                    selected={answers.eatingHabits === o.value}
                    onClick={() => patchAndNext({ eatingHabits: o.value })}
                  >
                    {t(o.labelKey)}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}

          {step === 11 ? (
            <section aria-labelledby="q-flex">
              <OnboardingProgress current={11} total={QUESTION_TOTAL} />
              <h2
                id="q-flex"
                className="mt-10 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground"
              >
                {t("onboarding.qFlex")}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {t("onboarding.flexHelp")}
              </p>
              <div className="mt-8 flex flex-col gap-2.5">
                {(
                  [
                    { value: "structured" as const, labelKey: "onboarding.flexStructured" as const },
                    { value: "balanced" as const, labelKey: "onboarding.flexBalanced" as const },
                    { value: "flexible" as const, labelKey: "onboarding.flexFlexible" as const },
                  ] as const
                ).map((o) => (
                  <PickButton
                    key={o.value}
                    selected={answers.flexibility === o.value}
                    onClick={() => {
                      const next: OnboardingAnswers = {
                        ...emptyAnswers(),
                        ...answers,
                        flexibility: o.value,
                      };
                      setAnswers(next);
                      startBuild(next);
                    }}
                  >
                    {t(o.labelKey)}
                  </PickButton>
                ))}
              </div>
            </section>
          ) : null}
        </Container>
      </main>
    </div>
  );
}
