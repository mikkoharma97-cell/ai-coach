"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { clearMinimumDay, saveMinimumDayForDay } from "@/lib/minimumDayStorage";
import { trackEvent } from "@/lib/analytics";
import { useOverlayLayer } from "@/hooks/useOverlayLayer";
import { useCallback, useEffect, useId, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  dayKey: string;
  /** Kun true, näytetään suoraan sisältö ilman aktivointiaskelta */
  active: boolean;
  onActivated: () => void;
};

export function MinimumDayModal({
  open,
  onClose,
  dayKey,
  active,
  onActivated,
}: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const [step, setStep] = useState<"intro" | "content">("intro");

  useEffect(() => {
    if (!open) return;
    setStep(active ? "content" : "intro");
  }, [open, active]);

  useOverlayLayer(open, onClose);

  const activate = useCallback(() => {
    saveMinimumDayForDay(dayKey);
    trackEvent("minimum_day_activate");
    onActivated();
    setStep("content");
  }, [dayKey, onActivated]);

  const deactivate = useCallback(() => {
    clearMinimumDay();
    onActivated();
    onClose();
  }, [onActivated, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[280] flex items-end justify-center bg-black/65 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top,0px)+2rem)] sm:items-center sm:pb-8"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[min(90vh,36rem)] w-full max-w-md overflow-y-auto rounded-[var(--radius-xl)] border border-white/[0.12] bg-[var(--background)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      >
        {step === "intro" && !active ? (
          <>
            <h2
              id={titleId}
              className="text-[15px] font-semibold leading-snug text-foreground"
            >
              {t("today.minimumDayModalTitle")}
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              {t("today.minimumDayModalIntro")}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] rounded-[var(--radius-md)] border border-white/[0.12] bg-white/[0.06] px-4 text-[13px] font-semibold text-foreground transition hover:border-accent/40"
              >
                {t("today.completeModalCancel")}
              </button>
              <button
                type="button"
                onClick={activate}
                className="min-h-[48px] rounded-[var(--radius-md)] border border-accent/40 bg-accent/15 px-4 text-[13px] font-semibold text-accent transition hover:border-accent/60 hover:bg-accent/25"
              >
                {t("today.minimumDayModalActivate")}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
              {t("today.minimumDayBadge")}
            </p>
            <h2
              id={titleId}
              className="mt-2 text-[17px] font-semibold leading-snug tracking-[-0.03em] text-foreground"
            >
              {t("today.minimumDayHeadline10")}
            </h2>
            <p className="mt-2 text-[14px] font-medium leading-snug text-muted">
              {t("today.minimumDayEnoughToday")}
            </p>
            <p className="mt-4 text-[12px] leading-relaxed text-muted-2">
              {t("today.minimumDayNoGuilt")}
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-[13px] font-medium leading-snug text-foreground/95">
              <li>{t("today.minimumDayMove1")}</li>
              <li>{t("today.minimumDayMove2")}</li>
              <li>{t("today.minimumDayMove3")}</li>
            </ul>
            <p className="mt-4 text-[12px] leading-relaxed text-muted">
              {t("today.minimumDayAlt")}
            </p>
            <p className="mt-5 rounded-[var(--radius-md)] border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-[12px] leading-snug text-muted">
              <span className="font-semibold text-foreground/90">
                {t("today.minimumDayFoodLabel")}
              </span>{" "}
              {t("today.minimumDayFoodBody")}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] rounded-[var(--radius-md)] border border-accent/35 bg-accent/10 px-4 text-[13px] font-semibold text-accent transition hover:border-accent/55"
              >
                {t("today.minimumDayClose")}
              </button>
              {active ? (
                <button
                  type="button"
                  onClick={deactivate}
                  className="min-h-[48px] rounded-[var(--radius-md)] border border-white/[0.12] bg-transparent px-4 text-[13px] font-medium text-muted transition hover:text-foreground"
                >
                  {t("today.minimumDayClear")}
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
