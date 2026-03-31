"use client";

import { ProgramRecommendationCard } from "@/components/programs/ProgramRecommendationCard";
import { Container } from "@/components/ui/Container";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useTranslation } from "@/hooks/useTranslation";
import { useClientProfile } from "@/hooks/useClientProfile";
import {
  PROGRAM_LIBRARY,
  applyProgramLibraryEntry,
  recommendProgramForProfile,
} from "@/lib/coachProgramCatalog";
import type { Goal } from "@/types/coach";
import { useMemo, useState } from "react";
import { saveProfile } from "@/lib/storage";
import { useRouter } from "next/navigation";

type VenueFilter = "all" | "gym" | "home" | "mixed";
type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";

export default function PlansPage() {
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const router = useRouter();
  const [goalFilter, setGoalFilter] = useState<Goal | "all">("all");
  const [venueFilter, setVenueFilter] = useState<VenueFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const recommended = useMemo(
    () => (profile ? recommendProgramForProfile(profile) : null),
    [profile],
  );

  const pool = useMemo(() => {
    if (!profile) return PROGRAM_LIBRARY;
    const g = goalFilter === "all" ? profile.goal : goalFilter;
    let list = PROGRAM_LIBRARY.filter((e) => e.goal === g);

    if (venueFilter !== "all") {
      list = list.filter((e) => {
        if (venueFilter === "mixed") return e.trainingVenue === "any";
        if (e.trainingVenue === "any") return true;
        return e.trainingVenue === venueFilter;
      });
    }

    if (levelFilter !== "all") {
      list = list.filter((e) => {
        const lv = e.level ?? "intermediate";
        if (lv === "any") return true;
        return lv === levelFilter;
      });
    }

    return list;
  }, [profile, goalFilter, venueFilter, levelFilter]);

  const restOfPool = useMemo(() => {
    if (!recommended) return pool;
    return pool.filter((e) => e.id !== recommended.id);
  }, [pool, recommended]);

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
    <main className="coach-page">
      <Container size="phone" className="px-5 py-8">
        <h1 className="text-[1.375rem] font-semibold tracking-[-0.03em] text-foreground">
          {t("plans.title")}
        </h1>
        <p className="mt-2 text-[14px] text-muted">{t("plans.browseHint")}</p>

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

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="w-full text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            {fi ? "Paikka" : "Venue"}
          </span>
          {(["all", "gym", "home", "mixed"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVenueFilter(v)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                venueFilter === v
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border/80 text-muted"
              }`}
            >
              {v === "all"
                ? fi
                  ? "Kaikki"
                  : "All"
                : v === "gym"
                  ? fi
                    ? "Sali"
                    : "Gym"
                  : v === "home"
                    ? fi
                      ? "Koti"
                      : "Home"
                    : fi
                      ? "Sekä"
                      : "Mixed"}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="w-full text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            {fi ? "Taso" : "Level"}
          </span>
          {(["all", "beginner", "intermediate", "advanced"] as const).map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => setLevelFilter(lv)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                levelFilter === lv
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border/80 text-muted"
              }`}
            >
              {lv === "all"
                ? fi
                  ? "Kaikki"
                  : "All"
                : lv === "beginner"
                  ? fi
                    ? "Aloitus"
                    : "Beginner"
                  : lv === "intermediate"
                    ? fi
                      ? "Keskitaso"
                      : "Intermediate"
                    : fi
                      ? "Kova"
                      : "Advanced"}
            </button>
          ))}
        </div>

        {recommended && pool.some((e) => e.id === recommended.id) ? (
          <div className="mt-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
              {t("plans.recommendedEyebrow")}
            </p>
            <div className="mt-3">
              <ProgramRecommendationCard entry={recommended} recommended />
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {fi ? "Kaikki listatut ohjelmat" : "All listed programs"}
          </p>
          {restOfPool.map((e) => (
            <ProgramRecommendationCard
              key={e.id}
              entry={e}
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
