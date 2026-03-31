"use client";

import { Container } from "@/components/ui/Container";
import { CoachScreenHeader } from "@/components/ui/CoachScreenHeader";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useTranslation } from "@/hooks/useTranslation";
import { buildProAiSuggestions } from "@/lib/proAiSuggestions";
import { ensureExerciseProgress, suggestProgressionCopy } from "@/lib/proProgression";
import { effectiveTrainingLevel } from "@/lib/profileTraining";
import {
  defaultProWorkspace,
  loadProWorkspace,
  saveProWorkspace,
} from "@/lib/proWorkspace";
import { resolveProgramTrackId } from "@/lib/programTracks";
import { ProgressionExampleTable } from "@/components/pro/ProgressionExampleTable";
import { seedMealPlan, seedTrainingProgram } from "@/lib/proSeeds";
import type {
  ExerciseProgressionState,
  ProAiSuggestion,
  ProSplitPreset,
  ProWorkspace,
} from "@/types/pro";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const PRESETS: { id: ProSplitPreset; labelKey: string }[] = [
  { id: "push_pull_legs", labelKey: "pro.presetPpl" },
  { id: "upper_lower", labelKey: "pro.presetUl" },
  { id: "full_body", labelKey: "pro.presetFb" },
  { id: "custom", labelKey: "pro.presetCustom" },
];

function buildProgressMap(program: ReturnType<typeof seedTrainingProgram>) {
  const exerciseProgress: Record<string, ExerciseProgressionState> = {};
  for (const day of program.days) {
    for (const ex of day.exercises) {
      exerciseProgress[ex.id] = ensureExerciseProgress(ex);
    }
  }
  return exerciseProgress;
}

