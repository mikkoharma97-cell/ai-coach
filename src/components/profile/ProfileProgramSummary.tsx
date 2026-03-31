"use client";

import { useTranslation } from "@/hooks/useTranslation";
import type { MessageKey, TranslateFn } from "@/lib/i18n";
import { getNutritionBlueprint } from "@/lib/nutritionBlueprints";
import { getProgramBlueprint } from "@/lib/programBlueprints";
import { resolveProgramFromProfile } from "@/lib/profileProgramResolver";
import type { OnboardingAnswers } from "@/types/coach";

function goalLabel(goal: OnboardingAnswers["goal"], t: TranslateFn) {
  const m = {
    lose_weight: "onboarding.goalLose",
    build_muscle: "onboarding.goalMuscle",
    improve_fitness: "onboarding.goalFitness",
  } as const;
  return t(m[goal]);
}

function levelLabel(level: OnboardingAnswers["level"], t: TranslateFn) {
  const m = {
    beginner: "onboarding.levelBeginner",
    intermediate: "onboarding.levelMid",
    advanced: "onboarding.levelAdvanced",
  } as const;
  return t(m[level]);
}

function venueLabel(venue: OnboardingAnswers["trainingVenue"] | undefined, t: TranslateFn) {
  const v = venue ?? "mixed";
  const m = {
    gym: "onboarding.venueGym",
    home: "onboarding.venueHome",
    outdoor: "onboarding.venueOutdoor",
    mixed: "onboarding.venueMixed",
  } as const;
  return t(m[v]);
}

function scheduleLabel(bias: "regular" | "shift" | "busy", t: TranslateFn) {
  if (bias === "shift") return t("adjust.rhythmShift");
  if (bias === "busy") return t("adjust.rhythmBusy");
  return t("adjust.rhythmRegular");
}

function presetDetailKey(
  presetId: string,
  field: "audience" | "week" | "food" | "correctionLine" | "recovery",
): MessageKey {
  return `program.preset.${presetId}.${field}` as MessageKey;
}

export function ProfileProgramSummary({ profile }: { profile: OnboardingAnswers }) {
  const { t, locale } = useTranslation();
  const resolved = resolveProgramFromProfile(profile);
  const tp = getProgramBlueprint(resolved.programBlueprintId);
  const np = getNutritionBlueprint(resolved.nutritionBlueprintId);
  const trainingName = locale === "en" ? tp.nameEn : tp.nameFi;
  const nutritionName = locale === "en" ? np.nameEn : np.nameFi;
  const pid = resolved.presetId;

  return (
    <section
      className="coach-panel-subtle mt-5 overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.08] px-4 py-4"
      aria-labelledby="profile-program-summary"
    >
      <h2
        id="profile-program-summary"
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent"
      >
        {t("adjust.profileSummaryTitle")}
      </h2>
      <p className="mt-1 text-[12px] leading-snug text-muted-2">
        {t("adjust.profileSummarySub")}
      </p>
      <div className="mt-4 rounded-lg border border-white/[0.06] bg-black/[0.12] px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
          {t(resolved.presetFrameLabelKey)}
        </p>
        <p className="mt-1 text-[15px] font-semibold leading-snug text-foreground">
          {t(resolved.presetNameKey)}
        </p>
        <p className="mt-2 text-[12px] leading-snug text-muted-2">
          {t(resolved.programRationaleKey)}
        </p>
        <dl className="mt-3 space-y-2 text-[12px] leading-snug">
          <div>
            <dt className="text-muted-2">{t("adjust.presetAudience")}</dt>
            <dd className="mt-0.5 text-foreground/95">{t(presetDetailKey(pid, "audience"))}</dd>
          </div>
          <div>
            <dt className="text-muted-2">{t("adjust.presetWeek")}</dt>
            <dd className="mt-0.5 text-foreground/95">{t(presetDetailKey(pid, "week"))}</dd>
          </div>
          <div>
            <dt className="text-muted-2">{t("adjust.presetFood")}</dt>
            <dd className="mt-0.5 text-foreground/95">{t(presetDetailKey(pid, "food"))}</dd>
          </div>
          <div>
            <dt className="text-muted-2">{t("adjust.presetCorrection")}</dt>
            <dd className="mt-0.5 text-foreground/95">
              {t(resolved.correctionStyleKey)}{" "}
              <span className="text-muted-2">·</span>{" "}
              {t(presetDetailKey(pid, "correctionLine"))}
            </dd>
          </div>
          <div>
            <dt className="text-muted-2">{t("adjust.presetRecovery")}</dt>
            <dd className="mt-0.5 text-foreground/95">
              {t(resolved.recoverySensitivityLabelKey)}{" "}
              <span className="text-muted-2">·</span>{" "}
              {t(presetDetailKey(pid, "recovery"))}
            </dd>
          </div>
        </dl>
      </div>
      <dl className="mt-4 space-y-2.5 text-[13px]">
        <div className="flex justify-between gap-3 border-b border-border/35 pb-2">
          <dt className="text-muted-2">{t("adjust.profileGoal")}</dt>
          <dd className="text-right font-medium text-foreground">
            {goalLabel(profile.goal, t)}
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-border/35 pb-2">
          <dt className="text-muted-2">{t("adjust.profileLevel")}</dt>
          <dd className="text-right font-medium text-foreground">
            {levelLabel(profile.level, t)}
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-border/35 pb-2">
          <dt className="text-muted-2">{t("adjust.profileVenue")}</dt>
          <dd className="text-right font-medium text-foreground">
            {venueLabel(profile.trainingVenue, t)}
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-border/35 pb-2">
          <dt className="text-muted-2">{t("adjust.profileDays")}</dt>
          <dd className="text-right font-medium tabular-nums text-foreground">
            {profile.daysPerWeek}
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-border/35 pb-2">
          <dt className="text-muted-2">{t("adjust.profileLifeRhythm")}</dt>
          <dd className="text-right font-medium text-foreground">
            {scheduleLabel(resolved.scheduleBias, t)}
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-border/35 pb-2">
          <dt className="text-muted-2">{t("adjust.profileTrainingBlueprint")}</dt>
          <dd className="max-w-[55%] text-right font-medium leading-snug text-foreground">
            {trainingName}
          </dd>
        </div>
        <div className="flex justify-between gap-3 pt-0.5">
          <dt className="text-muted-2">{t("adjust.profileNutritionBlueprint")}</dt>
          <dd className="max-w-[55%] text-right font-medium leading-snug text-foreground">
            {nutritionName}
          </dd>
        </div>
      </dl>
    </section>
  );
}
