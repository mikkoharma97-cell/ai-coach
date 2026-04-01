"use client";

import { useOverlayLayer } from "@/hooks/useOverlayLayer";
import type { MealOption } from "@/lib/mealEngine";
import type { TranslateFn } from "@/lib/i18n";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  slotLabel: string;
  current: MealOption;
  candidates: MealOption[];
  onPick: (m: MealOption) => void;
  onQuickNext?: () => void;
  onAddOwn: () => void;
  t: TranslateFn;
};

function formatName(name: string): string {
  return name.replace(/,\s*/g, " / ");
}

export function MealSubstituteSheet({
  open,
  onClose,
  slotLabel,
  current,
  candidates,
  onPick,
  onQuickNext,
  onAddOwn,
  t,
}: Props) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  useOverlayLayer(open, onClose);

  if (!ready || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[280] flex touch-manipulation flex-col justify-end"
      role="presentation"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={t("food.cancel")}
        className="absolute inset-0 z-0 cursor-pointer border-0 bg-foreground/35 backdrop-blur-[4px] p-0 [touch-action:none]"
        onClick={onClose}
      />
      <div
        className="relative z-[281] mt-auto max-h-[88dvh] w-full overflow-y-auto overscroll-contain rounded-t-[var(--radius-2xl)] border border-border/80 bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 shadow-[var(--shadow-float)] pointer-events-auto [-webkit-overflow-scrolling:touch]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meal-substitute-title"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-strong/80" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">
          {slotLabel}
        </p>
        <h2
          id="meal-substitute-title"
          className="mt-2 text-[1.125rem] font-semibold tracking-[-0.02em] text-foreground"
        >
          {t("food.substituteSheetTitle")}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          {t("food.substituteSheetLead")}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-2">
          {t("food.substituteSheetMacroNote")}
        </p>

        {onQuickNext ? (
          <button
            type="button"
            onClick={onQuickNext}
            className="mt-3 w-full min-h-[40px] rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] px-3 text-[12px] font-semibold text-muted-2 transition hover:border-accent/35 hover:text-foreground"
          >
            {t("food.substituteQuickNext")}
          </button>
        ) : null}

        <div className="mt-4 space-y-2">
          {candidates.length === 0 ? (
            <p className="rounded-[var(--radius-lg)] border border-border/50 bg-surface-subtle/40 px-4 py-3 text-[13px] text-muted">
              {t("food.substituteNoAlternatives")}
            </p>
          ) : (
            candidates.map((m) => (
              <button
                key={m.templateId ?? m.name}
                type="button"
                onClick={() => onPick(m)}
                className="flex w-full flex-col items-start gap-1 rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-left transition hover:border-accent/40 hover:bg-accent-soft/20"
              >
                <span className="text-[14px] font-semibold leading-snug text-foreground">
                  {formatName(m.name)}
                </span>
                <span className="text-[12px] tabular-nums font-medium text-muted">
                  {t("food.macroCoachApprox", {
                    kcal: m.calories.toLocaleString(),
                    p: m.protein,
                  })}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="mt-6 border-t border-border/40 pt-5">
          <button
            type="button"
            onClick={onAddOwn}
            className="w-full min-h-[48px] rounded-[var(--radius-lg)] border-2 border-dashed border-accent/35 bg-transparent px-4 text-[14px] font-semibold text-accent transition hover:border-accent/55 hover:bg-accent/10"
          >
            {t("food.substituteAddOwn")}
          </button>
          <p className="mt-2 text-center text-[11px] text-muted-2">
            {t("food.substituteAddOwnHint")}
          </p>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-2">
          {t("food.substituteCurrentHint", {
            name: formatName(current.name),
          })}
        </p>
      </div>
    </div>,
    document.body,
  );
}
