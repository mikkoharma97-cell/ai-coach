"use client";

import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { Container } from "@/components/ui/Container";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useCoachDayModel } from "@/hooks/useCoachDayModel";
import { useTranslation } from "@/hooks/useTranslation";
import {
  buildTodayWorkoutForUiWithContent,
  normalizeProfileForEngine,
} from "@/lib/coach";
import { isFoodOnlyMode } from "@/lib/appUsageMode";
import { ExerciseHistoryStrip } from "@/components/workout/ExerciseHistoryStrip";
import { getExerciseHistoryForStrip } from "@/lib/workoutHistory";
import { workoutHistoryEmptyCue } from "@/lib/coachDisplayLabels";
import { getTodayDayKey } from "@/lib/dayKey";
import type { Locale } from "@/lib/i18n";
import { saveSetLog } from "@/lib/workoutStore";
import {
  coachingLinesForShow,
  effectiveSetCount,
  repsTargetLine,
  restLine,
} from "@/lib/workoutExerciseDisplay";
import { trackEvent } from "@/lib/analytics";
import { setJustCompletedWorkoutFlag } from "@/lib/workoutFlowFlags";
import { countDaysMarkedDoneTotal, setDayMarkedDone } from "@/lib/storage";
import type { ProExercise } from "@/types/pro";
import type { GeneratedWorkoutDay } from "@/lib/training/generator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type FlowPhase = "show" | "log" | "finish";

const MAX_MOVES = 6;

const PRIMARY_CTA =
  "flex h-[56px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[17px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60";

function pickBlocks(exercises: ProExercise[]): ProExercise[] {
  if (exercises.length <= MAX_MOVES) return exercises;
  return exercises.slice(0, MAX_MOVES);
}

type SetDraft = { setIndex: number; kg: string; reps: string };

