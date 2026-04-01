"use client";

import { NutritionContentPreviewSheet } from "@/components/nutrition/NutritionContentPreviewSheet";
import { NutritionRecommendationCard } from "@/components/nutrition/NutritionRecommendationCard";
import { Container } from "@/components/ui/Container";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useTranslation } from "@/hooks/useTranslation";
import { useClientProfile } from "@/hooks/useClientProfile";
import {
  NUTRITION_LIBRARY,
  applyNutritionLibraryEntry,
  listNutritionCoachingCore,
  NUTRITION_COACHING_CORE_IDS,
} from "@/lib/nutritionLibrary";
import type { Goal } from "@/types/coach";
import { useOverlayLayer } from "@/hooks/useOverlayLayer";
import { useCallback, useMemo, useState } from "react";
import { saveProfile } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function NutritionPlansPage() {
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const router = useRouter();
  const [goalFilter, setGoalFilter] = useState<Goal | "all">("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const closeNutritionOverlays = useCallback(() => {
    setConfirmId(null);
    setPreviewId(null);
  }, []);
  useOverlayLayer(confirmId != null || previewId != null, closeNutritionOverlays);

  const pool = useMemo(() => {
    if (!profile) return NUTRITION_LIBRARY;
    const g = goalFilter === "all" ? profile.goal : goalFilter;
    return NUTRITION_LIBRARY.filter(
      (e) => e.goal === "any" || e.goal === g,
    );
  }, [profile, goalFilter]);

  const coachingCore = useMemo(() => {
    if (!profile) return [];
    return listNutritionCoachingCore(
      goalFilter === "all" ? profile.goal : goalFilter,
    );
  }, [profile, goalFilter]);

  const poolRest = useMemo(
    () => pool.filter((e) => !NUTRITION_COACHING_CORE_IDS.includes(e.id)),
    [pool],
  );

  const previewEntry = useMemo(
    () => (previewId ? NUTRITION_LIBRARY.find((e) => e.id === previewId) : undefined),
    [previewId],
  );

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
          {t("nutritionPlans.selectCoachingTitle")}
        </h1>
        <p className="mt-2 text-[14px] text-muted">{t("nutritionPlans.browseHintCore")}</p>

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
          {coachingCore.map((e) => (
            <NutritionRecommendationCard
              key={e.id}
              entry={e}
              showMeta
              onPreview={() => setPreviewId(e.id)}
              onSelect={() => setConfirmId(e.id)}
            />
          ))}
        </div>

        {poolRest.length > 0 ? (
          <details className="coach-panel-subtle group mt-10">
            <summary className="cursor-pointer list-none py-3 text-[13px] font-medium text-muted marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                <span>{t("nutritionPlans.moreStructures")}</span>
                <span className="text-[11px] font-normal text-muted-2 group-open:hidden">
                  {t("common.show")}
                </span>
                <span className="hidden text-[11px] font-normal text-muted-2 group-open:inline">
                  {t("common.hide")}
                </span>
              </span>
            </summary>
            <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
              {poolRest.map((e) => (
                <NutritionRecommendationCard
                  key={e.id}
                  entry={e}
                  showMeta
                  onPreview={() => setPreviewId(e.id)}
                  onSelect={() => setConfirmId(e.id)}
                />
              ))}
            </div>
          </details>
        ) : null}
      </Container>

      {previewEntry ? (
        <NutritionContentPreviewSheet
          entry={previewEntry}
          onClose={() => setPreviewId(null)}
        />
      ) : null}

      {confirmId ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[280] flex items-end justify-center bg-black/60 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top,0px)+2rem)] sm:items-center"
          onClick={() => setConfirmId(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setConfirmId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-t-[var(--radius-2xl)] border border-border/80 bg-card p-6 shadow-[var(--shadow-float)] sm:rounded-[var(--radius-xl)]"
            onClick={(e) => e.stopPropagation()}
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
