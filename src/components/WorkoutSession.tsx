"use client";

import { HelpVideoCard } from "@/components/ui/HelpVideoCard";
import { WorkoutView, type WorkoutViewExercise } from "@/components/WorkoutView";
import { useTranslation } from "@/hooks/useTranslation";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useClientProfile } from "@/hooks/useClientProfile";
import {
  buildCoachProgramDecision,
  buildWorkoutCoachLine,
  normalizeProfileForEngine,
} from "@/lib/coach";
import { getCoachFeatureToggles } from "@/lib/coachFeatureToggles";
import { workoutDataFallbackKey } from "@/lib/dataConfidence";
import type { MessageKey } from "@/lib/i18n";
import { getMondayBasedIndex } from "@/lib/plan";
import { normalizeProgramPackageId } from "@/lib/programPackages";
import { effectiveTrainingLevel } from "@/lib/profileTraining";
import { generateWorkoutDay } from "@/lib/training/generator";
import {
  applyExerciseOverridesToProExercises,
} from "@/lib/training/exerciseOverrides";
import { mapExercisesToNoEquipment } from "@/lib/training/noEquipmentFallback";
import { pickQuickGymExercises } from "@/lib/training/quickGymEngine";
import { loadProfile, saveProfile } from "@/lib/storage";
import { isFoodOnlyMode } from "@/lib/appUsageMode";
import { getWorkShiftForDate, WORK_SHIFTS_CHANGED } from "@/lib/workShiftStorage";
import { exercisePerformanceHints } from "@/lib/coach/coaching-engine";
import { flowLog } from "@/lib/flowLog";
import { computeStreakSummary } from "@/lib/streaks";
import type { ProExercise } from "@/types/pro";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  WorkoutSessionCompletionType,
  WorkoutSessionMode,
} from "@/types/adaptiveCoaching";

function mapProToView(
  exercises: ProExercise[],
  canonicalIds: string[],
): WorkoutViewExercise[] {
  return exercises.map((ex, idx) => {
    const n = Math.max(1, ex.sets);
    const effort = ex.effort?.trim();
    const rpe =
      effort && /\d/.test(effort)
        ? effort.replace(/^RPE\s*/i, "").trim()
        : undefined;
    const sets = Array.from({ length: n }, () => ({
      reps: ex.reps,
      rpe,
    }));
    return {
      id: ex.id,
      canonicalExerciseId: canonicalIds[idx],
      name: ex.name,
      target: ex.target,
      sets,
      videoUrl: ex.videoUrl,
      videoPoster: ex.videoPoster,
      restLine: ex.rest,
      prescriptionLineFi: ex.prescriptionLineFi,
      prescriptionLineEn: ex.prescriptionLineEn,
      coachTipFi: ex.coachTipFi,
      coachTipEn: ex.coachTipEn,
      coachMistakeFi: ex.coachMistakeFi,
      coachMistakeEn: ex.coachMistakeEn,
      coachFocusFi: ex.coachFocusFi,
      coachFocusEn: ex.coachFocusEn,
    };
  });
}

