"use client";

import { useTranslation } from "@/hooks/useTranslation";
import type { NutritionLibraryEntry } from "@/types/nutritionLibrary";

type Props = {
  entry: NutritionLibraryEntry;
  onClose: () => void;
};

function proteinLabel(
  bias: NutritionLibraryEntry["proteinBias"],
  fi: boolean,
): string {
  if (bias === "very_high") return fi ? "Hyvin korkea" : "Very high";
  if (bias === "high") return fi ? "Korkea" : "High";
  return fi ? "Tasainen" : "Standard";
}

export function NutritionContentPreviewSheet({ entry, onClose }: Props) {
  const { t, locale } = useTranslation();
  const fi = locale === "fi";

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[210] flex items-end justify-center bg-black/60 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-12 sm:items-center"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nutrition-preview-title"
        className="max-h-[min(88vh,40rem)] w-full max-w-md overflow-y-auto rounded-t-[var(--radius-2xl)] border border-border/80 bg-card shadow-[var(--shadow-float)] sm:rounded-[var(--radius-xl)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border/60 px-5 py-4">
          <p
            id="nutrition-preview-title"
            className="text-[1.05rem] font-semibold leading-tight tracking-[-0.02em] text-foreground"
          >
            {fi ? entry.nameFi : entry.nameEn}
          </p>
          <p className="mt-2 text-[13px] leading-snug text-muted">
            {fi ? entry.shortDescriptionFi : entry.shortDescriptionEn}
          </p>
          <dl className="mt-4 space-y-2 text-[12px] leading-snug text-muted-2">
            <div className="flex justify-between gap-3">
              <dt className="shrink-0 font-medium text-muted">{t("nutritionPreview.meals")}</dt>
              <dd className="text-right tabular-nums">{entry.mealsPerDay}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="shrink-0 font-medium text-muted">{t("nutritionPreview.proteinBias")}</dt>
              <dd className="text-right">{proteinLabel(entry.proteinBias, fi)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="shrink-0 font-medium text-muted">{t("nutritionPreview.goalFit")}</dt>
              <dd className="text-right">{fi ? entry.idealForFi : entry.idealForEn}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="shrink-0 font-medium text-muted">{t("nutritionPreview.shift")}</dt>
              <dd className="text-right">
                {entry.shiftCompatible
                  ? t("nutritionPreview.shiftOk")
                  : t("nutritionPreview.shiftLimited")}
              </dd>
            </div>
          </dl>
        </div>

        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("nutritionPreview.exampleDay")}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/95">
            {fi
              ? `${entry.mealsPerDay} ateriaa, proteiinipainotus: ${proteinLabel(entry.proteinBias, true).toLowerCase()}. ${entry.shortDescriptionFi}`
              : `${entry.mealsPerDay} meals, protein emphasis: ${proteinLabel(entry.proteinBias, false).toLowerCase()}. ${entry.shortDescriptionEn}`}
          </p>
          <p className="mt-3 text-[12px] leading-snug text-muted">
            {fi ? entry.idealForFi : entry.idealForEn}
          </p>
        </div>

        <div className="border-t border-border/60 px-5 py-4">
          <button
            type="button"
            className="min-h-[48px] w-full rounded-[var(--radius-lg)] bg-accent px-4 text-[15px] font-semibold text-white"
            onClick={onClose}
          >
            {t("programPreview.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
