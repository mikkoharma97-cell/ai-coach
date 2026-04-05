"use client";

import { useTranslation } from "@/hooks/useTranslation";
import {
  clearFeedbackEntries,
  loadFeedbackEntries,
  type FeedbackEntryV2,
} from "@/lib/feedbackStorage";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export function FeedbackDebugClient() {
  const { t } = useTranslation();
  const [items, setItems] = useState<FeedbackEntryV2[]>([]);

  const refresh = useCallback(() => {
    setItems(loadFeedbackEntries());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    const onUpdated = () => refresh();
    window.addEventListener("coach-feedback-updated", onUpdated);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("coach-feedback-updated", onUpdated);
    };
  }, [refresh]);

  const jsonBlob = useMemo(
    () => JSON.stringify(items, null, 2),
    [items],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(jsonBlob);
    } catch {
      /* ignore */
    }
  };

  const clear = () => {
    if (process.env.NODE_ENV !== "development") return;
    clearFeedbackEntries();
    refresh();
  };

  const isDev = process.env.NODE_ENV === "development";

  return (
    <main className="min-h-dvh bg-[var(--background)] px-4 py-8 pb-16 text-foreground">
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[1.25rem] font-semibold tracking-[-0.03em]">
            {t("feedback.pageTitle")}
          </h1>
          <Link
            href="/app"
            className="text-[14px] font-medium text-accent underline-offset-4 hover:underline"
          >
            /app
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copy()}
            className="rounded-[var(--radius-lg)] border border-white/12 bg-white/[0.06] px-4 py-2 text-[14px] font-semibold"
          >
            {t("feedback.copy")}
          </button>
          <button
            type="button"
            onClick={refresh}
            className="rounded-[var(--radius-lg)] border border-white/12 px-4 py-2 text-[14px] font-medium text-muted"
          >
            {t("feedback.refresh")}
          </button>
          {isDev ? (
            <button
              type="button"
              onClick={clear}
              className="rounded-[var(--radius-lg)] border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-[14px] font-semibold text-amber-100"
            >
              {t("feedback.clearAll")}
            </button>
          ) : null}
        </div>

        {isDev ? (
          <p className="text-[12px] leading-snug text-muted-2">
            {t("feedback.devFileHint")}
          </p>
        ) : null}

        {items.length === 0 ? (
          <p className="text-[15px] text-muted">{t("feedback.pageEmpty")}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {items.map((it) => (
              <li
                key={it.id}
                className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] p-4"
              >
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted-2">
                  {new Date(it.timestamp).toISOString()} · {it.type} ·{" "}
                  {it.path}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground">
                  {it.message}
                </p>
                <p className="mt-2 text-[12px] text-muted-2">
                  {it.device} · {it.viewport.w}×{it.viewport.h}
                  {it.lastAction ? ` · ${it.lastAction}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
