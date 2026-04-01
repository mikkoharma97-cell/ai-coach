"use client";

import { appendDailyActivity } from "@/lib/activityStorage";
import { trackEvent } from "@/lib/analytics";
import { useCoachVoiceInput } from "@/hooks/useCoachVoiceInput";
import type { MessageKey } from "@/lib/i18n";
import type { DailyActivity } from "@/types/activity";
import { useAsyncButtonState } from "@/hooks/useAsyncButtonState";
import { useTranslation } from "@/hooks/useTranslation";
import { useCallback, useEffect, useState } from "react";

const TYPES: DailyActivity["type"][] = [
  "walk",
  "dog_walk",
  "cycling",
  "active_work",
  "other",
];

const INTENSITIES: DailyActivity["intensity"][] = [
  "light",
  "moderate",
  "hard",
];

type Props = {
  dateKey: string;
  /** Mikrofonipikakirjaus (Web Speech) — sama perhe kuin treenissä */
  showVoice?: boolean;
};

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
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

function ActivityVoiceMic({
  dateKey,
  onLogged,
}: {
  dateKey: string;
  onLogged: () => void;
}) {
  const { t, locale } = useTranslation();
  const voice = useCoachVoiceInput({
    locale: locale === "en" ? "en" : "fi",
    onParsed: (result) => {
      if (result.kind !== "activity") return;
      appendDailyActivity(dateKey, {
        type: result.type,
        durationMin: result.durationMin,
        intensity: result.intensity,
      });
      trackEvent("log_activity");
      trackEvent("add_activity");
      onLogged();
    },
  });

  return (
    <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-md)] border border-white/[0.08] bg-black/20 px-3 py-2">
      <button
        type="button"
        disabled={!voice.supported}
        onClick={() =>
          voice.isListening ? voice.stopListening() : voice.startListening()
        }
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
          voice.supported
            ? voice.isListening
              ? "bg-accent text-[var(--coach-bg)]"
              : "bg-white/[0.08] text-foreground"
            : "cursor-not-allowed opacity-40"
        }`}
        aria-pressed={voice.isListening}
        title={
          voice.supported
            ? t("voice.quick.activityHint")
            : t("workout.voice.unsupported")
        }
      >
        <MicIcon className="h-4 w-4" />
      </button>
      <p className="min-w-0 flex-1 text-[11px] leading-snug text-muted-2">
        {voice.isListening
          ? t("voice.quick.listening")
          : t("voice.quick.activityExamples")}
      </p>
    </div>
  );
}

export function DailyActivityInput({ dateKey, showVoice = false }: Props) {
  const { t } = useTranslation();
  const [type, setType] = useState<DailyActivity["type"]>("walk");
  /** Merkkijono — ei Number('')→0 -bugia; tyhjä sallittu */
  const [durationStr, setDurationStr] = useState("25");
  const [intensity, setIntensity] =
    useState<DailyActivity["intensity"]>("moderate");
  const [ack, setAck] = useState(false);
  const addActivity = useAsyncButtonState({ name: "DailyActivityInput.add" });

  useEffect(() => {
    let tId: ReturnType<typeof setTimeout> | undefined;
    if (ack) {
      tId = setTimeout(() => setAck(false), 4500);
    }
    return () => {
      if (tId) clearTimeout(tId);
    };
  }, [ack]);

  const onAdd = useCallback(() => {
    const trimmed = durationStr.trim();
    const n = trimmed === "" ? NaN : Number(trimmed);
    if (!Number.isFinite(n) || n < 0 || n > 600) return;
    void addActivity.run(async () => {
      try {
        appendDailyActivity(dateKey, {
          type,
          durationMin: Math.max(0, Math.round(n)),
          intensity,
        });
        trackEvent("log_activity");
        trackEvent("add_activity");
        setAck(true);
      } catch (e) {
        console.error("[DailyActivityInput]", e);
        throw e;
      }
    });
  }, [addActivity, dateKey, type, durationStr, intensity]);

  const durationOk = (() => {
    const trimmed = durationStr.trim();
    if (trimmed === "") return false;
    const n = Number(trimmed);
    return Number.isFinite(n) && n >= 0 && n <= 600;
  })();

  const typeKey = (x: DailyActivity["type"]): MessageKey =>
    `activity.type.${x}` as MessageKey;

  const intKey = (x: DailyActivity["intensity"]): MessageKey =>
    `activity.intensity.${x}` as MessageKey;

  return (
    <div className="rounded-[var(--radius-lg)] border border-white/[0.1] bg-white/[0.04] px-4 py-4 sm:px-5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-2">
        {t("today.extraMoveSection")}
      </p>
      <h3 className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-foreground">
        {t("activity.inputTitle")}
      </h3>

      {showVoice ? (
        <ActivityVoiceMic dateKey={dateKey} onLogged={() => setAck(true)} />
      ) : null}

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setType(k)}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                  type === k
                    ? "border-accent/80 bg-accent/15 text-foreground"
                    : "border-border/60 bg-white/[0.03] text-muted hover:border-border"
                }`}
              >
                {t(typeKey(k))}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-2">
            {t("activity.duration")}
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={durationStr}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") {
                setDurationStr("");
                return;
              }
              if (!/^\d+$/.test(v)) return;
              if (v.length > 3) return;
              setDurationStr(v);
            }}
            className="mt-1.5 w-full rounded-[var(--radius-md)] border border-border/50 bg-white/[0.06] px-3 py-2.5 text-[15px] font-medium text-foreground outline-none ring-0 focus:border-accent/50"
          />
        </label>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-2">
            {t("activity.intensityLabel")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTENSITIES.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setIntensity(k)}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                  intensity === k
                    ? "border-accent/80 bg-accent/15 text-foreground"
                    : "border-border/60 bg-white/[0.03] text-muted hover:border-border"
                }`}
              >
                {t(intKey(k))}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={addActivity.loading || !durationOk}
          className="coach-today-cta-primary mt-2 min-h-[48px] w-full text-[12px] font-semibold uppercase tracking-[0.12em] disabled:opacity-60"
        >
          {addActivity.loading ? t("common.loading") : t("activity.add")}
        </button>

        {ack ? (
          <p
            className="text-center text-[12px] font-medium text-accent/95"
            role="status"
          >
            {t("activity.ack")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