export function WorkoutSession() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());
  const [shiftTick, setShiftTick] = useState(0);
  const [sessionMode, setSessionMode] = useState<WorkoutSessionMode>("normal");
  const [sessionExerciseOverrides, setSessionExerciseOverrides] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const b = () => setShiftTick((x) => x + 1);
    window.addEventListener(WORK_SHIFTS_CHANGED, b);
    return () => window.removeEventListener(WORK_SHIFTS_CHANGED, b);
  }, []);

  const streaks = useMemo(
    () => (profile ? computeStreakSummary(profile, now) : null),
    [profile, now],
  );

  const dataFallbackKey = useMemo((): MessageKey | null => {
    if (!streaks) return null;
    return workoutDataFallbackKey(streaks.combined);
  }, [streaks]);

  const features = useMemo(
    () => getCoachFeatureToggles(profile ?? null),
    [profile],
  );

  const normalizedProfile = useMemo(
    () => (profile ? normalizeProfileForEngine(profile) : null),
    [profile],
  );

  const workoutCoachLine = useMemo(() => {
    if (!normalizedProfile) return null;
    const d = buildCoachProgramDecision(normalizedProfile);
    return buildWorkoutCoachLine(locale, d);
  }, [normalizedProfile, locale]);

  const shiftSupplementLine = useMemo(() => {
    const e = getWorkShiftForDate(now);
    if (!e) return null;
    return t(`shift.ws.${e.shiftType}` as MessageKey);
  }, [now, shiftTick, t]);

  const coachFrameWithShift = useMemo(() => {
    const parts = [workoutCoachLine, shiftSupplementLine].filter(Boolean);
    return parts.length ? parts.join("\n\n") : null;
  }, [workoutCoachLine, shiftSupplementLine]);

  const generated = useMemo(() => {
    if (!normalizedProfile) return null;
    const dayIndex = getMondayBasedIndex(now);
    return generateWorkoutDay({
      package: normalizeProgramPackageId(normalizedProfile.selectedPackageId),
      goal: normalizedProfile.goal,
      level: normalizedProfile.level,
      dayIndex,
      locale,
      trainingLevel: effectiveTrainingLevel(normalizedProfile),
      limitations: normalizedProfile.limitations,
      coachMode: normalizedProfile.mode ?? "guided",
      programBlueprintId: normalizedProfile.programBlueprintId,
      sourceProfile: normalizedProfile,
    });
  }, [normalizedProfile, now, locale]);

  const mergedExerciseOverrides = useMemo(() => {
    return {
      ...(normalizedProfile?.exerciseIdOverrides ?? {}),
      ...sessionExerciseOverrides,
    };
  }, [normalizedProfile?.exerciseIdOverrides, sessionExerciseOverrides]);

  const exercisesResolved = useMemo(() => {
    if (!generated || !normalizedProfile) return null;
    const raw = generated.exercises;
    const rawCanon = raw.map((e) => e.id);
    const withOv = applyExerciseOverridesToProExercises(
      raw,
      mergedExerciseOverrides,
      locale,
    );
    if (sessionMode === "normal") {
      return { raw, withOv, canonicalIds: rawCanon };
    }
    if (sessionMode === "quick") {
      const q = pickQuickGymExercises(withOv, rawCanon);
      return { raw, withOv: q.exercises, canonicalIds: q.canonicalIds };
    }
    const n = mapExercisesToNoEquipment(withOv, rawCanon, locale);
    if (n.exercises.length === 0) {
      return { raw, withOv, canonicalIds: rawCanon };
    }
    return { raw, withOv: n.exercises, canonicalIds: n.canonicalIds };
  }, [generated, normalizedProfile, locale, mergedExerciseOverrides, sessionMode]);

  const perfHintsForView = useMemo(() => {
    if (!exercisesResolved || exercisesResolved.withOv.length === 0) return [];
    const loc = locale === "en" ? "en" : "fi";
    return exercisePerformanceHints(
      exercisesResolved.withOv.map((e) => e.id),
      loc,
    ).map((h) => ({
      exerciseId: h.exerciseId,
      line: loc === "en" ? h.lineEn : h.lineFi,
    }));
  }, [exercisesResolved, locale]);

  const onSwapExercise = useCallback(
    (
      canonicalId: string,
      targetId: string | null,
      scope: "session" | "profile",
    ) => {
      if (scope === "session") {
        setSessionExerciseOverrides((prev) => {
          const next = { ...prev };
          if (targetId == null) delete next[canonicalId];
          else next[canonicalId] = targetId;
          return next;
        });
        return;
      }
      const p = loadProfile();
      if (!p) return;
      const base = { ...(p.exerciseIdOverrides ?? {}) };
      if (targetId == null) delete base[canonicalId];
      else base[canonicalId] = targetId;
      saveProfile({ ...p, exerciseIdOverrides: base });
      setSessionExerciseOverrides((prev) => {
        const next = { ...prev };
        delete next[canonicalId];
        return next;
      });
      router.refresh();
    },
    [router],
  );

  const logMeta = useMemo(() => {
    const volumeModifier =
      sessionMode === "quick"
        ? 0.65
        : sessionMode === "no_equipment"
          ? 0.75
          : 1;
    let usedExerciseSwaps = false;
    if (exercisesResolved) {
      const { withOv, canonicalIds } = exercisesResolved;
      usedExerciseSwaps = withOv.some((ex, i) => {
        const canon = canonicalIds[i];
        return Boolean(canon && ex.id !== canon);
      });
    }
    const completionType: WorkoutSessionCompletionType =
      sessionMode !== "normal" || usedExerciseSwaps ? "modified" : "full";
    return {
      sessionMode,
      usedExerciseSwaps,
      completionType,
      volumeModifier,
    };
  }, [sessionMode, exercisesResolved]);

  useEffect(() => {
    if (!generated) return;
    flowLog("workout.session", {
      rest: generated.isRestDay,
      exercises: generated.exercises.length,
    });
  }, [generated]);

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
        <div className="mx-auto max-w-[var(--container-phone)] px-5 pt-8">
          <h1 className="text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {t("foodOnly.workoutTitle")}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            {t("foodOnly.workoutBody")}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/food"
              className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-lg)] bg-accent px-4 text-[15px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)]"
            >
              {t("foodOnly.workoutGoFood")}
            </Link>
            <Link
              href="/more"
              className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-accent underline-offset-[3px] hover:underline"
            >
              {t("nav.more")}
            </Link>
            <Link
              href="/app"
              scroll={false}
              className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-muted underline-offset-[3px] hover:text-foreground hover:underline"
            >
              {t("workout.backToday")}
            </Link>
          </div>
        </div>
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

  const isRest =
    generated.isRestDay ||
    generated.exercises.length === 0;

  if (isRest) {
    const proMode = profile.mode === "pro";
    return (
      <main className="coach-page pb-10">
        <div className="mx-auto max-w-[var(--container-phone)] px-5 pt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-2">
            {t("workout.eyebrow")}
          </p>
          {!proMode ? (
            <p className="brand-identity-lead mt-3 max-w-[26rem] text-balance">
              {t("brand.identityLine")}
            </p>
          ) : null}
          <h1
            className={`text-[1.65rem] font-semibold leading-tight tracking-[-0.035em] text-foreground ${proMode ? "mt-3" : "mt-4"}`}
          >
            {t("workout.restTitle")}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            {generated.workout}
          </p>
          {!proMode && coachFrameWithShift ? (
            <p className="mt-3 text-[12px] font-semibold leading-snug text-muted">
              {coachFrameWithShift}
            </p>
          ) : null}
          {!proMode ? (
            <p className="mt-3 text-[14px] font-medium leading-snug text-foreground/90">
              {t("workout.restHint")}
            </p>
          ) : null}
          <HelpVideoCard
            pageId="workout"
            enabled={features.showHelpVideos}
            className="mt-8 max-w-md"
          />
          <Link
            href="/app"
            scroll={false}
            className="mt-6 inline-flex min-h-[48px] items-center text-[15px] font-semibold text-accent underline-offset-[3px] hover:underline"
          >
            {t("workout.backToday")}
          </Link>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
            <Link
              href="/progress"
              className="font-semibold text-accent underline-offset-[3px] hover:underline"
            >
              {t("nav.progress")}
            </Link>
            <Link
              href="/review"
              className="font-semibold text-accent underline-offset-[3px] hover:underline"
            >
              {t("nav.review")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const exercises =
    exercisesResolved != null
      ? mapProToView(exercisesResolved.withOv, exercisesResolved.canonicalIds)
      : [];

  const proMode = profile.mode === "pro";

  return (
    <WorkoutView
      exercises={exercises}
      dataFallbackKey={dataFallbackKey}
      showVoiceWorkout={features.showVoiceWorkout}
      showHelpVideos={features.showHelpVideos}
      exercisePerformanceHints={proMode ? [] : perfHintsForView}
      enableExerciseSwap={!isFoodOnlyMode(profile)}
      onSwapExercise={onSwapExercise}
      sessionMode={sessionMode}
      onSessionModeChange={setSessionMode}
      sessionLogMeta={logMeta}
    />
  );
}
