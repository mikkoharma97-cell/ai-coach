"use client";

import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import {
  PreferenceField,
  PreferenceSection,
  preferenceSelectClass,
} from "@/components/preferences/PreferenceSection";
import { CoachScreenHeader } from "@/components/ui/CoachScreenHeader";
import { HelpVideoCard } from "@/components/ui/HelpVideoCard";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import {
  mealStructureFromNutritionBlueprint,
  NUTRITION_BLUEPRINTS,
  resolveNutritionBlueprintId,
} from "@/lib/nutritionBlueprints";
import type { MessageKey } from "@/lib/i18n";
import { emptyAnswers } from "@/lib/plan";
import {
  PROGRAM_BLUEPRINTS,
  resolveProgramBlueprintId,
} from "@/lib/programBlueprints";
import { PROGRAM_TRACKS, normalizeProgramTrackId } from "@/lib/programTracks";
import {
  getCoachFeatureToggles,
  mergeCoachFeatureToggles,
} from "@/lib/coachFeatureToggles";
import {
  DEFAULT_REMINDER_PREFS,
  loadReminderPrefs,
  saveReminderPrefs,
  type ReminderPrefs,
} from "@/lib/notifications/reminderStorage";
import {
  AUTOPILOT_CHANGED,
  loadAutopilotEnabled,
  saveAutopilotEnabled,
} from "@/lib/autopilotStorage";
import { trackEvent } from "@/lib/analytics";
import { loadProfile, saveProfile } from "@/lib/storage";
import type {
  BiggestChallenge,
  CookingTimePreference,
  DaysPerWeek,
  EatingHabits,
  EventDisruptionStyle,
  FlexibilityPreference,
  Goal,
  Level,
  MealStructurePreference,
  NutritionBlueprintId,
  OnboardingAnswers,
  ProgramBlueprintId,
  ProgramTrackId,
  SocialEatingFrequency,
  TargetReason,
  UiLocale,
} from "@/types/coach";
import type { CoachFeatureToggles } from "@/types/coachPreferences";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";

const COACH_TOGGLE_KEYS: (keyof CoachFeatureToggles)[] = [
  "showCoachLines",
  "showHardlineTone",
  "showHelpVideos",
  "showProgressCharts",
  "showStreaks",
  "showRealityScore",
  "showExceptionGuidance",
  "showNutritionCorrections",
  "showVoiceWorkout",
  "showWeeklyCoachReview",
  "showDailyActivityInput",
];

const TOGGLE_I18N: Record<keyof CoachFeatureToggles, MessageKey> = {
  showCoachLines: "preferences.toggle.coachLines",
  showHardlineTone: "preferences.toggle.hardline",
  showHelpVideos: "preferences.toggle.helpVideos",
  showProgressCharts: "preferences.toggle.progressCharts",
  showStreaks: "preferences.toggle.streaks",
  showRealityScore: "preferences.toggle.realityScore",
  showExceptionGuidance: "preferences.toggle.exceptionGuidance",
  showNutritionCorrections: "preferences.toggle.nutritionCorrections",
  showVoiceWorkout: "preferences.toggle.voiceWorkout",
  showWeeklyCoachReview: "preferences.toggle.weeklyCoachReview",
  showDailyActivityInput: "preferences.toggle.dailyActivityInput",
};

function joinList(arr: string[] | undefined): string {
  return (arr ?? []).join(", ");
}

