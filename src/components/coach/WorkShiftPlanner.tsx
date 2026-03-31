"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { calendarDayKey } from "@/lib/dateKeys";
import type { MessageKey } from "@/lib/i18n";
import { dateLocaleForUi } from "@/lib/i18n";
import { saveProfile } from "@/lib/storage";
import {
  loadWorkShifts,
  normalizeShiftDateKey,
  saveWorkShifts,
  WORK_SHIFTS_CHANGED,
} from "@/lib/workShiftStorage";
import type { OnboardingAnswers } from "@/types/coach";
import type { WorkShiftEntry, WorkShiftType } from "@/types/workShifts";
import { useCallback, useEffect, useMemo, useState } from "react";

const TYPES: WorkShiftType[] = ["morning", "evening", "night", "off"];

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function buildWeekRows(
  ref: Date,
  existing: WorkShiftEntry[],
): { dateKey: string; shiftType: WorkShiftType }[] {
  const byKey = new Map(
    existing.map((e) => [normalizeShiftDateKey(e.date), e.shiftType]),
  );
  const out: { dateKey: string; shiftType: WorkShiftType }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(ref, i);
    const dateKey = calendarDayKey(d);
    const st = byKey.get(dateKey) ?? "off";
    out.push({ dateKey, shiftType: st });
  }
  return out;
}

function rowsToEntries(
  rows: { dateKey: string; shiftType: WorkShiftType }[],
): WorkShiftEntry[] {
  return rows.map((r) => ({ date: r.dateKey, shiftType: r.shiftType }));
}

type Props = {
  profile: OnboardingAnswers;
};

export function WorkShiftPlanner({ profile }: Props) {
  const { t, locale } = useTranslation();
  const [now] = useState(() => new Date());
  const [rows, setRows] = useState(() =>
    buildWeekRows(now, loadWorkShifts()),
  );
  const [savedFlash, setSavedFlash] = useState(false);

  const bump = useCallback(() => {
    setRows(buildWeekRows(now, loadWorkShifts()));
  }, [now]);

  useEffect(() => {
    window.addEventListener(WORK_SHIFTS_CHANGED, bump);
    return () => window.removeEventListener(WORK_SHIFTS_CHANGED, bump);
  }, [bump]);

  const loc = dateLocaleForUi(locale);

  const dayLabels = useMemo(() => {
    return rows.map((r) => {
      const [y, m, d] = r.dateKey.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      const wd = dt.toLocaleDateString(loc, { weekday: "short" });
      const md = dt.toLocaleDateString(loc, { month: "numeric", day: "numeric" });
      const w =
        wd.length > 0 ? wd.charAt(0).toUpperCase() + wd.slice(1) : wd;
      return `${w} ${md}`;
    });
  }, [rows, loc]);

  const onPick = (dateKey: string, shiftType: WorkShiftType) => {
    setRows((prev) =>
      prev.map((r) =>
        r.dateKey === dateKey ? { ...r, shiftType } : r,
      ),
    );
  };

  const onSave = () => {
    const entries = rowsToEntries(rows);
    saveWorkShifts(entries, { shiftMode: true });
    try {
      saveProfile({
        ...profile,
        shiftMode: true,
        workShifts: entries,
        lifeSchedule: profile.lifeSchedule ?? "shift_work",
      });
    } catch {
      /* ignore */
    }
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2500);
  };

  return (
    <section
      className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] px-4 py-4"
      aria-labelledby="work-shift-planner-title"
    >
      <h2
        id="work-shift-planner-title"
        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2"
      >
        {t("shift.plannerTitle")}
      </h2>
      <p className="mt-1.5 text-[12px] leading-snug text-muted-2">
        {t("shift.plannerHint")}
      </p>

      <ul className="mt-4 space-y-3">
        {rows.map((r, i) => (
          <li
            key={r.dateKey}
            className="rounded-[var(--radius-lg)] border border-border/50 bg-background/40 px-3 py-2.5"
          >
            <p className="text-[12px] font-semibold text-foreground/95">
              {dayLabels[i]}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TYPES.map((type) => {
                const selected = r.shiftType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onPick(r.dateKey, type)}
                    className={`min-h-[44px] rounded-[var(--radius-md)] border px-1.5 text-center text-[11px] font-semibold leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring ${
                      selected
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-border/70 bg-card/50 text-muted hover:border-accent/35"
                    }`}
                  >
                    {t(`shift.type.${type}` as MessageKey)}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSave}
        className="mt-4 min-h-[48px] w-full rounded-[var(--radius-lg)] bg-accent py-3 text-[14px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)]"
      >
        {t("shift.save")}
      </button>
      {savedFlash ? (
        <p className="mt-2 text-center text-[12px] font-medium text-accent" role="status">
          {t("shift.saved")}
        </p>
      ) : null}
    </section>
  );
}
