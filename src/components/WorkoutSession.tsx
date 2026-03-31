"use client";

import { HelpVideoCard } from "@/components/ui/HelpVideoCard";
import { WorkoutView, type WorkoutViewExercise } from "@/components/WorkoutView";
import { useTranslation } from "@/hooks/useTranslation";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useClientProfile } from "@/hooks/useClientProfile";
import { getCoachFeatureToggles } from "@/lib/coachFeatureToggles";
import { workoutDataFallbackKey } from "@/lib/dataConfidence";
import type { MessageKey } from "@/lib/i18n";
import { getMondayBasedIndex } from "@/lib/plan";
import { normalizeProgramPackageId } from "@/lib/programPackages";
import { effectiveTrainingLevel } from "@/lib/profileTraining";
import { generateWorkoutDay } from "@/lib/training/generator";
import { computeStreakSummary } from "@/lib/streaks";
import type { ProExercise } from "@/types/pro";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function mapProToView(exercises: ProExercise[]): WorkoutViewExercise[] {
  return exercises.map((ex) => {
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
      name: ex.name,
      target: ex.target,
      sets,
      videoUrl: ex.videoUrl,
      videoPoster: ex.videoPoster,
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

  useEffect(() => {
    if (profile === undefined) return;
    if (!profile) {
      router.replace("/start");
    }
  }, [profile, router]);

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

  const generated = useMemo(() => {
    if (!profile) return null;
    const dayIndex = getMondayBasedIndex(now);
    return generateWorkoutDay({
      package: normalizeProgramPackageId(profile.selectedPackageId),
      goal: profile.goal,
      level: profile.level,
      dayIndex,
      locale,
      trainingLevel: effectiveTrainingLevel(profile),
      limitations: profile.limitations,
      coachMode: profile.mode ?? "guided",
      programBlueprintId: profile.programBlueprintId,
      sourceProfile: profile,
    });
  }, [profile, now, locale]);

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
    return (
      <main className="coach-page pb-10">
        <div className="mx-auto max-w-[var(--container-phone)] px-5 pt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-2">
            {t("workout.eyebrow")}
          </p>
          <h1 className="mt-4 text-[1.65rem] font-semibold leading-tight tracking-[-0.035em] text-foreground">
            {t("workout.restTitle")}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            {generated.workout}
          </p>
          <p className="mt-3 text-[14px] font-medium leading-snug text-foreground/90">
            {t("workout.restHint")}
          </p>
          <HelpVideoCard
            pageId="workout"
            enabled={features.showHelpVideos}
            className="mt-8 max-w-md"
          />
          <Link
            href="/app"
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

  const exercises = mapProToView(generated.exercises);

  return (
    <WorkoutView
      exercises={exercises}
      sessionSummary={generated.workout}
      dataFallbackKey={dataFallbackKey}
      showVoiceWorkout={features.showVoiceWorkout}
      showHelpVideos={features.showHelpVideos}
    />
  );
}
