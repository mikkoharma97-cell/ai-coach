"use client";

import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { Container } from "@/components/ui/Container";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useTranslation } from "@/hooks/useTranslation";
import { buildTodayWorkoutForUi, normalizeProfileForEngine } from "@/lib/coach";
import { isFoodOnlyMode } from "@/lib/appUsageMode";
import { trackEvent } from "@/lib/analytics";
import { countDaysMarkedDoneTotal, setDayMarkedDone } from "@/lib/storage";
import type { ProExercise, ProExerciseAlternative } from "@/types/pro";
import type { GeneratedWorkoutDay } from "@/lib/training/generator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useMemo, useState } from "react";

const MAX_MOVES = 6;

function pickBlocks(exercises: ProExercise[]): ProExercise[] {
  if (exercises.length <= MAX_MOVES) return exercises;
  return exercises.slice(0, MAX_MOVES);
}

type ExerciseLog = { done: boolean; kg: string; reps: string };

export function WorkoutSessionView() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());
  const [submitting, setSubmitting] = useState(false);
  const [logs, setLogs] = useState<Record<string, ExerciseLog>>({});
  const [replaceForKey, setReplaceForKey] = useState<string | null>(null);
  const [cueForKey, setCueForKey] = useState<string | null>(null);
  const modalTitleId = useId();

  const normalized = useMemo(
    () => (profile ? normalizeProfileForEngine(profile) : null),
    [profile],
  );

  const generated = useMemo((): GeneratedWorkoutDay | null => {
    if (!normalized) return null;
    return buildTodayWorkoutForUi({
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

  const setLog = useCallback((key: string, patch: Partial<ExerciseLog>) => {
    setLogs((prev) => ({
      ...prev,
      [key]: {
        done: prev[key]?.done ?? false,
        kg: prev[key]?.kg ?? "",
        reps: prev[key]?.reps ?? "",
        ...patch,
      },
    }));
  }, []);

  const replaceAlternatives = useMemo((): ProExerciseAlternative[] => {
    if (!replaceForKey) return [];
    const ex = blocks.find((b, i) => rowKey(b, i) === replaceForKey);
    if (!ex) return [];
    if (ex.alternatives?.length) return ex.alternatives;
    return [
      {
        id: "ph-a",
        name: locale === "en" ? "Similar movement pattern" : "Vastaava liikekuvio",
        reasonFi: "Sama tavoite, eri väline.",
        reasonEn: "Same intent, different tool.",
      },
      {
        id: "ph-b",
        name: locale === "en" ? "Machine / guided option" : "Laite / ohjattu",
        reasonFi: "Tukevampi rata.",
        reasonEn: "More stable path.",
      },
    ];
  }, [replaceForKey, blocks, rowKey, locale]);

  const isRest =
    !generated ||
    generated.isRestDay ||
    generated.exercises.length === 0;

  const onMarkDone = useCallback(() => {
    if (submitting) return;
    setSubmitting(true);
    try {
      setDayMarkedDone(true, now);
      const doneDays = countDaysMarkedDoneTotal();
      if (doneDays === 1) trackEvent("day1_complete");
      if (doneDays === 2) trackEvent("day2_complete");
      router.push("/app", { scroll: false });
    } catch (e) {
      console.warn("[WorkoutSessionView] mark done failed", e);
      setSubmitting(false);
    }
  }, [now, router, submitting]);

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

  if (isFoodOnlyMode(profile)) {
    return (
      <main className="coach-page pb-10">
        <Container size="phone" className="px-5 pt-8">
          <h1 className="text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {t("foodOnly.workoutTitle")}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            {t("foodOnly.workoutBody")}
          </p>
          <Link
            href="/food"
            className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-lg)] bg-accent px-4 text-[15px] font-semibold text-white shadow-[var(--shadow-primary-cta)]"
          >
            {t("foodOnly.workoutGoFood")}
          </Link>
        </Container>
      </main>
    );
  }

  if (!generated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[15px] text-muted-2">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <main className="coach-page">
      <Container
        size="phone"
        className="flex min-h-[100dvh] flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3">
          <Link
            href="/app"
            scroll={false}
            className="min-h-[44px] py-2 text-[14px] font-medium text-muted transition hover:text-foreground"
          >
            {t("workout.backToday")}
          </Link>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          <h1 className="text-balance text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {isRest ? t("workout.restTitle") : t("workout.todayHeadline")}
          </h1>
          {!isRest && generated.durationLabel ? (
            <p className="mt-1.5 text-[13px] font-medium text-muted-2">
              {generated.durationLabel}
            </p>
          ) : null}

          {!isRest && blocks.length > 0 ? (
            <ol className="mt-6 space-y-0 divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {blocks.map((ex, i) => {
                const k = rowKey(ex, i);
                const log = logs[k];
                return (
                  <li key={k} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <label className="mt-0.5 flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={log?.done ?? false}
                          onChange={(e) =>
                            setLog(k, { done: e.target.checked })
                          }
                          className="h-[22px] w-[22px] shrink-0 rounded border border-white/25 bg-background accent-accent"
                        />
                        <span className="sr-only">{t("workoutSession.srDone")}</span>
                      </label>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold leading-snug text-foreground">
                          {ex.name}
                        </p>
                        <p className="mt-1 text-[13px] leading-snug text-muted">
                          {locale === "en"
                            ? ex.prescriptionLineEn || ex.target
                            : ex.prescriptionLineFi || ex.target}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder={t("workoutSession.placeholderKg")}
                            value={log?.kg ?? ""}
                            onChange={(e) =>
                              setLog(k, { kg: e.target.value })
                            }
                            className="h-10 min-w-[5.5rem] rounded-[var(--radius-md)] border border-white/[0.12] bg-background/80 px-3 text-[15px] text-foreground placeholder:text-muted-2"
                            aria-label={t("workoutSession.placeholderKg")}
                          />
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder={t("workoutSession.placeholderReps")}
                            value={log?.reps ?? ""}
                            onChange={(e) =>
                              setLog(k, { reps: e.target.value })
                            }
                            className="h-10 min-w-[5.5rem] rounded-[var(--radius-md)] border border-white/[0.12] bg-background/80 px-3 text-[15px] text-foreground placeholder:text-muted-2"
                            aria-label={t("workoutSession.placeholderReps")}
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setReplaceForKey(k)}
                            className="min-h-[40px] rounded-[var(--radius-md)] border border-white/[0.14] bg-white/[0.04] px-3 text-[13px] font-semibold text-foreground transition hover:border-accent/35 hover:bg-white/[0.07]"
                          >
                            {t("workoutSession.replaceMove")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCueForKey(k)}
                            className="min-h-[40px] rounded-[var(--radius-md)] border border-white/[0.14] bg-white/[0.04] px-3 text-[13px] font-semibold text-foreground transition hover:border-accent/35 hover:bg-white/[0.07]"
                          >
                            {t("workoutSession.showCue")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : null}

          {replaceForKey ? (
            <div
              className="fixed inset-0 z-[var(--z-overlay-backdrop)] flex items-center justify-center px-4 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
              role="dialog"
              aria-modal="true"
              aria-labelledby={modalTitleId}
            >
              <button
                type="button"
                tabIndex={-1}
                aria-label={t("common.close")}
                className="absolute inset-0 z-0 cursor-pointer border-0 bg-[color:var(--coach-modal-scrim)] p-0 backdrop-blur-md [touch-action:none]"
                onClick={() => setReplaceForKey(null)}
              />
              <div
                className="relative z-[var(--z-overlay-sheet)] max-h-[min(85dvh,90svh)] w-full max-w-md overflow-y-auto overscroll-contain rounded-[var(--radius-xl)] border border-[color:var(--coach-modal-panel-border)] bg-[color:var(--coach-modal-panel)] p-5 shadow-[var(--shadow-float)] [-webkit-overflow-scrolling:touch]"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <p
                  id={modalTitleId}
                  className="text-[16px] font-semibold text-foreground"
                >
                  {t("workoutSession.replaceTitle")}
                </p>
                <ul className="mt-4 space-y-2">
                  {replaceAlternatives.map((alt) => (
                    <li key={alt.id}>
                      <button
                        type="button"
                        className="flex w-full flex-col gap-0.5 rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-left text-[14px] font-medium text-foreground transition hover:border-accent/35"
                        onClick={() => setReplaceForKey(null)}
                      >
                        {alt.name}
                        <span className="text-[12px] font-normal text-muted">
                          {locale === "en" ? alt.reasonEn : alt.reasonFi}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setReplaceForKey(null)}
                  className="mt-4 w-full min-h-[48px] rounded-[var(--radius-lg)] border border-white/[0.14] bg-transparent text-[15px] font-semibold text-foreground"
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
          ) : null}

          {cueForKey ? (
            <div
              className="fixed inset-0 z-[var(--z-overlay-backdrop)] flex items-center justify-center px-4 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${modalTitleId}-cue`}
            >
              <button
                type="button"
                tabIndex={-1}
                aria-label={t("common.close")}
                className="absolute inset-0 z-0 cursor-pointer border-0 bg-[color:var(--coach-modal-scrim)] p-0 backdrop-blur-md [touch-action:none]"
                onClick={() => setCueForKey(null)}
              />
              <div
                className="relative z-[var(--z-overlay-sheet)] max-h-[min(85dvh,90svh)] w-full max-w-md overflow-y-auto overscroll-contain rounded-[var(--radius-xl)] border border-[color:var(--coach-modal-panel-border)] bg-[color:var(--coach-modal-panel)] p-5 shadow-[var(--shadow-float)] [-webkit-overflow-scrolling:touch]"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <p
                  id={`${modalTitleId}-cue`}
                  className="text-[16px] font-semibold text-foreground"
                >
                  {t("workoutSession.cueTitle")}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-muted">
                  {t("workoutSession.cuePlaceholder")}
                </p>
                <button
                  type="button"
                  onClick={() => setCueForKey(null)}
                  className="mt-6 flex h-[52px] w-full shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[16px] font-semibold text-white"
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-auto flex shrink-0 flex-col gap-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-8">
            <button
              type="button"
              onClick={onMarkDone}
              disabled={submitting}
              className="flex h-[56px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[17px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] disabled:opacity-60 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {submitting ? t("common.loading") : t("workoutSession.markDone")}
            </button>
          </div>
        </div>
      </Container>
    </main>
  );
}
