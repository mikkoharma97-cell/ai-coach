"use client";

import type { MessageKey, TranslateFn } from "@/lib/i18n";
import type { MealOption } from "@/lib/mealEngine";
import type { FoodLogItem } from "@/types/coach";

export type MealSlotWeight = "lead" | "mid" | "light";

function formatMealDisplayLine(name: string): string {
  return name.replace(/,\s*/g, " / ");
}

type Props = {
  slotLabel: string;
  /** 1-based index in today’s meal list (e.g. “Ateria 2 — …”). */
  mealOrdinal: number;
  mealSubtitleKey: MessageKey;
  /** When set, replaces “Ateria n” copy with day-part flow (AAMU / PÄIVÄ / ILTA). */
  flowCaption?: { title: string; sub: string };
  /** First = anchor, second = softer, third+ = light */
  slotWeight?: MealSlotWeight;
  /** Legacy anchor label — prefer showDefaultBadge for first meal. */
  showAnchorTag?: boolean;
  /** First meal in the list = obvious system default. */
  showDefaultBadge?: boolean;
  /** Rule-based “why this” line (translated string) */
  whyLine: string;
  logItems: FoodLogItem[];
  current: MealOption | null;
  /** Korvaava ateria — lista + tallennus */
  onSubstitute?: () => void;
  /** Prefill from suggestion when the slot has no log yet */
  onAdd: (prefill: MealOption | null) => void;
  onRemoveLog: (id: string) => void;
  /** When this slot has a log — show “next meal” hint (not on last slot of the day). */
  isLastMealSlot?: boolean;
  /** Hours until typical next meal (rule-based, not clock math). */
  hoursToNextMeal?: number;
  t: TranslateFn;
};

function shellClass(w: MealSlotWeight): string {
  if (w === "lead") return "coach-meal-decision coach-meal-decision--lead";
  if (w === "mid") return "coach-meal-decision coach-meal-decision--mid";
  return "coach-meal-decision coach-meal-decision--calm";
}

function surfaceMod(w: MealSlotWeight): string {
  if (w === "light") return "coach-meal-system-surface--calm";
  if (w === "mid") return "coach-meal-system-surface--mid";
  return "";
}

/**
 * Decision block: slot → system recommendation surface → actions (swap / add).
 */
