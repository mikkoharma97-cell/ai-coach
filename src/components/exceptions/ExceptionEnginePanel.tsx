"use client";

import { useTranslation } from "@/hooks/useTranslation";
import {
  EXCEPTION_GROUP_ORDER,
  EXCEPTION_IDS_BY_GROUP,
  resolveExceptionGuidance,
} from "@/lib/coach/exceptionEngine";
import {
  clearActiveException,
  EXCEPTION_STATE_CHANGED,
  loadActiveExceptionForDay,
  saveActiveException,
} from "@/lib/exceptionStorage";
import { dayKeyFromDate } from "@/lib/dateKey";
import type {
  ExceptionId,
  ExceptionSeverity,
} from "@/types/exceptions";
import type { MessageKey } from "@/lib/i18n";
import { useCallback, useEffect, useMemo, useState } from "react";

function labelKey(id: ExceptionId): MessageKey {
  return `exception.label.${id}` as MessageKey;
}

export function ExceptionEnginePanel({ referenceDate }: { referenceDate: Date }) {
  const { t, locale } = useTranslation();
  const dayKey = useMemo(() => dayKeyFromDate(referenceDate), [referenceDate]);
  const [selectedId, setSelectedId] = useState<ExceptionId | null>(null);
  const [severity, setSeverity] = useState<ExceptionSeverity>("clear");
  const [draft, setDraft] = useState<{
    id: ExceptionId;
    severity: ExceptionSeverity;
  } | null>(null);

  const active = loadActiveExceptionForDay(dayKey);

  const preview = useMemo(() => {
    if (!draft) return null;
    return resolveExceptionGuidance(locale, draft.id, draft.severity);
  }, [draft, locale]);

  const apply = useCallback(() => {
    if (!selectedId) return;
    saveActiveException({ id: selectedId, severity, dayKey });
    setDraft({ id: selectedId, severity });
  }, [selectedId, severity, dayKey]);

  const clear = useCallback(() => {
    clearActiveException();
    setDraft(null);
    setSelectedId(null);
  }, []);

  useEffect(() => {
    const sync = () => {
      const a = loadActiveExceptionForDay(dayKey);
      if (a) {
        setDraft({ id: a.id, severity: a.severity });
        setSelectedId(a.id);
        setSeverity(a.severity);
      } else {
        setDraft(null);
      }
    };
    sync();
    window.addEventListener(EXCEPTION_STATE_CHANGED, sync);
    return () => window.removeEventListener(EXCEPTION_STATE_CHANGED, sync);
  }, [dayKey]);

  const severities: ExceptionSeverity[] = ["light", "clear", "bad"];

  return (
    <section
      className="mt-6 rounded-[var(--radius-xl)] border border-accent/30 bg-gradient-to-br from-white/[0.05] via-[rgba(41,92,255,0.08)] to-transparent px-4 py-5 sm:px-5"
      aria-labelledby="exception-engine-title"
    >
      <h2
        id="exception-engine-title"
        className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent"
      >
        {t("exception.panelTitle")}
      </h2>
      <p className="mt-2 text-[13px] font-medium leading-snug text-muted">
        {t("exception.panelSubtitle")}
      </p>

      {active ? (
        <div
          className="mt-4 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] px-3 py-2.5"
          role="status"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            {t("exception.todayEyebrow")}
          </p>
          <p className="mt-1 text-[13px] font-medium leading-snug text-foreground">
            {t(labelKey(active.id))} · {t(`exception.severity.${active.severity}`)}
          </p>
          <button
            type="button"
            className="mt-2 text-[12px] font-medium text-accent underline-offset-2 hover:underline"
            onClick={clear}
          >
            {t("exception.clearActive")}
          </button>
        </div>
      ) : null}

      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
        {t("exception.selectPrompt")}
      </p>

      <div className="mt-4 space-y-6">
        {EXCEPTION_GROUP_ORDER.map((groupId) => (
          <div key={groupId}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
              {t(`exception.group.${groupId}`)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXCEPTION_IDS_BY_GROUP[groupId].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedId(id)}
                  className={`rounded-full border px-3 py-1.5 text-left text-[12px] font-medium leading-snug transition ${
                    selectedId === id
                      ? "border-accent/60 bg-accent/15 text-foreground"
                      : "border-border/70 bg-card/60 text-muted hover:border-accent/35 hover:text-foreground"
                  }`}
                >
                  {t(labelKey(id))}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
          {t("exception.severityHeading")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {severities.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className={`min-h-[40px] rounded-[var(--radius-lg)] border px-3 text-[12px] font-semibold transition ${
                severity === s
                  ? "border-accent/55 bg-accent/20 text-foreground"
                  : "border-border/70 bg-background/80 text-muted hover:border-accent/30"
              }`}
            >
              {t(`exception.severity.${s}`)}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!selectedId}
        onClick={apply}
        className="mt-5 min-h-[48px] w-full rounded-[var(--radius-lg)] border border-accent/40 bg-accent/15 text-[13px] font-semibold text-accent transition hover:bg-accent/25 disabled:pointer-events-none disabled:opacity-45"
      >
        {t("exception.apply")}
      </button>

      <p className="mt-3 text-[10px] leading-snug text-muted-2">
        {t("exception.safetyFooter")}
      </p>
      <p className="mt-2 text-[10px] leading-snug text-muted-2">
        {t("exception.careLine")}
      </p>

      {preview && draft ? (
        <div
          className="mt-6 border-t border-border/45 pt-5"
          aria-live="polite"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
            {t("exception.headlineResult")}
          </p>
          <dl className="mt-3 space-y-3 text-[13px] leading-snug">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                {t("exception.resultTraining")}
              </dt>
              <dd className="mt-1 font-medium text-foreground">{preview.training}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                {t("exception.resultFood")}
              </dt>
              <dd className="mt-1 font-medium text-foreground">{preview.food}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                {t("exception.resultRecovery")}
              </dt>
              <dd className="mt-1 font-medium text-muted">{preview.recovery}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                {t("exception.resultCheck")}
              </dt>
              <dd className="mt-1 font-medium text-muted">{preview.durationCheck}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                {t("exception.resultNote")}
              </dt>
              <dd className="mt-1 font-medium text-foreground">{preview.coachNote}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </section>
  );
}
