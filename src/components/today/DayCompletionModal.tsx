"use client";

import { useTranslation } from "@/hooks/useTranslation";
import type { DayExecutionChecklist } from "@/lib/dayExecutionStorage";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Tallenna + merkitse päivä — synkroninen */
  onCommit: (checklist: Omit<DayExecutionChecklist, "savedAt">) => void;
};

export function DayCompletionModal({ open, onClose, onCommit }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<"form" | "done">("form");
  const [workout, setWorkout] = useState(true);
  const [eaten, setEaten] = useState(true);
  const [rhythm, setRhythm] = useState(true);

  useEffect(() => {
    if (open) {
      setStep("form");
      setWorkout(true);
      setEaten(true);
      setRhythm(true);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = useCallback(() => {
    onCommit({ workout, eaten, rhythm });
    setStep("done");
  }, [onCommit, workout, eaten, rhythm]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-12 sm:items-center sm:pb-8"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[min(90vh,32rem)] w-full max-w-md overflow-y-auto rounded-[var(--radius-xl)] border border-white/[0.12] bg-[var(--background)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      >
        {step === "form" ? (
          <>
            <h2
              id={titleId}
              className="text-[15px] font-semibold leading-snug text-foreground"
            >
              {t("today.completeModalTitle")}
            </h2>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="dc-workout"
                  checked={workout}
                  onChange={(e) => setWorkout(e.target.checked)}
                  className="size-5 shrink-0 rounded border-border accent-accent"
                />
                <label htmlFor="dc-workout" className="text-[14px] font-medium text-foreground/95">
                  {t("today.completeCheckWorkout")}
                </label>
              </li>
              <li className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="dc-eaten"
                  checked={eaten}
                  onChange={(e) => setEaten(e.target.checked)}
                  className="size-5 shrink-0 rounded border-border accent-accent"
                />
                <label htmlFor="dc-eaten" className="text-[14px] font-medium text-foreground/95">
                  {t("today.completeCheckEaten")}
                </label>
              </li>
              <li className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="dc-rhythm"
                  checked={rhythm}
                  onChange={(e) => setRhythm(e.target.checked)}
                  className="size-5 shrink-0 rounded border-border accent-accent"
                />
                <label htmlFor="dc-rhythm" className="text-[14px] font-medium text-foreground/95">
                  {t("today.completeCheckRhythm")}
                </label>
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] rounded-[var(--radius-lg)] border border-white/[0.14] px-4 text-[14px] font-semibold text-muted transition hover:bg-white/[0.06]"
              >
                {t("today.completeModalCancel")}
              </button>
              <button
                type="button"
                onClick={submit}
                className="min-h-[48px] rounded-[var(--radius-lg)] bg-accent px-4 text-[14px] font-semibold text-white shadow-[var(--shadow-primary-cta)]"
              >
                {t("today.completeModalSubmit")}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[16px] font-semibold leading-snug text-foreground">
              {t("today.completeFeedback")}
            </p>
            <p className="mt-2 text-[13px] leading-snug text-muted-2">
              {t("today.completeFeedbackSub")}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 min-h-[48px] w-full rounded-[var(--radius-lg)] bg-accent py-3 text-[14px] font-semibold text-white"
            >
              {t("today.completeModalDone")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
