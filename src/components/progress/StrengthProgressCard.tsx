"use client";

import { useTranslation } from "@/hooks/useTranslation";
import type { TrendDir } from "@/lib/progress";
import type { MessageKey } from "@/lib/i18n";

function trendKey(dir: TrendDir): MessageKey {
  if (dir === "up") return "progress.trendUp";
  if (dir === "down") return "progress.trendDown";
  return "progress.trendFlat";
}

export function StrengthProgressCard({
  rows,
}: {
  rows: import("@/lib/progress").StrengthRow[];
}) {
  const { t } = useTranslation();
  if (rows.length === 0) {
    return (
      <section className="coach-panel rounded-[var(--radius-xl)] px-4 py-5">
        <p className="progress-section-title px-0">{t("progress.sectionStrength")}</p>
        <p className="mt-3 text-[13px] leading-relaxed text-muted" role="status">
          {t("fallback.firstWeeksBuildView")}
        </p>
      </section>
    );
  }
  const anyLogged = rows.some((r) =>
    r.sessions.some((s) => s.load != null),
  );
  const up = rows.filter((r) => r.trend === "up").length;
  return (
    <section className="coach-panel rounded-[var(--radius-xl)] px-4 py-5">
      <p className="progress-section-title px-0">{t("progress.sectionStrength")}</p>
      {anyLogged ? (
        <p className="mt-2 text-[15px] font-semibold leading-snug text-foreground">
          {t("progress.strengthGlance", { up, total: rows.length })}
        </p>
      ) : (
        <p className="mt-2 text-[12px] leading-snug text-muted-2" role="status">
          {t("fallback.firstWeeksBuildView")}
        </p>
      )}
      <p className="mt-1 text-[12px] leading-snug text-muted-2">
        {t("progress.strengthHint")}
      </p>
      <ul className="mt-4 space-y-4">
        {rows.map((row) => {
          const rowHasLoad = row.sessions.some((s) => s.load != null);
          return (
          <li
            key={row.exerciseId}
            className="rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.025] px-3 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[14px] font-semibold text-foreground">{row.name}</p>
              {rowHasLoad ? (
              <span className="shrink-0 rounded-full border border-accent/30 bg-accent-soft/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                {t(trendKey(row.trend))}
              </span>
              ) : null}
            </div>
            <ol className="mt-3 flex flex-col gap-2">
              {row.sessions.map((s, i) => (
                <li
                  key={`${row.exerciseId}-${i}`}
                  className="rounded-[var(--radius-sm)] border border-white/[0.05] bg-black/20 px-2 py-2 text-center"
                >
                  <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-muted-2">
                    {t("progress.strengthSessionN", { n: i + 1 })}
                  </p>
                  <p className="mt-1 text-[13px] font-semibold tabular-nums text-foreground">
                    {s.load != null ? `${s.load} kg` : "—"}
                  </p>
                  {s.reps != null ? (
                    <p className="text-[11px] text-muted">
                      {t("progress.strengthReps", { n: s.reps })}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted opacity-60"> </p>
                  )}
                </li>
              ))}
            </ol>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
