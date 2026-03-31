"use client";

import { useCoachVoiceInput } from "@/hooks/useCoachVoiceInput";
import { useTranslation } from "@/hooks/useTranslation";
import { trackEvent } from "@/lib/analytics";
import { appendFoodLog } from "@/lib/foodStorage";
import { mergeOutcomeHint } from "@/lib/storage";
import type { CoachVoiceQuickResult } from "@/lib/coachVoiceQuickParse";
import type { MessageKey } from "@/lib/i18n";
import { useCallback } from "react";

type Props = {
  referenceDate: Date;
  onAfter: () => void;
};

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zM11 19h2v2h-2v-2z"
      />
    </svg>
  );
}

export function FoodVoiceQuickBlock({ referenceDate, onAfter }: Props) {
  const { t, locale } = useTranslation();

  const apply = useCallback(
    (r: CoachVoiceQuickResult) => {
      if (r.kind === "food") {
        appendFoodLog(referenceDate, {
          label: r.label,
          kcal: r.kcal,
          slot: r.slot,
        });
        trackEvent("log_food");
        onAfter();
        return;
      }
      if (r.kind === "weight") {
        mergeOutcomeHint(referenceDate, {
          quickNote: t("voice.quick.weightNote", { kg: String(r.kg) }),
        });
        onAfter();
        return;
      }
      if (r.kind === "note") {
        mergeOutcomeHint(referenceDate, { quickNote: r.text });
        onAfter();
      }
    },
    [referenceDate, onAfter, t],
  );

  const voice = useCoachVoiceInput({
    locale: locale === "en" ? "en" : "fi",
    onParsed: (result) => {
      if (
        result.kind === "food" ||
        result.kind === "weight" ||
        result.kind === "note"
      ) {
        apply(result);
      }
    },
  });

  const errKey = voice.lastErrorKey;
  const errLine =
    errKey && errKey !== "aborted"
      ? t(`workout.voice.error.${errKey}` as MessageKey)
      : null;

  const strip = errLine
    ? errLine
    : voice.isListening
      ? t("voice.quick.listening")
      : t("voice.quick.foodHint");

  return (
    <div
      className="mt-4 flex items-start gap-3 rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.03] px-3 py-2.5"
      role="region"
      aria-label={t("voice.quick.regionFood")}
    >
      <button
        type="button"
        disabled={!voice.supported}
        onClick={() =>
          voice.isListening ? voice.stopListening() : voice.startListening()
        }
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
          voice.supported
            ? voice.isListening
              ? "bg-accent text-[var(--coach-bg)]"
              : "bg-white/[0.08] text-foreground hover:bg-white/[0.12]"
            : "cursor-not-allowed bg-white/[0.04] text-muted-2"
        }`}
        aria-pressed={voice.isListening}
        title={
          voice.supported ? t("voice.quick.foodHint") : t("workout.voice.unsupported")
        }
      >
        <MicIcon className="h-[18px] w-[18px]" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium leading-snug text-foreground">
          {strip}
        </p>
        {voice.lastRawTranscript ? (
          <p className="mt-0.5 truncate text-[11px] text-muted-2">
            {voice.lastRawTranscript}
          </p>
        ) : (
          <p className="mt-0.5 text-[11px] leading-snug text-muted-2">
            {t("voice.quick.foodExamples")}
          </p>
        )}
      </div>
    </div>
  );
}
