"use client";

import { CoachAppShortcuts } from "@/components/app/CoachAppShortcuts";
import {
  ExerciseCoachTipsPanel,
  ExerciseMediaVideoSlot,
} from "@/components/workout/ExerciseMediaPanel";
import { HelpVideoCard } from "@/components/ui/HelpVideoCard";
import { CoachScreenHeader } from "@/components/ui/CoachScreenHeader";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { useWorkoutVoiceCommands } from "@/hooks/useWorkoutVoiceCommands";
import type { MessageKey } from "@/lib/i18n";
import type { WorkoutVoiceCommand } from "@/lib/workout/voiceParser";
import { logButtonClick } from "@/lib/uiInteractionDebug";
import {
  saveWorkoutSession,
  serializeWorkoutSession,
  type WorkoutSessionSerializeMeta,
} from "@/lib/workoutLogStorage";
import { getExerciseById } from "@/lib/training/exercises";
import { getSwapTargetsForExercise } from "@/lib/training/exerciseOverrides";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WorkoutSessionMode } from "@/types/adaptiveCoaching";

export type WorkoutViewSet = {
  reps: string;
  rpe?: string;
  /** Kirjattu paino (teksti), esim. "80" */
  weight?: string;
};

export type WorkoutViewExercise = {
  id: string;
  /** Generaattorin liike-id ennen käyttäjän vaihtoa */
  canonicalExerciseId?: string;
  name: string;
  target: string;
  sets: WorkoutViewSet[];
  videoUrl?: string;
  videoPoster?: string;
  restLine?: string;
  prescriptionLineFi?: string;
  prescriptionLineEn?: string;
  coachTipFi?: string;
  coachTipEn?: string;
  coachMistakeFi?: string;
  coachMistakeEn?: string;
  coachFocusFi?: string;
  coachFocusEn?: string;
};

type SetRow = WorkoutViewSet & { completed?: boolean };

type ExerciseRow = Omit<WorkoutViewExercise, "sets"> & { sets: SetRow[] };

type Props = {
  exercises?: WorkoutViewExercise[];
  dataFallbackKey?: MessageKey | null;
  showVoiceWorkout?: boolean;
  showHelpVideos?: boolean;
  /** Lokidatasta: viimeisin volyymi / trendi per liike (locale jo valittu) */
  exercisePerformanceHints?: { exerciseId: string; line: string }[];
  /** Sallittu liikevaihto (katalogin vaihtoehdot) */
  enableExerciseSwap?: boolean;
  onSwapExercise?: (
    canonicalId: string,
    targetId: string | null,
    scope: "session" | "profile",
  ) => void;
  sessionMode?: WorkoutSessionMode;
  onSessionModeChange?: (mode: WorkoutSessionMode) => void;
  sessionLogMeta?: WorkoutSessionSerializeMeta;
};

function exerciseRowsToSerializable(rows: ExerciseRow[]) {
  return rows.map((ex) => ({
    id: ex.id,
    name: ex.name,
    sets: ex.sets.map((s) => ({
      reps: s.reps,
      weight: s.weight,
      rpe: s.rpe,
      completed: s.completed,
    })),
  }));
}

function cloneExercises(list: WorkoutViewExercise[]): ExerciseRow[] {
  return list.map((ex) => ({
    ...ex,
    sets: ex.sets.map((s) => ({ ...s, completed: false })),
  }));
}

function feedbackForCommand(
  cmd: WorkoutVoiceCommand,
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
): string {
  switch (cmd.type) {
    case "complete_set":
      return t("workout.voice.feedback.complete");
    case "next_exercise":
      return t("workout.voice.feedback.nextExercise");
    case "previous":
      return t("workout.voice.feedback.previous");
    case "skip_exercise":
      return t("workout.voice.feedback.skip");
    case "finish_workout":
      return t("workout.voice.feedback.finish");
    case "set_weight":
      return t("workout.voice.feedback.weight", { kg: String(cmd.kg) });
    case "set_reps":
      return t("workout.voice.feedback.reps", { n: String(cmd.reps) });
    case "set_rpe":
      return t("workout.voice.feedback.rpe", { n: String(cmd.rpe) });
    case "set_weight_and_reps":
      return t("workout.voice.feedback.weightReps", {
        w: String(cmd.weight),
        r: String(cmd.reps),
      });
    default:
      return "";
  }
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zM11 19h2v2h-2v-2z"
      />
    </svg>
  );
}