export function ProScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [workspace, setWorkspace] = useState<ProWorkspace>(() =>
    defaultProWorkspace(),
  );
  const [expandedEx, setExpandedEx] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => setWorkspace(loadProWorkspace()));
  }, []);

  const refresh = useCallback(() => {
    setWorkspace(loadProWorkspace());
  }, []);

  useEffect(() => {
    if (profile === undefined) return;
    if (!profile) router.replace("/start");
  }, [profile, router]);

  const applyPreset = useCallback(
    (preset: ProSplitPreset) => {
      if (!profile) return;
      const training = seedTrainingProgram(preset, {
        locale: locale === "en" ? "en" : "fi",
        goal: profile.goal,
        trainingLevel: effectiveTrainingLevel(profile),
        limitations: profile.limitations,
        programTrackId: resolveProgramTrackId(profile),
        salt: `pro-${profile.goal}-${preset}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      });
      const meal = seedMealPlan();
      const suggestions = buildProAiSuggestions(training);
      const next: ProWorkspace = {
        ...workspace,
        trainingProgram: training,
        mealPlan: meal,
        exerciseProgress: buildProgressMap(training),
        pendingAiSuggestions: suggestions,
        appliedSuggestionIds: workspace.appliedSuggestionIds,
      };
      saveProWorkspace(next);
      refresh();
    },
    [workspace, refresh, profile, locale],
  );

  const acceptSuggestion = useCallback(
    (s: ProAiSuggestion) => {
      const next: ProWorkspace = {
        ...workspace,
        pendingAiSuggestions: workspace.pendingAiSuggestions.filter(
          (x) => x.id !== s.id,
        ),
        appliedSuggestionIds: [...workspace.appliedSuggestionIds, s.id].slice(
          -50,
        ),
      };
      saveProWorkspace(next);
      refresh();
    },
    [workspace, refresh],
  );

  const loc = locale === "en" ? "en" : "fi";

  const progressionSummary = useMemo(() => {
    const p = workspace.trainingProgram;
    if (!p) return [];
    return p.days.flatMap((d) =>
      d.exercises.map((ex) => ({
        dayName: d.name,
        exercise: ex,
        state: workspace.exerciseProgress[ex.id],
      })),
    );
  }, [workspace]);

  if (profile === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[15px] text-muted-2">
        {t("common.loading")}
      </div>
    );
  }

  if (!profile) {
    return <CoachProfileMissingFallback />;
  }

  if (profile.mode !== "pro") {
    return (
      <main className="coach-page">
        <Container size="phone" className="px-5">
          <CoachScreenHeader
            eyebrow={t("pro.eyebrow")}
            title={t("pro.titleGuidedGate")}
            description={t("pro.bodyGuidedGate")}
          />
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/app"
              className="flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-accent px-4 text-[15px] font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.35)] transition hover:brightness-110"
            >
              {t("pro.backToTodayCta")}
            </Link>
            <Link
              href="/settings"
              className="flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-lg)] border border-white/12 bg-white/[0.04] px-4 text-[15px] font-semibold text-foreground transition hover:bg-white/[0.07]"
            >
              {t("pro.openSettingsMode")}
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  const program = workspace.trainingProgram;

  return (
    <main className="coach-page">
      <Container size="phone" className="px-5 pb-10">
        <CoachScreenHeader
          eyebrow={t("pro.eyebrow")}
          title={t("pro.title")}
          description={t("pro.subtitle")}
        />

        <section className="coach-panel-subtle mt-6 px-4 py-4">
          <h2 className="coach-section-label">{t("pro.sectionOwnPrograms")}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {t("pro.ownProgramsHint")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                  program?.splitPreset === p.id
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-white/10 bg-white/[0.04] text-muted-2 hover:border-accent/40 hover:text-foreground"
                }`}
              >
                {t(p.labelKey as "pro.presetPpl")}
              </button>
            ))}
          </div>
          {!program ? (
            <p className="mt-4 text-[12px] text-muted-2">{t("pro.pickPreset")}</p>
          ) : (
            <p className="mt-3 text-[11px] font-medium text-muted-2">
              {program.splitName} · {program.trainingDaysPerWeek}{" "}
              {t("pro.daysPerWeekShort")} · {program.progressionMode}
            </p>
          )}
        </section>

        {program ? (
          <section className="mt-6" aria-labelledby="pro-training">
            <h2 id="pro-training" className="coach-section-label px-1">
              {t("pro.sectionTraining")}
            </h2>
            <div className="mt-3 space-y-3">
              {program.days.map((day) => (
                <div
                  key={day.id}
                  className="coach-panel rounded-[var(--radius-lg)] px-4 py-3"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
                    {day.name}
                  </p>
                  <p className="mt-1 text-[12px] text-muted">{day.focus}</p>
                  {day.exercises.length === 0 ? (
                    <p className="mt-2 text-[12px] text-muted-2">
                      {t("pro.restDay")}
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {day.exercises.map((ex) => {
                        const st = workspace.exerciseProgress[ex.id];
                        const open = expandedEx === ex.id;
                        return (
                          <li
                            key={ex.id}
                            className="rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] px-3 py-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[14px] font-semibold text-foreground">
                                  {ex.name}
                                </p>
                                <p className="text-[11px] text-muted-2">
                                  {ex.sets}× {ex.reps} · {ex.target}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedEx(open ? null : ex.id)
                                }
                                className="shrink-0 text-[11px] font-semibold text-accent hover:underline"
                              >
                                {open ? t("common.hide") : t("pro.alternatives")}
                              </button>
                            </div>
                            {st ? (
                              <p className="mt-2 border-t border-white/6 pt-2 text-[11px] leading-snug text-muted">
                                {suggestProgressionCopy(
                                  program.progressionMode,
                                  st,
                                  loc === "en" ? "en" : "fi",
                                )}
                              </p>
                            ) : null}
                            {open ? (
                              <ul className="mt-2 space-y-1.5 border-t border-white/6 pt-2">
                                {ex.alternatives.map((a) => (
                                  <li
                                    key={a.id}
                                    className="text-[12px] leading-snug text-muted"
                                  >
                                    <span className="font-medium text-foreground/90">
                                      {a.name}
                                    </span>
                                    {" — "}
                                    {loc === "en" ? a.reasonEn : a.reasonFi}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {workspace.mealPlan ? (
          <section className="mt-8" aria-labelledby="pro-meals">
            <h2 id="pro-meals" className="coach-section-label px-1">
              {t("pro.sectionMealRhythm")}
            </h2>
            <div className="coach-panel-subtle mt-3 px-4 py-4">
              <p className="text-[11px] text-muted-2">
                {t("pro.mealMeta", {
                  n: workspace.mealPlan.mealCount,
                  adj: workspace.mealPlan.adjustmentMode,
                })}
              </p>
              <ul className="mt-3 space-y-2">
                {workspace.mealPlan.structure.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex flex-col rounded-[var(--radius-md)] border border-white/6 bg-white/[0.03] px-3 py-2 text-[13px]"
                  >
                    <span className="font-semibold text-foreground">
                      {slot.label}
                    </span>
                    {slot.timing ? (
                      <span className="text-[11px] text-muted-2">
                        {slot.timing}
                      </span>
                    ) : null}
                    <span className="text-[11px] text-muted">
                      {slot.targetStyle}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-2">
                {t("pro.mealCoachStub")}
              </p>
            </div>
          </section>
        ) : null}

        <section className="mt-8" aria-labelledby="pro-ai">
          <h2 id="pro-ai" className="coach-section-label px-1">
            {t("pro.sectionSuggestion")}
          </h2>
          <div className="coach-panel mt-3 px-4 py-4">
            {workspace.pendingAiSuggestions.length === 0 ? (
              <p className="text-[13px] text-muted">{t("pro.suggestionsEmpty")}</p>
            ) : (
              <ul className="space-y-3">
                {workspace.pendingAiSuggestions.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-[var(--radius-md)] border border-sky-400/25 bg-blue-500/10 px-3 py-3"
                  >
                    <p className="text-[14px] font-semibold text-foreground">
                      {loc === "en" ? s.titleEn : s.titleFi}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted">
                      {loc === "en" ? s.detailEn : s.detailFi}
                    </p>
                    <button
                      type="button"
                      onClick={() => acceptSuggestion(s)}
                      className="mt-3 text-[12px] font-semibold text-accent hover:underline"
                    >
                      {t("pro.acceptSuggestion")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="pro-progress">
          <h2 id="pro-progress" className="coach-section-label px-1">
            {t("pro.sectionProgress")}
          </h2>
          <div className="coach-panel-subtle mt-3 px-4 py-4">
            <ProgressionExampleTable />
            {progressionSummary.length > 0 ? (
              <>
                <ul className="mt-6 space-y-2 border-t border-white/[0.06] pt-5 text-[12px] text-muted">
                  {progressionSummary.slice(0, 8).map(({ dayName, exercise, state }) => (
                    <li key={`${dayName}-${exercise.id}`}>
                      <span className="font-medium text-foreground/90">
                        {dayName}
                      </span>
                      {" · "}
                      {exercise.name}
                      {state?.currentLoad != null
                        ? ` · ${state.currentLoad}${state.loadUnit ?? "kg"}`
                        : ""}
                    </li>
                  ))}
                </ul>
                {progressionSummary.length > 8 ? (
                  <p className="mt-2 text-[11px] text-muted-2">
                    {t("pro.progressTruncated")}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        </section>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-2">
          {t("pro.footer")}
        </p>
      </Container>
    </main>
  );
}
