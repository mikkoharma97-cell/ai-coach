"use client";

import { ProgramContentPreviewSheet } from "@/components/programs/ProgramContentPreviewSheet";
import { ProgramRecommendationCard } from "@/components/programs/ProgramRecommendationCard";
import { Container } from "@/components/ui/Container";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useOverlayLayer } from "@/hooks/useOverlayLayer";
import { useTranslation } from "@/hooks/useTranslation";
import { useClientProfile } from "@/hooks/useClientProfile";
import {
  applyProgramLibraryEntry,
  listGymCoachingPrograms,
  recommendProgramForProfile,
} from "@/lib/coachProgramCatalog";
import type { Goal } from "@/types/coach";
import { useCallback, useMemo, useState } from "react";
import { saveProfile } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function PlansPage() {
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const router = useRouter();
  const [goalFilter, setGoalFilter] = useState<Goal | "all">("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [showAllPrograms, setShowAllPrograms] = useState(false);

  const closePlanOverlays = useCallback(() => {
    setConfirmId(null);
    setPreviewId(null);
  }, []);
  useOverlayLayer(confirmId != null || previewId != null, closePlanOverlays);

  const coachingPool = useMemo(() => {
    const g = goalFilter === "all" ? (profile?.goal ?? "improve_fitness") : goalFilter;
    return listGymCoachingPrograms(g);
  }, [profile?.goal, goalFilter]);

  const recommended = useMemo(() => {
    if (!profile || coachingPool.length === 0) return null;
    const rec = recommendProgramForProfile(profile);
    if (coachingPool.some((e) => e.id === rec.id)) return rec;
    return coachingPool[0] ?? null;
  }, [profile, coachingPool]);

  const restOfPool = useMemo(() => {
    if (!recommended) return coachingPool;
    return coachingPool.filter((e) => e.id !== recommended.id);
  }, [coachingPool, recommended]);

  const previewEntry = useMemo(
    () =>
      previewId ? coachingPool.find((e) => e.id === previewId) : undefined,
    [previewId, coachingPool],
  );

  /** Ei pitkää listaa — max 10 muuta, oletuksena 6 näkyvissä */
  const MAX_ALTERNATIVES = 10;
  const INITIAL_ALTERNATIVES = 6;

  const restOfPoolCapped = useMemo(
    () => restOfPool.slice(0, MAX_ALTERNATIVES),
    [restOfPool],
  );

  const visibleAlternatives = useMemo(() => {
    if (showAllPrograms) return restOfPoolCapped;
    return restOfPoolCapped.slice(0, INITIAL_ALTERNATIVES);
  }, [restOfPoolCapped, showAllPrograms]);

  if (profile === undefined) {
    return (
      <main className="coach-page flex min-h-[40vh] items-center justify-center text-muted-2">
        {t("common.loading")}
      </main>
    );
  }
  if (!profile) return <CoachProfileMissingFallback />;

  const fi = locale === "fi";

  return (
    <main className="coach-page pb-28">
      <Container size="phone" className="px-5 py-8">
        <h1 className="text-[1.375rem] font-semibold tracking-[-0.03em] text-foreground">
          {t("plans.selectCoachingTitle")}
        </h1>
        <p className="mt-2 text-[14px] text-muted">{t("plans.browseHintGym")}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["all", "lose_weight", "build_muscle", "improve_fitness"] as const).map((g) => (
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
                ? fi
                  ? "Oma tavoite"
                  : "My goal"
                : g === "lose_weight"
                  ? t("onboarding.goalLose")
                  : g === "build_muscle"
                    ? t("onboarding.goalMuscle")
                    : t("onboarding.goalFitness")}
            </button>
          ))}
        </div>

        {recommended && coachingPool.some((e) => e.id === recommended.id) ? (
          <div className="mt-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
              {t("plans.recommendedEyebrow")}
            </p>
            <div className="mt-3">
              <ProgramRecommendationCard
                entry={recommended}
                recommended
                onPreview={() => setPreviewId(recommended.id)}
                onSelect={() => setConfirmId(recommended.id)}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("plans.alternativesEyebrow")}
          </p>
          {visibleAlternatives.map((e) => (
            <ProgramRecommendationCard
              key={e.id}
              entry={e}
              onPreview={() => setPreviewId(e.id)}
              onSelect={() => setConfirmId(e.id)}
            />
          ))}
          {!showAllPrograms && restOfPoolCapped.length > INITIAL_ALTERNATIVES ? (
            <button
              type="button"
              onClick={() => setShowAllPrograms(true)}
              className="mt-2 min-h-[44px] rounded-[var(--radius-lg)] border border-border/70 bg-card/50 px-4 text-[13px] font-semibold text-accent transition hover:border-accent/40"
            >
              {t("plans.showMore")}
            </button>
          ) : null}
        </div>
      </Container>

      {previewEntry ? (
        <ProgramContentPreviewSheet
          entry={previewEntry}
          profile={profile}
          onClose={() => setPreviewId(null)}
        />
      ) : null}

      {confirmId ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[var(--z-overlay-backdrop)] flex items-end justify-center bg-black/60 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top,0px)+2rem)] lg:items-center"
          onClick={() => setConfirmId(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setConfirmId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[min(88vh,90dvh)] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-2xl)] border border-border/80 bg-card p-6 shadow-[var(--shadow-float)] lg:max-h-none lg:rounded-[var(--radius-xl)] [-webkit-overflow-scrolling:touch]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[16px] font-semibold text-foreground">
              {t("programChange.confirmTitle")}
            </p>
            <p className="mt-2 text-[14px] text-muted">{t("programChange.confirmBody")}</p>
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
                  const patch = applyProgramLibraryEntry(confirmId, profile);
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