/**
 * Treenisession näkymä — sama visuaalinen kieli kuin Today / Plan.
 */
export function WorkoutView({
  exercises,
  dataFallbackKey,
  showVoiceWorkout = true,
  showHelpVideos = true,
  exercisePerformanceHints,
  enableExerciseSwap = false,
  onSwapExercise,
  sessionMode = "normal",
  onSessionModeChange,
  sessionLogMeta,
}: Props) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const list = exercises ?? [];
  const headerSubtitle =
    list.length > 0
      ? t("workout.exerciseCountShort", { count: list.length })
      : undefined;

  const [rows, setRows] = useState<ExerciseRow[]>(() =>
    cloneExercises(exercises ?? []),
  );
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const activeExerciseIndexRef = useRef(activeExerciseIndex);
  const activeSetIndexRef = useRef(activeSetIndex);
  activeExerciseIndexRef.current = activeExerciseIndex;
  activeSetIndexRef.current = activeSetIndex;
  const [feedbackLine, setFeedbackLine] = useState<string | null>(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  /** Modaalissa vaihdettava rivi (ei vain aktiivinen iso kortti). */
  const [swapFocusIndex, setSwapFocusIndex] = useState<number | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [swapScope, setSwapScope] = useState<"session" | "profile">("session");
  const [confirmFlash, setConfirmFlash] = useState<string | null>(null);

  const logMetaEffective: WorkoutSessionSerializeMeta | undefined =
    sessionLogMeta;

  const saveSessionAndGoApp = useCallback(() => {
    const log = serializeWorkoutSession(
      exerciseRowsToSerializable(rowsRef.current),
      new Date(),
      logMetaEffective,
    );
    saveWorkoutSession(log);
    router.push("/app");
  }, [router, logMetaEffective]);

  const exercisesSyncKey = useMemo(
    () =>
      (exercises ?? [])
        .map((e) => `${e.canonicalExerciseId ?? e.id}:${e.id}`)
        .join("|"),
    [exercises],
  );

  useEffect(() => {
    setRows(cloneExercises(exercises ?? []));
    setActiveExerciseIndex(0);
    setActiveSetIndex(0);
  }, [exercisesSyncKey, exercises]);

  const applyCommand = useCallback(
    (cmd: WorkoutVoiceCommand) => {
      const ae = activeExerciseIndexRef.current;
      const as = activeSetIndexRef.current;

      setRows((prev) => {
        const next = prev.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) => ({ ...s })),
        }));

        const markActive = () => {
          const ex = next[ae];
          if (!ex?.sets[as]) return;
          ex.sets[as].completed = true;
        };

        const advanceAfterComplete = () => {
          const ex = next[ae];
          if (!ex) return;
          if (as < ex.sets.length - 1) {
            setActiveSetIndex(as + 1);
          } else if (ae < next.length - 1) {
            setActiveExerciseIndex(ae + 1);
            setActiveSetIndex(0);
          }
        };

        switch (cmd.type) {
          case "complete_set": {
            markActive();
            advanceAfterComplete();
            return next;
          }
          case "next_exercise": {
            if (ae < next.length - 1) {
              setActiveExerciseIndex(ae + 1);
              setActiveSetIndex(0);
            }
            return next;
          }
          case "skip_exercise": {
            if (ae < next.length - 1) {
              setActiveExerciseIndex(ae + 1);
              setActiveSetIndex(0);
            }
            return next;
          }
          case "previous": {
            if (as > 0) {
              setActiveSetIndex(as - 1);
            } else if (ae > 0) {
              const pi = ae - 1;
              const plen = next[pi].sets.length;
              setActiveExerciseIndex(pi);
              setActiveSetIndex(Math.max(0, plen - 1));
            }
            return next;
          }
          case "set_weight": {
            const ex = next[ae];
            if (ex?.sets[as]) {
              ex.sets[as].weight = String(cmd.kg);
            }
            return next;
          }
          case "set_reps": {
            const ex = next[ae];
            if (ex?.sets[as]) {
              ex.sets[as].reps = String(cmd.reps);
            }
            return next;
          }
          case "set_rpe": {
            const ex = next[ae];
            if (ex?.sets[as]) {
              ex.sets[as].rpe = String(cmd.rpe);
            }
            return next;
          }
          case "set_weight_and_reps": {
            const ex = next[ae];
            if (ex?.sets[as]) {
              ex.sets[as].weight = String(cmd.weight);
              ex.sets[as].reps = String(cmd.reps);
            }
            return next;
          }
          case "finish_workout": {
            const log = serializeWorkoutSession(
              exerciseRowsToSerializable(prev),
              new Date(),
              logMetaEffective,
            );
            saveWorkoutSession(log);
            router.push("/app");
            return prev;
          }
          default:
            return next;
        }
      });
    },
    [router, logMetaEffective],
  );

  const onVoiceCommand = useCallback(
    (cmd: WorkoutVoiceCommand | null, raw: string) => {
      if (cmd) {
        setFeedbackLine(feedbackForCommand(cmd, t));
        applyCommand(cmd);
      } else if (raw.trim()) {
        setFeedbackLine(t("workout.voice.feedback.none"));
      }
    },
    [applyCommand, t],
  );

  const voice = useWorkoutVoiceCommands({
    locale: locale === "en" ? "en" : "fi",
    onCommand: onVoiceCommand,
  });

  const stripText = useMemo(() => {
    if (voice.isListening) return t("workout.voice.listening");
    if (voice.lastErrorKey) {
      const k = `workout.voice.error.${voice.lastErrorKey}` as const;
      const msg = t(k);
      if (msg) return msg;
    }
    if (feedbackLine) return feedbackLine;
    return t("workout.voice.pushToTalkHint");
  }, [voice.isListening, voice.lastErrorKey, feedbackLine, t]);

  const { setsDone, setsTotal } = useMemo(() => {
    let done = 0;
    let total = 0;
    for (const ex of rows) {
      for (const s of ex.sets) {
        total++;
        if (s.completed) done++;
      }
    }
    return { setsDone: done, setsTotal: total };
  }, [rows]);

  const activePerfHint = useMemo(() => {
    const ex = rows[activeExerciseIndex];
    if (!ex || !exercisePerformanceHints?.length) return null;
    return (
      exercisePerformanceHints.find((h) => h.exerciseId === ex.id)?.line ??
      null
    );
  }, [rows, activeExerciseIndex, exercisePerformanceHints]);

  const modalExerciseIndex = swapModalOpen
    ? (swapFocusIndex ?? activeExerciseIndex)
    : activeExerciseIndex;

  const modalSwapSourceId = useMemo(() => {
    if (!swapModalOpen) return null;
    const ex = rows[modalExerciseIndex];
    if (!ex) return null;
    return ex.canonicalExerciseId ?? ex.id;
  }, [rows, modalExerciseIndex, swapModalOpen]);

  const modalSwapOptions = useMemo(() => {
    if (!modalSwapSourceId) return [];
    return getSwapTargetsForExercise(modalSwapSourceId);
  }, [modalSwapSourceId]);

  const modalCategoryKey = useMemo((): MessageKey | null => {
    if (!modalSwapSourceId) return null;
    const cat = getExerciseById(modalSwapSourceId)?.category;
    if (!cat) return null;
    return `workout.exerciseCategory.${cat}` as MessageKey;
  }, [modalSwapSourceId]);

  const modalRow = rows[modalExerciseIndex];

  const openSwapModal = useCallback((exerciseIndex: number) => {
    setSwapFocusIndex(exerciseIndex);
    setActiveExerciseIndex(exerciseIndex);
    setSwapModalOpen(true);
    logButtonClick("WorkoutView", "openSwapExercise");
  }, []);

  const openSwapFromCustomize = useCallback(() => {
    setCustomizeOpen(false);
    openSwapModal(activeExerciseIndex);
  }, [openSwapModal, activeExerciseIndex]);

  const closeSwapModal = useCallback(() => {
    setSwapModalOpen(false);
    setSwapFocusIndex(null);
  }, []);

  return (
    <main className="coach-page pb-10">
      <Container size="phone" className="px-5">
        <CoachScreenHeader
          eyebrow={t("workout.eyebrow")}
          title={list.length > 0 ? t("workout.todayTitle") : t("workout.title")}
          description={headerSubtitle}
          action={
            <button
              type="button"
              onClick={() => {
                logButtonClick("WorkoutView", "backToTodayHeader");
                saveSessionAndGoApp();
              }}
              className="inline-flex min-h-[44px] items-center text-[13px] font-semibold text-accent underline-offset-[3px] transition hover:text-foreground hover:underline"
            >
              {t("workout.backToday")}
            </button>
          }
        />

        {list.length > 0 && onSessionModeChange ? (
          <div className="mt-4 flex flex-col gap-2">
            {confirmFlash ? (
              <p className="text-[12px] font-medium text-accent" role="status">
                {confirmFlash}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  logButtonClick("WorkoutView", "openCustomize");
                  setCustomizeOpen(true);
                }}
                className="inline-flex min-h-[44px] items-center rounded-[var(--radius-lg)] border border-white/[0.12] bg-white/[0.05] px-4 text-[13px] font-semibold text-foreground transition hover:border-accent/35"
              >
                {t("workout.smart.customizeCta")}
              </button>
              {sessionMode === "quick" ? (
                <span className="rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                  {t("workout.smart.badgeQuick")}
                </span>
              ) : null}
              {sessionMode === "no_equipment" ? (
                <span className="rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                  {t("workout.smart.badgeNoEquipment")}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {list.length > 0 && rows[activeExerciseIndex] ? (
          <section
            className="mt-4 overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.1] bg-white/[0.03] px-4 py-4 sm:px-5"
            aria-labelledby="active-ex-heading"
          >
            <p
              id="active-ex-heading"
              className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2"
            >
              {t("workout.exercise.activeEyebrow", {
                current: activeExerciseIndex + 1,
                total: rows.length,
              })}
            </p>
            <h3 className="mt-1 text-[1.15rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
              {rows[activeExerciseIndex].name}
            </h3>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-2">
              {rows[activeExerciseIndex].target}
            </p>
            {rows[activeExerciseIndex].restLine ? (
              <p className="mt-2 text-[12px] text-muted">
                {locale === "en" ? "Rest" : "Lepo"}:{" "}
                {rows[activeExerciseIndex].restLine}
              </p>
            ) : null}
            {(() => {
              const pl =
                locale === "en"
                  ? rows[activeExerciseIndex].prescriptionLineEn ??
                    rows[activeExerciseIndex].prescriptionLineFi
                  : rows[activeExerciseIndex].prescriptionLineFi ??
                    rows[activeExerciseIndex].prescriptionLineEn;
              return pl ? (
                <p className="mt-1 text-[12px] leading-snug text-accent/90">
                  {pl}
                </p>
              ) : null;
            })()}
            {activePerfHint ? (
              <p className="mt-2 text-[12px] font-medium leading-snug text-accent/95">
                {activePerfHint}
              </p>
            ) : null}
            <ul className="mt-4 divide-y divide-white/[0.06]">
              {rows[activeExerciseIndex].sets.map((row, i) => {
                const isActive = i === activeSetIndex;
                return (
                  <li
                    key={`active-set-${i}`}
                    className={`flex min-h-[52px] items-center justify-between gap-3 py-3.5 transition ${
                      isActive
                        ? "rounded-lg bg-accent/[0.14] ring-2 ring-accent/55 shadow-[0_0_0_1px_rgba(59,130,246,0.25)] -mx-1 px-2"
                        : ""
                    } ${row.completed ? "opacity-55" : ""}`}
                  >
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2">
                        {t("workout.setLabel", { n: i + 1 })}
                      </span>
                      {row.completed ? (
                        <span
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent"
                          aria-hidden
                        >
                          ✓
                        </span>
                      ) : null}
                    </span>
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-3 sm:gap-4">
                      {row.weight ? (
                        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-muted">
                          {row.weight}
                          <span className="ml-0.5 text-[10px] font-medium text-muted-2">
                            kg
                          </span>
                        </span>
                      ) : null}
                      <span className="text-[1.05rem] font-semibold tabular-nums tracking-[-0.02em] text-foreground">
                        {row.reps}
                      </span>
                      {row.rpe ? (
                        <span className="shrink-0 rounded-md border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium tabular-nums text-muted">
                          RPE {row.rpe}
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
            <details className="mt-4 border-t border-white/[0.08] pt-3">
              <summary className="cursor-pointer list-none text-[12px] font-semibold text-accent marker:content-none [&::-webkit-details-marker]:hidden">
                {t("workout.foldTechniqueVideo")}
              </summary>
              <div className="mt-3 space-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                    {t("swipe.panelCoach")}
                  </p>
                  <div className="mt-2">
                    <ExerciseCoachTipsPanel exercise={rows[activeExerciseIndex]} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                    {t("swipe.panelMedia")}
                  </p>
                  <div className="mt-2">
                    <ExerciseMediaVideoSlot exercise={rows[activeExerciseIndex]} />
                  </div>
                </div>
              </div>
            </details>
          </section>
        ) : null}

        {list.length > 0 && setsTotal > 0 && setsDone < setsTotal ? (
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={() => {
                logButtonClick("WorkoutView", "completeSet");
                setFeedbackLine(t("workout.voice.feedback.complete"));
                applyCommand({ type: "complete_set" });
              }}
              className="min-h-[52px] flex-1 rounded-[var(--radius-lg)] bg-accent px-4 text-[15px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99]"
            >
              {t("workout.tapCompleteSetCta")}
            </button>
            {rows.length > 1 && activeExerciseIndex < rows.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  logButtonClick("WorkoutView", "nextExercise");
                  setFeedbackLine(t("workout.voice.feedback.nextExercise"));
                  applyCommand({ type: "next_exercise" });
                }}
                className="min-h-[52px] flex-1 rounded-[var(--radius-lg)] border-2 border-accent/45 bg-white/[0.04] px-4 text-[15px] font-semibold text-foreground transition hover:border-accent/70 hover:bg-accent/[0.08] active:scale-[0.99]"
              >
                {t("workout.nextExerciseNamed", {
                  name: rows[activeExerciseIndex + 1]!.name,
                })}
              </button>
            ) : null}
          </div>
        ) : null}

        {list.length > 0 && setsTotal > 0 && setsDone >= setsTotal ? (
          <div className="mt-4">
            <button
              type="button"
              className="flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-lg)] border border-accent/40 bg-accent/15 px-4 text-[13px] font-semibold text-accent transition hover:bg-accent/25"
              onClick={() => {
                logButtonClick("WorkoutView", "backToToday");
                saveSessionAndGoApp();
              }}
            >
              {t("workout.backToday")}
            </button>
          </div>
        ) : null}

        {list.length > 0 ? (
          <details className="coach-panel-subtle group mt-6">
            <summary className="cursor-pointer list-none px-1 py-2 text-[13px] font-medium text-muted marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                <span>{t("workout.sessionExtrasSummary")}</span>
                <span className="text-[11px] font-normal text-muted-2 group-open:hidden">
                  {t("common.show")}
                </span>
                <span className="hidden text-[11px] font-normal text-muted-2 group-open:inline">
                  {t("common.hide")}
                </span>
              </span>
            </summary>
            <div className="space-y-4 border-t border-border/40 pt-4">
              {showVoiceWorkout ? (
                <div
                  className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.03] px-3 py-2.5"
                  role="status"
                  aria-live="polite"
                >
                  <button
                    type="button"
                    disabled={!voice.supported}
                    onClick={() => {
                      if (voice.isListening) voice.stopListening();
                      else voice.startListening();
                    }}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                      voice.supported
                        ? voice.isListening
                          ? "bg-accent text-[var(--coach-bg)] shadow-[0_0_0_3px_rgba(255,255,255,0.12)]"
                          : "bg-white/[0.08] text-foreground hover:bg-white/[0.12]"
                        : "cursor-not-allowed bg-white/[0.04] text-muted-2"
                    }`}
                    aria-pressed={voice.isListening}
                    aria-label={t("workout.voice.pushToTalkHint")}
                    title={
                      voice.supported
                        ? t("workout.voice.pushToTalkHint")
                        : t("workout.voice.unsupported")
                    }
                  >
                    <MicIcon className="h-[22px] w-[22px]" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-snug text-foreground">
                      {stripText}
                    </p>
                    {voice.lastRawTranscript.trim() ? (
                      <p className="mt-0.5 truncate text-[11px] text-muted-2">
                        {voice.lastRawTranscript}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {!showVoiceWorkout || voice.supported ? null : (
                <p className="text-[12px] text-muted-2">
                  {t("workout.voice.unsupported")}
                </p>
              )}
              <HelpVideoCard
                pageId="workout"
                enabled={showHelpVideos}
                className="opacity-90"
              />
              {dataFallbackKey ? (
                <p className="text-[11px] leading-relaxed text-muted-2" role="status">
                  {t(dataFallbackKey)}
                </p>
              ) : null}
              <CoachAppShortcuts
                compact
                omit={["/workout"]}
                eyebrowKey="workout.afterSessionHint"
                className="mt-0"
              />
            </div>
          </details>
        ) : (
          <p className="mt-6 text-[13px] leading-relaxed text-muted" role="status">
            {t("fallback.trendClearerWithData")}
          </p>
        )}

        {customizeOpen && onSessionModeChange ? (
          <div
            role="presentation"
            className="fixed inset-0 z-[210] flex items-end justify-center bg-black/65 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 sm:items-center"
            onClick={() => setCustomizeOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setCustomizeOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="customize-sheet-title"
              className="w-full max-w-md rounded-t-[var(--radius-2xl)] border border-border/80 bg-card p-5 shadow-[var(--shadow-float)] sm:rounded-[var(--radius-xl)]"
              onClick={(e) => e.stopPropagation()}
            >
              <p
                id="customize-sheet-title"
                className="text-[15px] font-semibold leading-snug text-foreground"
              >
                {t("workout.smart.sheetTitle")}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-muted-2">
                {t("workout.smart.sheetLead")}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {enableExerciseSwap && onSwapExercise ? (
                  <button
                    type="button"
                    onClick={() => {
                      logButtonClick("WorkoutView", "customizeSwap");
                      openSwapFromCustomize();
                    }}
                    className="flex min-h-[48px] w-full items-center rounded-[var(--radius-lg)] border border-border/70 bg-white/[0.04] px-4 py-3 text-left text-[14px] font-semibold text-foreground transition hover:border-accent/35"
                  >
                    {t("workout.smart.actionSwap")}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    onSessionModeChange("quick");
                    setCustomizeOpen(false);
                    setConfirmFlash(t("workout.smart.quickConfirm"));
                    window.setTimeout(() => setConfirmFlash(null), 2200);
                    logButtonClick("WorkoutView", "customizeQuick");
                  }}
                  className="flex min-h-[48px] w-full items-center rounded-[var(--radius-lg)] border border-border/70 bg-white/[0.04] px-4 py-3 text-left text-[14px] font-semibold text-foreground transition hover:border-accent/35"
                >
                  {t("workout.smart.actionQuick")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSessionModeChange("no_equipment");
                    setCustomizeOpen(false);
                    setConfirmFlash(t("workout.smart.noEquipmentConfirm"));
                    window.setTimeout(() => setConfirmFlash(null), 2200);
                    logButtonClick("WorkoutView", "customizeNoEq");
                  }}
                  className="flex min-h-[48px] w-full items-center rounded-[var(--radius-lg)] border border-border/70 bg-white/[0.04] px-4 py-3 text-left text-[14px] font-semibold text-foreground transition hover:border-accent/35"
                >
                  {t("workout.smart.actionNoEquipment")}
                </button>
                {sessionMode !== "normal" ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSessionModeChange("normal");
                      setCustomizeOpen(false);
                      logButtonClick("WorkoutView", "customizeRestore");
                    }}
                    className="mt-1 min-h-[44px] w-full rounded-[var(--radius-lg)] px-4 text-[13px] font-semibold text-muted transition hover:text-foreground"
                  >
                    {t("workout.smart.restoreNormal")}
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setCustomizeOpen(false)}
                className="mt-4 min-h-[44px] w-full rounded-[var(--radius-lg)] px-4 text-[13px] font-semibold text-muted-2 hover:text-foreground"
              >
                {t("food.cancel")}
              </button>
            </div>
          </div>
        ) : null}

        {swapModalOpen && modalSwapSourceId && onSwapExercise ? (
          <div
            role="presentation"
            className="fixed inset-0 z-[220] flex items-end justify-center bg-black/65 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 sm:items-center"
            onClick={closeSwapModal}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeSwapModal();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="swap-ex-title"
              className="w-full max-w-md rounded-t-[var(--radius-2xl)] border border-border/80 bg-card p-5 shadow-[var(--shadow-float)] sm:rounded-[var(--radius-xl)]"
              onClick={(e) => e.stopPropagation()}
            >
              <p
                id="swap-ex-title"
                className="text-[15px] font-semibold leading-snug text-foreground"
              >
                {t("workout.swapExercise")}
              </p>
              <p className="mt-2 text-[13px] leading-snug text-muted">
                {t("workout.smart.swapLead")}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-muted-2">
                {t("workout.smart.swapFocusLine")}
              </p>
              {modalCategoryKey ? (
                <p className="mt-2 text-[12px] font-medium text-accent/90">
                  {t(modalCategoryKey)}
                </p>
              ) : null}
              <p className="mt-2 text-[11px] leading-snug text-muted-2">
                {t("workout.swapSameCategoryOnly")}
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
                  <input
                    type="radio"
                    name="swap-scope"
                    className="accent-accent"
                    checked={swapScope === "session"}
                    onChange={() => setSwapScope("session")}
                  />
                  {t("workout.smart.swapScopeSession")}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
                  <input
                    type="radio"
                    name="swap-scope"
                    className="accent-accent"
                    checked={swapScope === "profile"}
                    onChange={() => setSwapScope("profile")}
                  />
                  {t("workout.smart.swapScopeProfile")}
                </label>
              </div>
              <ul className="mt-4 max-h-[40vh] space-y-2 overflow-y-auto">
                {modalSwapOptions.length === 0 ? (
                  <li className="text-[13px] text-muted">
                    {t("workout.smart.noSwapOptions")}
                  </li>
                ) : (
                  modalSwapOptions.map((opt) => {
                    const label = locale === "en" ? opt.nameEn : opt.nameFi;
                    const isCurrent = opt.id === modalRow?.id;
                    return (
                      <li key={opt.id}>
                        <button
                          type="button"
                          disabled={isCurrent}
                          onClick={() => {
                            onSwapExercise(modalSwapSourceId, opt.id, swapScope);
                            closeSwapModal();
                          }}
                          className={`flex min-h-[48px] w-full items-center rounded-[var(--radius-lg)] border px-4 py-3 text-left text-[14px] font-semibold transition ${
                            isCurrent
                              ? "border-accent/40 bg-accent/10 text-foreground"
                              : "border-border/70 bg-white/[0.04] text-foreground hover:border-accent/35"
                          }`}
                        >
                          {label}
                          {isCurrent ? (
                            <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                              {t("workout.swapCurrent")}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
              {modalRow?.canonicalExerciseId &&
              modalRow.id !== modalRow.canonicalExerciseId ? (
                <button
                  type="button"
                  onClick={() => {
                    onSwapExercise(
                      modalRow.canonicalExerciseId!,
                      null,
                      swapScope,
                    );
                    closeSwapModal();
                  }}
                  className="mt-4 min-h-[48px] w-full rounded-[var(--radius-lg)] border border-border/80 px-4 text-[13px] font-semibold text-muted transition hover:border-accent/35 hover:text-foreground"
                >
                  {t("workout.swapReset")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={closeSwapModal}
                className="mt-3 min-h-[44px] w-full rounded-[var(--radius-lg)] px-4 text-[13px] font-semibold text-muted-2 hover:text-foreground"
              >
                {t("food.cancel")}
              </button>
            </div>
          </div>
        ) : null}
      </Container>
    </main>
  );
}