export function WorkoutSessionView() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());
  const [submitting, setSubmitting] = useState(false);
  /** Sarjakohtainen luonnos (näyttö + siirtymä); paino/toistot tallentuvat localStorageen sarjaa tallennettaessa. */
  const [setDrafts, setSetDrafts] = useState<Record<string, SetDraft>>({});
  const [logVersion, setLogVersion] = useState(0);
  const [flowIx, setFlowIx] = useState(0);
  const [flowPhase, setFlowPhase] = useState<FlowPhase>("show");

  const { coachDayModel } = useCoachDayModel({
    justFinishedWorkoutSession: false,
  });

  const normalized = useMemo(
    () => (profile ? normalizeProfileForEngine(profile) : null),
    [profile],
  );

  const generated = useMemo((): GeneratedWorkoutDay | null => {
    if (!normalized) return null;
    return buildTodayWorkoutForUiWithContent({
      profile: normalized,
      now,
      locale,
    });
  }, [normalized, now, locale]);

  const blocks = useMemo(() => {
    if (!generated?.exercises?.length) return [];
    return pickBlocks(generated.exercises);
  }, [generated]);

  const rowKey = useCallback((ex: ProExercise, i: number) => `${ex.id}-${i}`, []);

  const blocksSig = useMemo(
    () => blocks.map((b, i) => rowKey(b, i)).join("|"),
    [blocks, rowKey],
  );

  const exerciseHistory = useMemo(() => {
    const ex = blocks[flowIx];
    if (!ex) return null;
    return getExerciseHistoryForStrip(ex.id, ex.name, locale);
  }, [blocks, flowIx, locale, logVersion]);

  const isRest =
    !generated ||
    generated.isRestDay ||
    generated.exercises.length === 0;

  useEffect(() => {
    if (isRest || blocks.length === 0) return;
    setFlowIx(0);
    setFlowPhase("show");
    setSetDrafts({});
  }, [isRest, blocks.length, blocksSig]);

  const onMarkDone = useCallback(() => {
    if (submitting) return;
    setSubmitting(true);
    try {
      setDayMarkedDone(true, now);
      const doneDays = countDaysMarkedDoneTotal();
      if (doneDays === 1) trackEvent("day1_complete");
      if (doneDays === 2) trackEvent("day2_complete");
      setJustCompletedWorkoutFlag();
      router.push("/app", { scroll: false });
    } catch (e) {
      console.warn("[WorkoutSessionView] mark done failed", e);
      setSubmitting(false);
    }
  }, [now, router, submitting]);

  if (profile === undefined) {
    return (
      <main className="coach-page">
        <Container
          size="phone"
          className="px-5 pb-10 pt-1.5 sm:pt-2"
        >
          <div
            className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] px-4 py-12 text-center"
            role="status"
          >
            <p className="text-[15px] text-muted-2">{t("common.loading")}</p>
          </div>
        </Container>
      </main>
    );
  }

  if (!profile) {
    return <CoachProfileMissingFallback />;
  }

  if (isFoodOnlyMode(profile)) {
    return (
      <main className="coach-page pb-10">
        <Container
          size="phone"
          className="px-5 pt-1.5 sm:pt-2"
        >
          <div className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] px-4 py-6 sm:px-5 sm:py-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
              {t("nav.workout")}
            </p>
            <h1 className="mt-2 text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
              {t("foodOnly.workoutTitle")}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {t("foodOnly.workoutBody")}
            </p>
            <Link
              href="/food"
              className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-accent px-4 text-[15px] font-semibold text-white shadow-[var(--shadow-primary-cta)]"
            >
              {t("foodOnly.workoutGoFood")}
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  if (!generated) {
    return (
      <main className="coach-page">
        <Container
          size="phone"
          className="px-5 pb-10 pt-1.5 sm:pt-2"
        >
          <div
            className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] px-4 py-12 text-center"
            role="status"
          >
            <p className="text-[15px] text-muted-2">{t("common.loading")}</p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="coach-page">
      <Container
        size="phone"
        className="flex min-h-[100dvh] flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1.5 sm:pt-2"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {isRest ? (
            <div className="workout-exercise-surface mt-1 flex flex-col px-4 pb-6 pt-5 sm:px-5 sm:pb-7 sm:pt-6">
              <div className="workout-exercise-surface-inner">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                  {t("workout.restEyebrow")}
                </p>
                <h1 className="mt-2 text-balance text-[1.4rem] font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[1.45rem]">
                  {coachDayModel?.heroTitle ?? t("workout.restTitle")}
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {coachDayModel?.heroGuidance ?? t("workout.restHint")}
                </p>
                <button
                  type="button"
                  onClick={onMarkDone}
                  disabled={submitting}
                  className={`${PRIMARY_CTA} mt-8`}
                >
                  {submitting ? t("common.loading") : t("workoutSession.markDone")}
                </button>
                <Link
                  href="/app"
                  className="mt-4 block text-center text-[13px] font-medium text-muted-2 underline decoration-white/[0.12] underline-offset-4 transition hover:text-foreground"
                >
                  {t("workout.backToday")}
                </Link>
              </div>
            </div>
          ) : null}
          {!isRest && blocks.length === 0 && generated.durationLabel ? (
            <p className="mt-1.5 text-[13px] font-medium tabular-nums text-muted-2">
              {generated.durationLabel}
            </p>
          ) : null}

          {!isRest && blocks.length > 0 ? (
            flowPhase === "finish" ? (
              <div className="workout-exercise-surface mt-2 flex flex-col px-4 pb-6 pt-5 sm:px-5 sm:pb-7 sm:pt-6">
                <div className="workout-exercise-surface-inner">
                  <h2 className="text-balance text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
                    {t("workoutSession.finishHeadline")}
                  </h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">
                    {t("workoutSession.finishLead")}
                  </p>
                  <button
                    type="button"
                    onClick={onMarkDone}
                    disabled={submitting}
                    className={`${PRIMARY_CTA} mt-6`}
                  >
                    {submitting ? t("common.loading") : t("workoutSession.markDone")}
                  </button>
                </div>
              </div>
            ) : (
              (() => {
                const ex = blocks[flowIx];
                const k = rowKey(ex, flowIx);
                const totalSets = effectiveSetCount(ex);
                const draft = setDrafts[k] ?? {
                  setIndex: 0,
                  kg: "",
                  reps: "",
                };
                const restHint = restLine(ex, locale);
                const showLines = coachingLinesForShow(ex, locale);
                const lastSessionLine = exerciseHistory?.lastCompactLine ?? null;

                const onBeginSets = () => {
                  setSetDrafts((prev) => ({
                    ...prev,
                    [k]: { setIndex: 0, kg: "", reps: "" },
                  }));
                  setFlowPhase("log");
                };

                const onSaveSet = () => {
                  const kgRaw = draft.kg.replace(",", ".").trim();
                  const repsRaw = draft.reps.trim();
                  const weight = parseFloat(kgRaw);
                  const reps = parseInt(repsRaw, 10);
                  if (
                    Number.isFinite(weight) &&
                    Number.isFinite(reps) &&
                    reps >= 0 &&
                    ex.id.trim()
                  ) {
                    saveSetLog({
                      exerciseId: ex.id,
                      exerciseName: ex.name,
                      dayKey: getTodayDayKey(),
                      date: new Date().toISOString(),
                      setIndex: draft.setIndex,
                      weight,
                      reps,
                    });
                    setLogVersion((v) => v + 1);
                  }
                  const idx = draft.setIndex;
                  if (idx + 1 < totalSets) {
                    setSetDrafts((prev) => ({
                      ...prev,
                      [k]: {
                        setIndex: idx + 1,
                        kg: draft.kg,
                        reps: "",
                      },
                    }));
                    return;
                  }
                  if (flowIx < blocks.length - 1) {
                    setFlowIx(flowIx + 1);
                    setFlowPhase("show");
                  } else {
                    setFlowPhase("finish");
                  }
                };

                return (
                  <div className="workout-exercise-surface mt-1 flex min-h-0 flex-col px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
                    <div className="workout-exercise-surface-inner flex min-h-0 flex-col">
                      {coachDayModel?.workoutContextLine ? (
                        <p
                          className="mb-2 text-[13px] leading-snug text-muted-2"
                          role="status"
                        >
                          {coachDayModel.workoutContextLine}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                          {t("workoutSession.flowProgress", {
                            current: flowIx + 1,
                            total: blocks.length,
                          })}
                        </p>
                        {generated.durationLabel ? (
                          <p className="text-[12px] font-medium tabular-nums text-muted-2">
                            {generated.durationLabel}
                          </p>
                        ) : null}
                      </div>
                      {flowPhase === "show" ? (
                        <>
                          <h1 className="mt-3 text-balance text-[1.5rem] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground sm:text-[1.6rem]">
                            {ex.name}
                          </h1>
                          <ul
                            className="mt-3 space-y-2.5"
                            aria-label={t("workoutSession.cueTitle")}
                          >
                            {showLines.map((line, i) => (
                              <li
                                key={`${k}-coaching-${i}`}
                                className="text-[15px] leading-[1.45] text-muted"
                              >
                                {line}
                              </li>
                            ))}
                          </ul>
                          {exerciseHistory && exerciseHistory.rows.length > 0 ? (
                            <ExerciseHistoryStrip
                              title={t("workoutSession.exerciseHistoryTitle")}
                              rows={exerciseHistory.rows}
                              progressionHint={exerciseHistory.progressionHint}
                              variant="full"
                            />
                          ) : (
                            <p className="mt-4 text-[13px] leading-snug text-muted-2">
                              {workoutHistoryEmptyCue(locale as Locale)}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={onBeginSets}
                            className={`${PRIMARY_CTA} mt-6`}
                          >
                            {t("workoutSession.ctaBeginSets")}
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="mt-3 text-[15px] font-semibold leading-snug text-foreground/95">
                            {ex.name}
                          </p>
                          {lastSessionLine ? (
                            <ExerciseHistoryStrip
                              variant="compact"
                              title={t("workoutSession.exerciseHistoryLastPrefix")}
                              rows={[]}
                              compactLine={lastSessionLine}
                            />
                          ) : null}
                          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                            {t("workoutSession.setProgressShort", {
                              current: draft.setIndex + 1,
                              total: totalSets,
                            })}
                          </p>
                          <div className="mt-2 flex flex-wrap items-baseline gap-2">
                            <span className="text-[1.75rem] font-semibold tabular-nums tracking-[-0.03em] text-foreground sm:text-[2rem]">
                              {repsTargetLine(ex, locale)}
                            </span>
                            <span className="text-[13px] font-medium text-muted-2">
                              {t("workoutSession.targetReps")}
                            </span>
                          </div>
                          {restHint ? (
                            <p className="mt-2 text-[13px] leading-snug text-muted-2">
                              {restHint}
                            </p>
                          ) : null}

                          <div className="mt-6 grid grid-cols-2 gap-3">
                            <label className="flex flex-col gap-1.5">
                              <span className="text-[12px] font-semibold text-muted-2">
                                {t("workoutSession.weightPrompt")}
                              </span>
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="—"
                                value={draft.kg}
                                onChange={(e) =>
                                  setSetDrafts((prev) => ({
                                    ...prev,
                                    [k]: {
                                      ...draft,
                                      kg: e.target.value,
                                    },
                                  }))
                                }
                                className="h-14 w-full rounded-2xl border border-white/[0.12] bg-background/85 px-4 text-[18px] font-medium tabular-nums text-foreground placeholder:text-muted-2/50 focus-visible:border-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                                autoComplete="off"
                                aria-label={t("workoutSession.weightPrompt")}
                              />
                            </label>
                            <label className="flex flex-col gap-1.5">
                              <span className="text-[12px] font-semibold text-muted-2">
                                {t("workoutSession.repsPrompt")}
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="—"
                                value={draft.reps}
                                onChange={(e) =>
                                  setSetDrafts((prev) => ({
                                    ...prev,
                                    [k]: {
                                      ...draft,
                                      reps: e.target.value,
                                    },
                                  }))
                                }
                                className="h-14 w-full rounded-2xl border border-white/[0.12] bg-background/85 px-4 text-[18px] font-medium tabular-nums text-foreground placeholder:text-muted-2/50 focus-visible:border-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                                autoComplete="off"
                                aria-label={t("workoutSession.repsPrompt")}
                              />
                            </label>
                          </div>

                          <button
                            type="button"
                            onClick={onSaveSet}
                            className={`${PRIMARY_CTA} mt-8`}
                          >
                            {t("workoutSession.ctaSaveSet")}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()
            )
          ) : null}
        </div>
      </Container>
    </main>
  );
}
