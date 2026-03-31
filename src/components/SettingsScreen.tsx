"use client";

import { SettingsPreviewDiagnostics } from "@/components/SettingsPreviewDiagnostics";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { CoachScreenHeader } from "@/components/ui/CoachScreenHeader";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import type { Locale, TranslateFn } from "@/lib/i18n";
import { generateDailyPlan } from "@/lib/dailyEngine";
import { buildMealPreferences } from "@/lib/mealEngine";
import type { CoachMode, OnboardingAnswers } from "@/types/coach";
import {
  getSubscriptionSnapshot,
  hasSubscriptionAccess,
} from "@/lib/subscription";
import { getProgramPackage, packageLabel } from "@/lib/programPackages";
import {
  clearAllCoachLocalData,
  exportCoachDataJson,
  loadProfile,
  probeLocalStorage,
  saveProfile,
} from "@/lib/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function goalLabel(g: OnboardingAnswers["goal"], t: TranslateFn): string {
  const m = {
    lose_weight: "food.goalLose",
    build_muscle: "food.goalMuscle",
    improve_fitness: "food.goalFitness",
  } as const;
  return t(m[g]);
}

function levelLabel(level: OnboardingAnswers["level"], t: TranslateFn): string {
  const m = {
    beginner: "onboarding.levelBeginner",
    intermediate: "onboarding.levelMid",
    advanced: "onboarding.levelAdvanced",
  } as const;
  return t(m[level]);
}

function eatingLabel(t: TranslateFn, h: OnboardingAnswers["eatingHabits"]): string {
  const m = {
    irregular: "onboarding.eatIrregular",
    okay: "onboarding.eatOkay",
    good: "onboarding.eatGood",
  } as const;
  return t(m[h]);
}

function flexLabel(t: TranslateFn, f: OnboardingAnswers["flexibility"]): string {
  const m = {
    structured: "onboarding.flexStructured",
    balanced: "onboarding.flexBalanced",
    flexible: "onboarding.flexFlexible",
  } as const;
  return t(m[f]);
}

function socialLabel(t: TranslateFn, s: OnboardingAnswers["socialEatingFrequency"]): string {
  const m = {
    rare: "onboarding.socialRare",
    sometimes: "onboarding.socialSometimes",
    often: "onboarding.socialOften",
  } as const;
  return t(m[s]);
}

function eventDisruptionLabel(
  t: TranslateFn,
  d: OnboardingAnswers["eventDisruption"],
): string {
  const m = {
    snap_back: "settings.eventSnap",
    reset: "settings.eventReset",
    loose: "settings.eventLoose",
  } as const;
  return t(m[d]);
}

function cookingLabel(
  t: TranslateFn,
  c: ReturnType<typeof buildMealPreferences>["cookingTimePreference"],
): string {
  const m = {
    fast: "settings.cookFast",
    normal: "settings.cookNormal",
    any: "settings.cookAny",
  } as const;
  return t(m[c]);
}

function mealsPerDayLabel(profile: OnboardingAnswers, t: TranslateFn): string {
  const n = profile.mealStructure === "snack_forward" ? 4 : 3;
  return `${n} (${t(
    profile.mealStructure === "three_meals"
      ? "food.structThree"
      : profile.mealStructure === "lighter_evening"
        ? "food.structLight"
        : "food.structSnack",
  )})`;
}