function splitList(s: string): string[] {
  return s
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function PreferencesScreen() {
  const router = useRouter();
  const { t, setLocale, locale } = useTranslation();
  const [profile] = useState(() => loadProfile());
  const [form, setForm] = useState<OnboardingAnswers | null>(null);
  const [saved, setSaved] = useState(false);
  const [reminderPrefs, setReminderPrefs] =
    useState<ReminderPrefs>(DEFAULT_REMINDER_PREFS);
  const [autopilotOn, setAutopilotOn] = useState(() => loadAutopilotEnabled());

  useEffect(() => {
    if (!profile) {
      router.replace("/start");
      return;
    }
    const merged: OnboardingAnswers = { ...emptyAnswers(), ...profile };
    merged.uiLocale = merged.uiLocale ?? "fi";
    setForm(merged);
  }, [profile, router]);

  useEffect(() => {
    setReminderPrefs(loadReminderPrefs());
  }, []);

  useEffect(() => {
    if (!form || typeof window === "undefined") return;
    const id = window.location.hash?.replace(/^#/, "");
    if (!id) return;
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
    return () => window.clearTimeout(t);
  }, [form]);

  useEffect(() => {
    const sync = () => setAutopilotOn(loadAutopilotEnabled());
    window.addEventListener(AUTOPILOT_CHANGED, sync);
    return () => window.removeEventListener(AUTOPILOT_CHANGED, sync);
  }, []);

  const onAutopilotToggle = useCallback((checked: boolean) => {
    saveAutopilotEnabled(checked);
    setAutopilotOn(checked);
    trackEvent(checked ? "autopilot_enable" : "autopilot_disable");
  }, []);

  const onReminderToggle = useCallback(async (checked: boolean) => {
    if (!checked) {
      saveReminderPrefs({ ...reminderPrefs, enabled: false });
      setReminderPrefs(loadReminderPrefs());
      return;
    }
    if (typeof Notification === "undefined") return;
    let p: NotificationPermission = Notification.permission;
    if (p === "default") {
      p = await Notification.requestPermission();
    }
    if (p !== "granted") {
      saveReminderPrefs({ ...reminderPrefs, enabled: false });
      setReminderPrefs(loadReminderPrefs());
      return;
    }
    saveReminderPrefs({ ...reminderPrefs, enabled: true });
    setReminderPrefs(loadReminderPrefs());
  }, [reminderPrefs]);

  const patch = useCallback((p: Partial<OnboardingAnswers>) => {
    setSaved(false);
    setForm((f) => (f ? { ...f, ...p } : f));
  }, []);

  const toggleCoach = useCallback((key: keyof CoachFeatureToggles) => {
    setSaved(false);
    setForm((f) => {
      if (!f) return f;
      const cur = getCoachFeatureToggles(f);
      return {
        ...f,
        coachFeatureToggles: mergeCoachFeatureToggles(f, {
          [key]: !cur[key],
        }),
      };
    });
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const ui: UiLocale = form.uiLocale ?? "fi";
    saveProfile({ ...form, uiLocale: ui });
    setLocale(ui);
    setSaved(true);
  };

  if (!profile) {
    return <CoachProfileMissingFallback />;
  }

  if (!form) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[15px] text-muted-2">
        {t("common.loading")}
      </div>
    );
  }

  const sel = preferenceSelectClass();
  const coachFeatures = getCoachFeatureToggles(form);

  return (
    <main className="coach-page">
      <Container size="phone" className="px-5">
        <CoachScreenHeader
          eyebrow={t("preferences.eyebrow")}
          title={t("preferences.title")}
          description={t("preferences.subtitle")}
        />

        <p className="mt-4 text-center sm:text-left">
          <Link
            href="/app"
            className="text-[13px] font-semibold text-accent underline-offset-[3px] hover:underline"
          >
            {t("nav.backToToday")}
          </Link>
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-0 pb-10">
          <PreferenceSection title={t("preferences.sectionSimple")}>
            <PreferenceField label={t("settings.fieldName")} id="pref-profile">
              <input
                type="text"
                name="displayName"
                autoComplete="name"
                maxLength={80}
                placeholder={t("settings.namePlaceholder")}
                className={sel}
                value={form.displayName ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  patch({ displayName: v.length ? v : undefined });
                }}
              />
            </PreferenceField>
            <PreferenceField label={t("onboarding.qGoal")} id="pref-goal">
              <select
                className={sel}
                value={form.goal}
                onChange={(e) => patch({ goal: e.target.value as Goal })}
              >
                <option value="lose_weight">{t("onboarding.goalLose")}</option>
                <option value="build_muscle">{t("onboarding.goalMuscle")}</option>
                <option value="improve_fitness">
                  {t("onboarding.goalFitness")}
                </option>
              </select>
            </PreferenceField>
            <PreferenceField label={t("onboarding.qDays")} id="pref-training">
              <select
                className={sel}
                value={String(form.daysPerWeek)}
                onChange={(e) =>
                  patch({ daysPerWeek: Number(e.target.value) as DaysPerWeek })
                }
              >
                {([1, 2, 3, 4, 5, 6] as const).map((n) => (
                  <option key={n} value={n}>
                    {n} {t("preferences.daysUnit")}
                  </option>
                ))}
              </select>
            </PreferenceField>
            <PreferenceField label={t("onboarding.qMealStructure")} id="pref-food">
              <select
                className={sel}
                value={form.mealStructure}
                onChange={(e) =>
                  patch({
                    mealStructure: e.target.value as MealStructurePreference,
                  })
                }
              >
                <option value="three_meals">{t("onboarding.structThree")}</option>
                <option value="lighter_evening">
                  {t("onboarding.structLight")}
                </option>
                <option value="snack_forward">
                  {t("onboarding.structSnack")}
                </option>
              </select>
            </PreferenceField>
          </PreferenceSection>

          <PreferenceSection
            id="pref-reminders"
            title={t("notifications.prefsTitle")}
          >
            <p className="text-[12px] leading-relaxed text-muted-2">
              {t("notifications.prefsHint")}
            </p>
            <label className="mt-3 flex cursor-pointer items-center justify-between gap-4 px-1 py-1">
              <span className="text-[13px] leading-snug text-foreground">
                {t("notifications.prefsEnable")}
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 rounded border-border text-accent accent-accent"
                checked={reminderPrefs.enabled}
                onChange={(e) => onReminderToggle(e.target.checked)}
              />
            </label>
            {typeof Notification !== "undefined" &&
              Notification.permission === "denied" && (
                <p className="mt-2 text-[12px] leading-snug text-amber-600/90 dark:text-amber-400/85">
                  {t("notifications.permissionDenied")}
                </p>
              )}
          </PreferenceSection>

          <PreferenceSection title={t("preferences.autopilotTitle")}>
            <p className="text-[12px] leading-relaxed text-muted-2">
              {t("preferences.autopilotHint")}
            </p>
            <label className="mt-3 flex cursor-pointer items-center justify-between gap-4 px-1 py-1">
              <span className="text-[13px] leading-snug text-foreground">
                {t("preferences.autopilotEnable")}
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 rounded border-border text-accent accent-accent"
                checked={autopilotOn}
                onChange={(e) => onAutopilotToggle(e.target.checked)}
              />
            </label>
          </PreferenceSection>

          <details className="group rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.02] px-4 py-3">
            <summary className="cursor-pointer list-none text-[14px] font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                {t("preferences.moreSettings")}
                <span className="text-[12px] font-normal text-muted-2 group-open:rotate-180 transition">
                  ▾
                </span>
              </span>
            </summary>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-2">
              {t("preferences.moreSettingsHint")}
            </p>

            <div className="mt-6 space-y-6">
              <PreferenceSection title={t("preferences.coachTitle")}>
                <p className="text-[12px] leading-relaxed text-muted-2">
                  {t("preferences.coachSubtitle")}
                </p>
                <div className="mt-3 divide-y divide-border/45 rounded-[var(--radius-lg)] border border-border/50 bg-white/[0.02] px-1">
                  {COACH_TOGGLE_KEYS.map((key) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center justify-between gap-4 px-3 py-2.5"
                    >
                      <span className="text-[13px] leading-snug text-foreground">
                        {t(TOGGLE_I18N[key])}
                      </span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 rounded border-border text-accent accent-accent"
                        checked={coachFeatures[key]}
                        onChange={() => toggleCoach(key)}
                      />
                    </label>
                  ))}
                </div>
              </PreferenceSection>

              <HelpVideoCard
                pageId="preferences"
                enabled={coachFeatures.showHelpVideos}
                className="opacity-95"
              />

              <PreferenceSection title={t("preferences.sectionBasics")}>
                <PreferenceField label={t("onboarding.qLevel")}>
                  <select
                    className={sel}
                    value={form.level}
                    onChange={(e) => {
                      const v = e.target.value as Level;
                      patch({ level: v, trainingLevel: v });
                    }}
                  >
                    <option value="beginner">
                      {t("onboarding.levelBeginner")}
                    </option>
                    <option value="intermediate">
                      {t("onboarding.levelMid")}
                    </option>
                    <option value="advanced">
                      {t("onboarding.levelAdvanced")}
                    </option>
                  </select>
                </PreferenceField>
                <PreferenceField label={t("onboarding.qChallenge")}>
                  <select
                    className={sel}
                    value={form.biggestChallenge}
                    onChange={(e) =>
                      patch({
                        biggestChallenge: e.target.value as BiggestChallenge,
                      })
                    }
                  >
                    <option value="motivation">
                      {t("onboarding.chMotivation")}
                    </option>
                    <option value="lack_of_time">{t("onboarding.chTime")}</option>
                    <option value="dont_know_what_to_do">
                      {t("onboarding.chUnsure")}
                    </option>
                    <option value="fall_off_after_starting">
                      {t("onboarding.chFallOff")}
                    </option>
                  </select>
                </PreferenceField>
              </PreferenceSection>

              <PreferenceSection title={t("preferences.sectionGoals")}>
                <PreferenceField label={t("preferences.qProgramTrack")}>
                  <select
                    className={sel}
                    value={normalizeProgramTrackId(form.programTrackId)}
                    onChange={(e) =>
                      patch({ programTrackId: e.target.value as ProgramTrackId })
                    }
                  >
                    {PROGRAM_TRACKS.map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {t(`programTrack.${tr.id}` as const)}
                      </option>
                    ))}
                  </select>
                </PreferenceField>
                <PreferenceField label={t("preferences.qCurrentWeight")}>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={30}
                    max={300}
                    step="0.1"
                    className={sel}
                    value={form.currentWeight ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      patch({
                        currentWeight:
                          v === "" ? undefined : Number.parseFloat(v),
                      });
                    }}
                    placeholder="—"
                    autoComplete="off"
                  />
                </PreferenceField>
                <PreferenceField label={t("preferences.qTargetWeight")}>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={30}
                    max={300}
                    step="0.1"
                    className={sel}
                    value={form.targetWeight ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      patch({
                        targetWeight:
                          v === "" ? undefined : Number.parseFloat(v),
                      });
                    }}
                    placeholder="—"
                    autoComplete="off"
                  />
                </PreferenceField>
                <PreferenceField label={t("preferences.qTargetDate")}>
                  <input
                    type="date"
                    className={sel}
                    value={form.targetDate ?? ""}
                    onChange={(e) =>
                      patch({
                        targetDate:
                          e.target.value === "" ? undefined : e.target.value,
                      })
                    }
                  />
                </PreferenceField>
                <PreferenceField label={t("preferences.qTargetReason")}>
                  <select
                    className={sel}
                    value={form.targetReason ?? "general"}
                    onChange={(e) =>
                      patch({
                        targetReason: e.target.value as TargetReason,
                      })
                    }
                  >
                    <option value="general">
                      {t("preferences.targetReason.general")}
                    </option>
                    <option value="wedding">
                      {t("preferences.targetReason.wedding")}
                    </option>
                    <option value="event">
                      {t("preferences.targetReason.event")}
                    </option>
                    <option value="summer">
                      {t("preferences.targetReason.summer")}
                    </option>
                    <option value="performance">
                      {t("preferences.targetReason.performance")}
                    </option>
                  </select>
                </PreferenceField>
              </PreferenceSection>

              <PreferenceSection title={t("preferences.sectionProgramBlueprint")}>
                <p className="text-[13px] leading-relaxed text-muted-2">
                  {t("preferences.pickTrainingShell")}
                </p>
                <div className="space-y-2">
                  {PROGRAM_BLUEPRINTS.map((bp) => {
                    const active = resolveProgramBlueprintId(form) === bp.id;
                    const en = locale === "en";
                    return (
                      <button
                        key={bp.id}
                        type="button"
                        onClick={() =>
                          patch({
                            programBlueprintId: bp.id as ProgramBlueprintId,
                            daysPerWeek: Math.min(
                              6,
                              Math.max(1, bp.trainingDays),
                            ) as DaysPerWeek,
                          })
                        }
                        className={`w-full rounded-[var(--radius-lg)] border px-3 py-3 text-left transition ${
                          active
                            ? "border-accent bg-[rgb(59_130_246/0.08)] ring-1 ring-accent"
                            : "border-border bg-background hover:border-muted-2"
                        }`}
                      >
                        <div className="text-[15px] font-semibold text-foreground">
                          {en ? bp.nameEn : bp.nameFi}
                        </div>
                        <div className="mt-1 text-[12px] text-muted-2">
                          {en ? bp.audienceEn : bp.audienceFi} · {bp.trainingDays}{" "}
                          {t("preferences.blueprintTrainingDaysUnit")}
                        </div>
                        <p className="mt-2 text-[13px] leading-snug text-muted">
                          {en ? bp.benefitLineEn : bp.benefitLineFi}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="text-[13px] font-medium text-accent underline-offset-2 hover:underline"
                  onClick={() => patch({ programBlueprintId: undefined })}
                >
                  {t("preferences.blueprintUsePackageDefault")}
                </button>
              </PreferenceSection>

              <PreferenceSection title={t("preferences.sectionNutritionBlueprint")}>
                <p className="text-[13px] leading-relaxed text-muted-2">
                  {t("preferences.pickNutritionShell")}
                </p>
                <div className="space-y-2">
                  {NUTRITION_BLUEPRINTS.map((bp) => {
                    const active = resolveNutritionBlueprintId(form) === bp.id;
                    const en = locale === "en";
                    return (
                      <button
                        key={bp.id}
                        type="button"
                        onClick={() =>
                          patch({
                            nutritionBlueprintId: bp.id as NutritionBlueprintId,
                            mealStructure: mealStructureFromNutritionBlueprint(bp),
                          })
                        }
                        className={`w-full rounded-[var(--radius-lg)] border px-3 py-3 text-left transition ${
                          active
                            ? "border-accent bg-[rgb(59_130_246/0.08)] ring-1 ring-accent"
                            : "border-border bg-background hover:border-muted-2"
                        }`}
                      >
                        <div className="text-[15px] font-semibold text-foreground">
                          {en ? bp.nameEn : bp.nameFi}
                        </div>
                        <div className="mt-1 text-[12px] text-muted-2">
                          {en ? bp.audienceEn : bp.audienceFi} · {bp.mealCount}{" "}
                          {t("preferences.blueprintMealsUnit")}
                        </div>
                        <p className="mt-2 text-[13px] leading-snug text-muted">
                          {en ? bp.benefitLineEn : bp.benefitLineFi}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="text-[13px] font-medium text-accent underline-offset-2 hover:underline"
                  onClick={() => patch({ nutritionBlueprintId: undefined })}
                >
                  {t("preferences.blueprintUsePackageDefault")}
                </button>
              </PreferenceSection>

              <PreferenceSection title={t("preferences.sectionFoodPrefs")}>
                <PreferenceField label={t("onboarding.qEating")}>
                  <select
                    className={sel}
                    value={form.eatingHabits}
                    onChange={(e) =>
                      patch({ eatingHabits: e.target.value as EatingHabits })
                    }
                  >
                    <option value="irregular">
                      {t("onboarding.eatIrregular")}
                    </option>
                    <option value="okay">{t("onboarding.eatOkay")}</option>
                    <option value="good">{t("onboarding.eatGood")}</option>
                  </select>
                </PreferenceField>
                <PreferenceField label={t("settings.fieldLikes")}>
                  <input
                    type="text"
                    className={sel}
                    value={joinList(form.foodPreferences)}
                    onChange={(e) =>
                      patch({ foodPreferences: splitList(e.target.value) })
                    }
                    placeholder={t("onboarding.foodLikesPlaceholder")}
                    autoComplete="off"
                  />
                </PreferenceField>
                <PreferenceField label={t("settings.fieldDislikes")}>
                  <input
                    type="text"
                    className={sel}
                    value={joinList(form.foodDislikes)}
                    onChange={(e) =>
                      patch({ foodDislikes: splitList(e.target.value) })
                    }
                    placeholder={t("onboarding.foodDislikesPlaceholder")}
                    autoComplete="off"
                  />
                </PreferenceField>
              </PreferenceSection>

              <PreferenceSection title={t("preferences.sectionLifestyle")}>
                <PreferenceField label={t("preferences.qCooking")}>
                  <select
                    className={sel}
                    value={form.cookingTimePreference ?? "auto"}
                    onChange={(e) => {
                      const v = e.target.value;
                      patch({
                        cookingTimePreference:
                          v === "auto"
                            ? undefined
                            : (v as CookingTimePreference),
                      });
                    }}
                  >
                    <option value="auto">{t("preferences.cookAuto")}</option>
                    <option value="fast">{t("settings.cookFast")}</option>
                    <option value="normal">{t("settings.cookNormal")}</option>
                    <option value="any">{t("settings.cookAny")}</option>
                  </select>
                </PreferenceField>
                <PreferenceField label={t("onboarding.qFlex")}>
                  <select
                    className={sel}
                    value={form.flexibility}
                    onChange={(e) =>
                      patch({
                        flexibility: e.target.value as FlexibilityPreference,
                      })
                    }
                  >
                    <option value="structured">
                      {t("onboarding.flexStructured")}
                    </option>
                    <option value="balanced">
                      {t("onboarding.flexBalanced")}
                    </option>
                    <option value="flexible">
                      {t("onboarding.flexFlexible")}
                    </option>
                  </select>
                </PreferenceField>
                <PreferenceField label={t("onboarding.qSocial")}>
                  <select
                    className={sel}
                    value={form.socialEatingFrequency}
                    onChange={(e) =>
                      patch({
                        socialEatingFrequency: e.target.value as SocialEatingFrequency,
                      })
                    }
                  >
                    <option value="rare">{t("onboarding.socialRare")}</option>
                    <option value="sometimes">
                      {t("onboarding.socialSometimes")}
                    </option>
                    <option value="often">{t("onboarding.socialOften")}</option>
                  </select>
                </PreferenceField>
                <PreferenceField label={t("onboarding.qEventDisruption")}>
                  <select
                    className={sel}
                    value={form.eventDisruption ?? "snap_back"}
                    onChange={(e) =>
                      patch({
                        eventDisruption: e.target.value as EventDisruptionStyle,
                      })
                    }
                  >
                    <option value="snap_back">{t("onboarding.eventSnap")}</option>
                    <option value="reset">{t("onboarding.eventReset")}</option>
                    <option value="loose">{t("onboarding.eventLoose")}</option>
                  </select>
                </PreferenceField>
              </PreferenceSection>

              <PreferenceSection title={t("preferences.sectionLanguage")}>
                <PreferenceField label={t("settings.language")}>
                  <select
                    className={sel}
                    value={form.uiLocale ?? "fi"}
                    onChange={(e) =>
                      patch({ uiLocale: e.target.value as UiLocale })
                    }
                  >
                    <option value="fi">Suomi</option>
                    <option value="en">English</option>
                  </select>
                </PreferenceField>
              </PreferenceSection>
            </div>
          </details>

          {saved ? (
            <p className="text-center text-[13px] text-muted" role="status">
              {t("preferences.saved")}
            </p>
          ) : null}

          <button
            type="submit"
            className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[16px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99]"
          >
            {t("ui.save")}
          </button>
        </form>
      </Container>
    </main>
  );
}