export function FoodMealSlotBlock({
  slotLabel,
  mealOrdinal,
  mealSubtitleKey,
  flowCaption,
  slotWeight = "mid",
  showAnchorTag,
  showDefaultBadge,
  whyLine,
  logItems,
  current,
  onSubstitute,
  onAdd,
  onRemoveLog,
  isLastMealSlot = false,
  hoursToNextMeal = 3,
  t,
}: Props) {
  const hasLog = logItems.length > 0;
  const sm = surfaceMod(slotWeight);

  return (
    <div className={shellClass(slotWeight)}>
      <header className="flex items-baseline justify-between gap-2">
        <div>
          <span className="sr-only">{slotLabel}</span>
          {showDefaultBadge ? (
            <div className="mt-1.5">
              <span className="inline-flex w-fit rounded-full border border-accent/45 bg-accent/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                {t("food.defaultMealBadge")}
              </span>
              <p className="mt-2 text-[12px] font-semibold leading-snug text-foreground">
                {t("food.eatThisFirst")}
              </p>
            </div>
          ) : showAnchorTag ? (
            <span className="mt-1.5 inline-flex w-fit rounded-full border border-accent/45 bg-accent-soft/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-accent shadow-sm">
              {t("food.anchorTag")}
            </span>
          ) : null}
        </div>
      </header>

      {current ? (
        <div
          className={`coach-meal-system-surface mt-3 ${
            hasLog ? "opacity-95" : ""
          } ${sm}`}
        >
          <p className="text-[13px] font-semibold leading-snug text-accent">
            {t("food.systemRecommendation")}
          </p>
          {flowCaption ? (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
                {flowCaption.title}
              </p>
              <p className="mt-1 text-[11px] font-medium leading-snug text-muted">
                {flowCaption.sub}
              </p>
            </>
          ) : (
            <p className="mt-1.5 text-[13px] font-medium leading-snug text-foreground">
              {t(mealSubtitleKey, { n: mealOrdinal })}
            </p>
          )}
          <p
            className={`mt-2 font-medium leading-snug tracking-[-0.02em] text-foreground ${
              slotWeight === "lead"
                ? "text-[1.0625rem] sm:text-[1.125rem]"
                : slotWeight === "light"
                  ? "text-[0.9375rem] text-muted"
                  : "text-[1rem]"
            }`}
          >
            {formatMealDisplayLine(current.name)}
          </p>
          {(current.swapHints?.length ?? 0) > 0 ? (
            <div className="mt-2.5 rounded-[var(--radius-md)] border border-white/10 bg-white/[0.05] px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                {t("food.swapHeading")}
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] font-medium leading-snug text-muted">
                {(current.swapHints ?? []).map((s, idx) => (
                  <li key={`${s.from}-${s.to}-${idx}`}>
                    {t("food.swapLine", { from: s.from, to: s.to })}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="mt-2 text-[12px] tabular-nums font-medium text-muted">
            {t("food.macroCoachApprox", {
              kcal: current.calories.toLocaleString(),
              p: current.protein,
            })}
          </p>
          {(current.tasteLabels?.length ?? 0) > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(current.tasteLabels ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-3 border-t border-border/35 pt-3 text-[11px] font-medium leading-relaxed text-muted-2">
            {whyLine}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onAdd(hasLog ? null : current)}
              className="min-h-[44px] w-full rounded-2xl bg-accent px-4 text-[13px] font-semibold text-white shadow-[0_8px_24px_-6px_rgb(42_92_191/0.45)] transition hover:scale-[0.99] hover:bg-[var(--accent-hover)] active:scale-[0.98]"
            >
              {hasLog ? t("food.add") : t("food.eatThis")}
            </button>
            {onSubstitute ? (
              <button
                type="button"
                onClick={onSubstitute}
                className="mx-auto inline-flex min-h-[36px] max-w-full items-center justify-center rounded-full border border-white/10 bg-transparent px-3.5 py-1.5 text-[12px] font-semibold text-muted-2 transition hover:border-accent/30 hover:text-accent active:scale-[0.99]"
                title={t("food.substituteSheetTitle")}
              >
                {t("food.substituteCta")}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          className={`coach-meal-system-surface mt-3 border-dashed border-border/70 bg-surface-subtle/50 ${sm}`}
        >
          <p className="text-[13px] leading-snug text-muted-2">
            {t("food.noSuggestion")}
          </p>
          <button
            type="button"
            onClick={() => onAdd(null)}
            className="mt-4 w-full min-h-[44px] rounded-2xl bg-accent px-4 text-[13px] font-semibold text-white shadow-[0_8px_24px_-6px_rgb(42_92_191/0.45)] transition hover:scale-[0.99] hover:bg-[var(--accent-hover)] active:scale-[0.98]"
          >
            {t("food.add")}
          </button>
        </div>
      )}

      {hasLog ? (
        <div className="mt-4 border-t border-border/40 pt-3">
          <div className="mb-3 rounded-[var(--radius-md)] border border-accent/25 bg-accent-soft/35 px-3 py-2.5">
            <p className="text-[13px] font-semibold leading-snug text-foreground">
              <span className="mr-1.5 text-accent" aria-hidden>
                ✔
              </span>
              {t("food.mealDone")}
            </p>
            <p className="mt-1.5 flex gap-2 text-[12px] font-medium leading-snug text-muted">
              <span className="shrink-0 text-accent" aria-hidden>
                →
              </span>
              <span>
                {isLastMealSlot
                  ? t("food.nextMealTomorrow")
                  : t("food.nextMealInHours", { hours: hoursToNextMeal })}
              </span>
            </p>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("food.loggedBlock")}
          </p>
          <ul className="mt-2 space-y-2">
            {logItems.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 text-[13px]"
              >
                <span className="min-w-0 flex-1 leading-snug text-muted">
                  {row.label}
                </span>
                <span className="shrink-0 tabular-nums text-foreground">
                  {row.kcal}
                </span>
                <button
                  type="button"
                  className="shrink-0 text-[12px] font-medium text-muted-2 underline-offset-2 hover:text-foreground hover:underline"
                  onClick={() => onRemoveLog(row.id)}
                >
                  {t("food.remove")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
