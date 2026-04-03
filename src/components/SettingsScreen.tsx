"use client";

import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { CoachScreenHeader } from "@/components/ui/CoachScreenHeader";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslateFn } from "@/lib/i18n";
import {
  DEFAULT_REMINDER_PREFS,
  loadReminderPrefs,
  type ReminderPrefs,
} from "@/lib/notifications/reminderStorage";
import {
  clearAllCoachLocalData,
  loadProfile,
  probeLocalStorage,
} from "@/lib/storage";
import type { Goal, MealStructurePreference, OnboardingAnswers } from "@/types/coach";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function goalSummary(goal: Goal, t: TranslateFn): string {
  const m = {
    lose_weight: "food.goalLose",
    build_muscle: "food.goalMuscle",
    improve_fitness: "food.goalFitness",
  } as const;
  return t(m[goal]);
}

function mealStructureSummary(
  ms: MealStructurePreference,
  t: TranslateFn,
): string {
  const key =
    ms === "three_meals"
      ? "onboarding.structThree"
      : ms === "lighter_evening"
        ? "onboarding.structLight"
        : "onboarding.structSnack";
  return t(key);
}

export function SettingsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<OnboardingAnswers | null>(() =>
    loadProfile(),
  );
  const [reminderPrefs, setReminderPrefs] = useState<ReminderPrefs>(
    DEFAULT_REMINDER_PREFS,
  );
  const [storageOk] = useState(() =>
    typeof window !== "undefined" ? probeLocalStorage() : true,
  );

  useEffect(() => {
    setProfile(loadProfile());
  }, [pathname]);

  useEffect(() => {
    if (!profile) router.replace("/start");
  }, [profile, router]);

  useEffect(() => {
    setReminderPrefs(loadReminderPrefs());
  }, [pathname]);

  const onReset = useCallback(() => {
    if (!window.confirm(t("settings.resetConfirm"))) return;
    clearAllCoachLocalData();
    router.replace("/start");
  }, [router, t]);

  const displayNameLine = useMemo(() => {
    const n = profile?.displayName?.trim();
    return n && n.length > 0 ? n : t("common.none");
  }, [profile?.displayName, t]);

  const trainingLine = useMemo(() => {
    if (!profile) return t("common.none");
    return `${profile.daysPerWeek} ${t("preferences.daysUnit")}`;
  }, [profile, t]);

  if (!profile) {
    return <CoachProfileMissingFallback />;
  }

  return (
    <main className="coach-page">
      <Container size="phone" className="px-5 pb-10">
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

        <nav
          className="mt-8 divide-y divide-white/[0.06] border-y border-white/[0.06]"
          aria-label={t("settings.title")}
        >
          <SettingsRow
            label={t("settings.rowName")}
            value={displayNameLine}
            cta={t("settings.ctaUpdate")}
            href="/preferences#pref-profile"
          />
          <SettingsRow
            label={t("settings.rowGoal")}
            value={goalSummary(profile.goal, t)}
            cta={t("settings.ctaChangeGoal")}
            href="/preferences#pref-goal"
          />
          <SettingsRow
            label={t("settings.rowTraining")}
            value={trainingLine}
            cta={t("settings.ctaUpdate")}
            href="/preferences#pref-training"
          />
          <SettingsRow
            label={t("settings.rowFood")}
            value={mealStructureSummary(profile.mealStructure, t)}
            cta={t("settings.ctaUpdate")}
            href="/preferences#pref-food"
          />
          <SettingsRow
            label={t("settings.rowReminders")}
            value={
              reminderPrefs.enabled
                ? t("settings.reminderOn")
                : t("settings.reminderOff")
            }
            cta={t("settings.ctaEditReminders")}
            href="/preferences#pref-reminders"
          />
        </nav>

        <section className="mt-10 px-1">
          <h2 className="coach-section-label text-muted-2">
            {t("settings.resetTitle")}
          </h2>
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

function SettingsRow({
  label,
  value,
  cta,
  href,
}: {
  label: string;
  value: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="flex flex-col gap-2 py-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2">
          {label}
        </p>
        <p className="mt-1.5 text-[15px] leading-snug text-foreground">{value}</p>
      </div>
      <Link
        href={href}
        className="min-h-[44px] shrink-0 self-start rounded-lg px-1 py-2 text-[14px] font-semibold text-accent underline-offset-2 hover:underline"
      >
        {cta}
      </Link>
    </div>
  );
}
