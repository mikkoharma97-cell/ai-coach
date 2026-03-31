"use client";

import { useTranslation } from "@/hooks/useTranslation";

const ROWS = [
  { week: 1, sets: 3, reps: 12, load: "light" as const },
  { week: 2, sets: 3, reps: 10, load: "up" as const },
  { week: 3, sets: 4, reps: 8, load: "up" as const },
  { week: 4, sets: 4, reps: 6, load: "up" as const },
];

/**
 * Viikkokohtainen esimerkkiprogressio (viikko → setit → toistot → kuorma).
 * Visuaalinen viite: tumma tausta, vain vaakaviivat.
 */
export function ProgressionExampleTable() {
  const { t } = useTranslation();

  return (
    <div className="mt-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">
        {t("pro.progressionExampleLabel")}
      </p>
      <div
        className="mt-3 overflow-x-auto rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.02]"
        role="region"
        aria-label={t("pro.progressionExampleAria")}
      >
        <table className="w-full min-w-[280px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-eyebrow)]">
                {t("pro.progressionColWeek")}
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-eyebrow)]">
                {t("pro.progressionColSets")}
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-eyebrow)]">
                {t("pro.progressionColReps")}
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-eyebrow)]">
                {t("pro.progressionColLoad")}
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.week}
                className="border-b border-white/[0.06] last:border-b-0"
              >
                <td className="px-3 py-2.5 font-medium tabular-nums text-foreground">
                  {row.week}
                </td>
                <td className="px-3 py-2.5 tabular-nums text-[color:var(--text-body)]">
                  {row.sets}
                </td>
                <td className="px-3 py-2.5 tabular-nums text-[color:var(--text-body)]">
                  {row.reps}
                </td>
                <td className="px-3 py-2.5 text-[color:var(--text-body)]">
                  {row.load === "light" ? (
                    <span className="text-muted">{t("pro.progressionLoadLight")}</span>
                  ) : (
                    <span
                      className="font-semibold text-accent"
                      aria-label={t("pro.progressionLoadUpAria")}
                    >
                      ↑
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] font-medium leading-snug text-muted-2">
        <span aria-hidden className="mr-1.5 inline-block">
          👉
        </span>
        {t("pro.progressionAutoFooter")}
      </p>
    </div>
  );
}
