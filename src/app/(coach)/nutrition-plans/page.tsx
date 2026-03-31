"use client";

import { NutritionRecommendationCard } from "@/components/nutrition/NutritionRecommendationCard";
import { Container } from "@/components/ui/Container";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useTranslation } from "@/hooks/useTranslation";
import { useClientProfile } from "@/hooks/useClientProfile";
import {
  NUTRITION_LIBRARY,
  applyNutritionLibraryEntry,
} from "@/lib/nutritionLibrary";
import type { Goal } from "@/types/coach";
import { useMemo, useState } from "react";
import { saveProfile } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function NutritionPlansPage() {
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const router = useRouter();
  const [goalFilter, setGoalFilter] = useState<Goal | "all">("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const pool = useMemo(() => {
    if (!profile) return NUTRITION_LIBRARY;
    const g = goalFilter === "all" ? profile.goal : goalFilter;
    return NUTRITION_LIBRARY.filter(
      (e) => e.goal === "any" || e.goal === g,
    );
  }, [profile, goalFilter]);

  if (profile === undefined) {
    return (
      <main className="coach-page flex min-h-[40vh] items-center justify-center text-muted-2">
        {t("common.loading")}
      </main>
    );
  }
  if (!profile) return <CoachProfileMissingFallback />;

  return (
    <main className="coach-page">
      <Container size="phone" className="px-5 py-8">
        <h1 className="text-[1.375rem] font-semibold tracking-[-0.03em] text-foreground">
          {t("nutritionPlans.title")}
        </h1>
        <p className="mt-2 text-[14px] text-muted">{t("nutritionPlans.browseHint")}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["all", "lose_weight", "build_muscle", "improve_fitness"] as const).map(
            (g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoalFilter(g)}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
                  goalFilter === g
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border/80 text-muted"
                }`}
              >
                {g === "all"
                  ? locale === "fi"
                    ? "Oma tavoite"
                    : "My goal"
                  : g === "lose_weight"
                    ? t("onboarding.goalLose")
                    : g === "build_muscle"
                      ? t("onboarding.goalMuscle")
                      : t("onboarding.goalFitness")}
              </button>
            ),
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {pool.map((e) => (
            <NutritionRecommendationCard
              key={e.id}
              entry={e}
              showMeta
              onSelect={() => setConfirmId(e.id)}
            />
          ))}
        </div>
      </Container>

      {confirmId ? (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-12 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-t-[var(--radius-2xl)] border border-border/80 bg-card p-6 shadow-[var(--shadow-float)] sm:rounded-[var(--radius-xl)]"
          >
            <p className="text-[16px] font-semibold text-foreground">
              {t("nutritionChange.confirmTitle")}
            </p>
            <p className="mt-2 text-[14px] text-muted">
              {t("nutritionChange.confirmBody")}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="min-h-[48px] flex-1 rounded-[var(--radius-lg)] border border-border"
                onClick={() => setConfirmId(null)}
              >
                {t("food.cancel")}
              </button>
              <button
                type="button"
                className="min-h-[48px] flex-[1.2] rounded-[var(--radius-lg)] bg-accent px-4 text-[15px] font-semibold text-white"
                onClick={() => {
                  const patch = applyNutritionLibraryEntry(confirmId);
                  saveProfile({ ...profile, ...patch });
                  setConfirmId(null);
                  router.refresh();
                }}
              >
                {t("onboarding.continue")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
