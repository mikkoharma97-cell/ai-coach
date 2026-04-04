"use client";

import { useEffect, useMemo } from "react";
import {
  hydrateLandingDemoFromStorage,
  updateLandingDemo,
  useLandingDemoSettings,
  type LandingGoal,
  type LandingMealStyle,
  type LandingSessionsPerWeek,
} from "@/lib/landingDemoSettings";
import { buildLandingFakeWeek } from "@/lib/landingFakeWeek";
import { useTranslation } from "@/hooks/useTranslation";
import { Container } from "@/components/ui/Container";

function SettingsChips() {
  const { t } = useTranslation();
  const s = useLandingDemoSettings();

  const chip = (active: boolean) =>
    ({
      padding: "6px 12px",
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 500,
      border: "1px solid",
      borderColor: active ? "var(--accent)" : "rgba(255,255,255,0.12)",
      background: active ? "rgba(59,130,246,0.12)" : "transparent",
      color: active ? "var(--foreground)" : "var(--muted-2)",
      cursor: "pointer",
    }) as const;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="w-full text-[12px] text-muted-2">
        {t("landing.fakeWeekChipsHint")}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {(["muscle", "fat_loss"] as LandingGoal[]).map((g) => (
          <button
            key={g}
            type="button"
            style={chip(s.goal === g)}
            onClick={() => updateLandingDemo({ goal: g })}
          >
            {g === "muscle"
              ? t("landing.demoGoalMuscle")
              : t("landing.demoGoalFat")}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {([3, 4, 5, 6] as LandingSessionsPerWeek[]).map((n) => (
          <button
            key={n}
            type="button"
            style={chip(s.sessionsPerWeek === n)}
            onClick={() => updateLandingDemo({ sessionsPerWeek: n })}
          >
            {n}× /vk
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["light", "landing.demoMealLight"],
            ["flexible", "landing.demoMealFlex"],
          ] as const
        ).map(([m, key]) => (
          <button
            key={m}
            type="button"
            style={chip(s.mealStyle === m)}
            onClick={() => updateLandingDemo({ mealStyle: m })}
          >
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LandingFakeWeekSection() {
  const { t } = useTranslation();
  const settings = useLandingDemoSettings();
  const week = useMemo(() => buildLandingFakeWeek(settings), [settings]);

  useEffect(() => {
    hydrateLandingDemoFromStorage();
  }, []);

  return (
    <section
      className="border-b border-white/[0.06] bg-[var(--background)] py-12 sm:py-14"
      aria-labelledby="landing-fake-week-heading"
    >
      <Container size="default" className="max-w-[min(100%,26rem)] sm:max-w-2xl">
        <h2
          id="landing-fake-week-heading"
          className="text-center text-[1.125rem] font-semibold tracking-[-0.03em] text-foreground sm:text-[1.2rem]"
        >
          {t("landing.fakeWeekTitle")}
        </h2>
        <p className="mt-2 text-center text-[14px] leading-snug text-muted-2">
          {t("landing.fakeWeekSub")}
        </p>

        <SettingsChips />

        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-5 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("landing.fakeWeekWeekLabel")}
          </p>
          <h3 className="mt-2 text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] text-foreground">
            {week.headline}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-2">{week.sub}</p>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-2">
                {week.highlightMetric}
              </p>
              <p className="mt-1 text-[13px] font-medium leading-snug text-foreground">
                {week.volumeTrendLabel}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-2">
                {week.secondaryMetric}
              </p>
              <p className="mt-1 text-[13px] font-medium leading-snug text-foreground">
                {week.recoveryLabel}
              </p>
            </div>
            <div className="col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-2">
                {t("landing.fakeWeekRhythmFood")}
              </p>
              <p className="mt-1 text-[13px] font-medium leading-snug text-foreground">
                {week.rhythmLabel} · {week.nutritionLabel}
              </p>
            </div>
          </div>

          <div
            className="mt-5 flex justify-between gap-1 border-t border-white/[0.06] pt-4"
            role="list"
            aria-label={t("landing.fakeWeekStripAria")}
          >
            {week.weekDays.map((d) => (
              <div
                key={d.label}
                role="listitem"
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <span className="text-[10px] font-medium text-muted-2">
                  {d.label}
                </span>
                <span className="text-[13px] font-semibold text-foreground">
                  {d.mark === "rest" && "—"}
                  {d.mark === "done" && "✓"}
                  {d.mark === "miss" && "·"}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[12px] text-muted-2">
            {week.completedSessions}/{week.plannedSessions}{" "}
            {t("landing.fakeWeekCaption", {
              n: settings.sessionsPerWeek,
            })}
          </p>
          {week.humanGlitch ? (
            <p className="mt-3 text-center text-[12px] font-medium italic leading-snug text-zinc-400">
              {week.humanGlitch.kind === "miss"
                ? t("landing.fakeWeekHumanMiss", {
                    label: week.humanGlitch.dayLabel,
                  })
                : t("landing.fakeWeekHumanLight", {
                    label: week.humanGlitch.dayLabel,
                  })}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
