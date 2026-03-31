"use client";

import { appendWeightLogEntry } from "@/lib/progress";
import { useAsyncButtonState } from "@/hooks/useAsyncButtonState";
import { useTranslation } from "@/hooks/useTranslation";
import { useCallback, useState } from "react";

type Props = {
  onLogged: () => void;
};

export function WeightQuickLog({ onLogged }: Props) {
  const { t } = useTranslation();
  const [val, setVal] = useState("");
  const [ack, setAck] = useState(false);
  const saveWeight = useAsyncButtonState({ name: "WeightQuickLog.save" });

  const onSave = useCallback(() => {
    const n = parseFloat(val.replace(",", "."));
    if (!Number.isFinite(n)) return;
    void saveWeight.run(async () => {
      try {
        appendWeightLogEntry(n);
        setVal("");
        setAck(true);
        onLogged();
        window.setTimeout(() => setAck(false), 3500);
      } catch (e) {
        console.error("[WeightQuickLog]", e);
        throw e;
      }
    });
  }, [val, onLogged, saveWeight]);

  return (
    <div className="mt-4 rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.03] px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
        {t("progress.weightQuickEyebrow")}
      </p>
      <p className="mt-1 text-[13px] leading-snug text-muted">
        {t("progress.weightQuickBody")}
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="min-w-[8rem] flex-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-2">
            {t("progress.weightQuickLabel")}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={t("progress.weightQuickPlaceholder")}
            className="mt-1.5 w-full rounded-[var(--radius-md)] border border-border/50 bg-white/[0.06] px-3 py-2.5 text-[16px] font-semibold tabular-nums text-foreground outline-none focus:border-accent/50"
            autoComplete="off"
          />
        </label>
        <button
          type="button"
          onClick={onSave}
          disabled={saveWeight.loading}
          className="min-h-[48px] rounded-xl bg-accent px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
        >
          {saveWeight.loading ? t("common.loading") : t("progress.weightQuickSave")}
        </button>
      </div>
      {ack ? (
        <p className="mt-3 text-[12px] font-medium text-accent/95" role="status">
          {t("progress.weightQuickAck")}
        </p>
      ) : null}
    </div>
  );
}
