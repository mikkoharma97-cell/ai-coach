"use client";

import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { Container } from "@/components/ui/Container";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useTranslation } from "@/hooks/useTranslation";
import { buildTodayWorkoutForUi, normalizeProfileForEngine } from "@/lib/coach";
import { isFoodOnlyMode } from "@/lib/appUsageMode";
import { trackEvent } from "@/lib/analytics";
import { countDaysMarkedDoneTotal, setDayMarkedDone } from "@/lib/storage";
import type { ProExercise } from "@/types/pro";
import type { GeneratedWorkoutDay } from "@/lib/training/generator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

const MAX_MOVES = 6;

function pickBlocks(exercises: ProExercise[]): ProExercise[] {
  if (exercises.length <= MAX_MOVES) return exercises;
  return exercises.slice(0, MAX_MOVES);
}

export function WorkoutSessionView() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());
  const [submitting, setSubmitting] = useState(false);

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
      router.push("/app");
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
            className="min-h-[44px] py-2 text-[14px] font-medium text-muted transition hover:text-foreground"
          >
            {t("workout.backToday")}
          </Link>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          <h1 className="text-balance text-[1.3125rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {isRest
              ? t("workout.restTitle")
              : generated.todayKicker.trim() || generated.durationLabel}
          </h1>
          {!isRest && generated.durationLabel ? (
            <p className="mt-1.5 text-[12px] font-medium text-muted-2">
              {generated.durationLabel}
            </p>
          ) : null}
          <p className="mt-3 line-clamp-4 text-[15px] leading-snug text-muted">
            {generated.workout}
          </p>

          {!isRest && blocks.length > 0 ? (
            <ol className="mt-6 space-y-0 divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {blocks.map((ex, i) => (
                <li
                  key={`${ex.id}-${i}`}
                  className="py-3 first:pt-0 last:pb-0"
                >
                  <p className="text-[15px] font-semibold leading-snug text-foreground">
                    {ex.name}
                  </p>
                  <p className="mt-1 text-[13px] leading-snug text-muted">
                    {locale === "en"
                      ? ex.prescriptionLineEn || ex.target
                      : ex.prescriptionLineFi || ex.target}
                  </p>
                </li>
              ))}
            </ol>
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