export function SettingsScreen() {
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  const [profile, setProfile] = useState<OnboardingAnswers | null>(() =>
    loadProfile(),
  );
  const [sub] = useState(() => getSubscriptionSnapshot());
  const [storageOk] = useState(() =>
    typeof window !== "undefined" ? probeLocalStorage() : true,
  );

  const now = useMemo(() => new Date(), []);
  const plan = useMemo(() => {
    if (!profile) return null;
    return generateDailyPlan(profile, now, locale);
  }, [profile, now, locale]);

  const mealPrefs = useMemo(() => {
    if (!profile || !plan) return null;
    return buildMealPreferences(profile, plan);
  }, [profile, plan]);

  const packageName = useMemo(() => {
    const pkg = getProgramPackage(profile?.selectedPackageId);
    if (!pkg) return "—";
    return packageLabel(pkg, locale === "en" ? "en" : "fi").name;
  }, [profile?.selectedPackageId, locale]);

  useEffect(() => {
    if (!profile) router.replace("/start");
  }, [profile, router]);

  const onReset = useCallback(() => {
    if (!window.confirm(t("settings.resetConfirm"))) return;
    clearAllCoachLocalData();
    router.replace("/start");
  }, [router, t]);

  const onExport = useCallback(() => {
    const json = exportCoachDataJson();
    if (!json) {
      window.alert(t("settings.exportFailed"));
      return;
    }
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-coach-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [t]);

  if (!profile) {
    return <CoachProfileMissingFallback />;
  }

  const trialLine = sub.subscribed
    ? t("settings.subscribed")
    : sub.inTrial
      ? t("settings.trialLeft", { n: sub.daysLeftInTrial })
      : !hasSubscriptionAccess()
        ? t("settings.trialExpired")
        : t("settings.trialNotStarted");

  const likes = (profile.foodPreferences ?? []).join(", ") || "—";
  const dislikes = (profile.foodDislikes ?? []).join(", ") || "—";

  return (
    <main className="coach-page">
      <Container size="phone" className="px-5">
        <CoachScreenHeader
          eyebrow={t("settings.eyebrow")}
          title={t("settings.title")}
          description={t("settings.subtitle")}
        />

        <p className="mt-4 text-center sm:text-left">
          <Link
            href="/app"
            className="text-[13px] font-semibold text-accent underline-offset-[3px] hover:underline"
          >
            {t("nav.backToToday")}
          </Link>
        </p>

        {!storageOk ? (
          <p
            className="mt-6 rounded-[var(--radius-lg)] border border-border/80 bg-surface-subtle/80 px-4 py-3 text-[13px] leading-snug text-muted"
            role="status"
          >
            {t("settings.storageUnavailable")}
          </p>
        ) : null}

        <SettingsPreviewDiagnostics />

        <section className="coach-panel-subtle mt-6 px-4 py-4">
          <h2 className="coach-section-label">{t("settings.dataTitle")}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {t("settings.dataBody")}
          </p>
          <button
            type="button"
            onClick={onExport}
            className="mt-4 w-full min-h-[48px] rounded-[var(--radius-lg)] border border-border-strong bg-card text-[14px] font-semibold text-foreground transition hover:bg-surface-subtle"
          >
            {t("settings.exportCta")}
          </button>
        </section>

        <section className="coach-panel-subtle mt-4 px-4 py-4">
          <h2 className="coach-section-label">{t("settings.language")}</h2>
          <select
            value={locale}
            onChange={(e) => {
              const l = e.target.value as Locale;
              setLocale(l);
              const p = loadProfile();
              if (p) saveProfile({ ...p, uiLocale: l });
            }}
            className="mt-3 w-full rounded-[var(--radius-lg)] border border-border bg-background px-3 py-2.5 text-[15px] text-foreground"
            aria-label={t("settings.language")}
          >
            <option value="fi">Suomi</option>
            <option value="en">English</option>
          </select>
        </section>

        <section className="coach-panel-subtle mt-4 px-4 py-4">
          <h2 className="coach-section-label">{t("settings.subscription")}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">{trialLine}</p>
          {!sub.subscribed ? (
            <Link
              href="/paywall"
              className="mt-3 inline-block text-[14px] font-semibold text-accent hover:underline"
            >
              {t("settings.openPaywall")}
            </Link>
          ) : null}
        </section>

        <section className="coach-panel relative mt-4 px-4 py-4">
          <h2 className="coach-section-label">{t("settings.profileSummary")}</h2>
          <dl className="mt-4 space-y-3 text-[13px] leading-snug">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {t("settings.fieldPackage")}
              </dt>
              <dd className="mt-1 text-foreground">{packageName}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {t("settings.fieldGoal")}
              </dt>
              <dd className="mt-1 text-foreground">{goalLabel(profile.goal, t)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {t("settings.fieldLevel")}
              </dt>
              <dd className="mt-1 text-foreground">{levelLabel(profile.level, t)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {t("settings.fieldEating")}
              </dt>
              <dd className="mt-1 text-foreground">{eatingLabel(t, profile.eatingHabits)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {t("settings.fieldLikes")}
              </dt>
              <dd className="mt-1 text-muted">{likes}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {t("settings.fieldDislikes")}
              </dt>
              <dd className="mt-1 text-muted">{dislikes}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {t("settings.fieldMealsPerDay")}
              </dt>
              <dd className="mt-1 text-foreground">{mealsPerDayLabel(profile, t)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {t("settings.fieldCooking")}
              </dt>
              <dd className="mt-1 text-foreground">
                {mealPrefs ? cookingLabel(t, mealPrefs.cookingTimePreference) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {t("settings.fieldFlex")}
              </dt>
              <dd className="mt-1 text-foreground">{flexLabel(t, profile.flexibility)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {t("settings.fieldEvents")}
              </dt>
              <dd className="mt-1 text-foreground">
                {socialLabel(t, profile.socialEatingFrequency)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {t("settings.fieldEventMode")}
              </dt>
              <dd className="mt-1 text-foreground">
                {eventDisruptionLabel(t, profile.eventDisruption ?? "snap_back")}
              </dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/packages"
              className="inline-block text-[14px] font-semibold text-accent hover:underline"
            >
              {t("settings.editPackages")}
            </Link>
            <Link
              href="/preferences"
              className="inline-block text-[14px] font-semibold text-accent hover:underline"
            >
              {t("settings.editPreferences")}
            </Link>
            <Link
              href="/start"
              className="inline-block text-[14px] font-semibold text-muted hover:underline"
            >
              {t("settings.editOnboarding")}
            </Link>
          </div>
        </section>

        <section className="coach-panel relative mt-4 border border-dashed border-border/80 px-4 py-4">
          <h2 className="coach-section-label">{t("settings.scanTitle")}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {t("settings.scanBody")}
          </p>
          <Link
            href="/scan"
            className="mt-3 inline-block text-[14px] font-semibold text-accent hover:underline"
          >
            {t("nav.scan")} →
          </Link>
        </section>

        <section className="coach-panel relative mt-6 border border-dashed border-white/[0.08] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("settings.modeSectionEyebrow")}
          </p>
          <h2 className="coach-section-label mt-2">{t("settings.modeTitle")}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {t("settings.modeHint")}
          </p>
          <div
            className="mt-4 flex flex-wrap gap-2"
            role="radiogroup"
            aria-label={t("settings.modeTitle")}
          >
            {(
              [
                ["guided", "settings.modeGuided"],
                ["pro", "settings.modePro"],
              ] as const
            ).map(([mode, labelKey]) => {
              const active = (profile.mode ?? "guided") === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    const nextMode = mode as CoachMode;
                    const next = { ...profile, mode: nextMode };
                    saveProfile(next);
                    setProfile(next);
                  }}
                  className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                    active
                      ? mode === "guided"
                        ? "border-foreground/25 bg-white/[0.08] text-foreground"
                        : "border-accent bg-accent-soft text-accent"
                      : "border-white/10 bg-white/[0.04] text-muted-2 hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
          {(profile.mode ?? "guided") === "pro" ? (
            <Link
              href="/adjustments"
              className="mt-4 inline-block text-[14px] font-semibold text-accent hover:underline"
            >
              {t("settings.proToolsLink")}
            </Link>
          ) : null}
        </section>

        <section className="mt-6 px-1">
          <h2 className="coach-section-label text-accent">{t("settings.resetTitle")}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-2">
            {t("settings.resetBody")}
          </p>
          <button
            type="button"
            onClick={onReset}
            className="mt-4 w-full min-h-[48px] rounded-[var(--radius-lg)] border border-accent/35 bg-transparent text-[14px] font-semibold text-accent transition hover:bg-accent-soft/50"
          >
            {t("settings.resetCta")}
          </button>
        </section>
      </Container>
    </main>
  );
}
