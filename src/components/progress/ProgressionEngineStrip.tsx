"use client";

import type { ProgressionTriState } from "@/lib/coach/fullProgressionEngine";
import { useTranslation } from "@/hooks/useTranslation";
import type { MessageKey } from "@/lib/i18n";

function stateKey(s: ProgressionTriState): MessageKey {
  if (s === "increase") return "progression.state.increase";
  if (s === "reduce") return "progression.state.reduce";
  return "progression.state.hold";
}

type Col = {
  labelKey:
    | "progression.pillarFood"
    | "progression.pillarActivity"
    | "progression.pillarTraining";
  state: ProgressionTriState;
};

export function ProgressionEngineStrip({
  food,
  activity,
  training,
  className = "",
}: {
  food: ProgressionTriState;
  activity: ProgressionTriState;
  training: ProgressionTriState;
  className?: string;
}) {
  const { t } = useTranslation();
  const cols: Col[] = [
    { labelKey: "progression.pillarFood", state: food },
    { labelKey: "progression.pillarActivity", state: activity },
    { labelKey: "progression.pillarTraining", state: training },
  ];

  return (
    <section
      className={className}
      aria-labelledby="progression-engine-heading"
    >
      <p
        id="progression-engine-heading"
        className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2"
      >
        {t("progression.engineEyebrow")}
      </p>
      <ul className="mt-2 grid grid-cols-3 gap-2">
        {cols.map((c) => (
          <li
            key={c.labelKey}
            className="rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.03] px-2 py-2.5 text-center"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
              {t(c.labelKey)}
            </p>
            <p className="mt-1 text-[13px] font-semibold tabular-nums text-foreground">
              {t(stateKey(c.state))}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] leading-snug text-muted-2">
        {t("progression.engineHint")}
      </p>
    </section>
  );
}
