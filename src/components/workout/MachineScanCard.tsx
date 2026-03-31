"use client";

import { MACHINE_SCAN_FUTURE_KEYS } from "@/lib/machineScanHints";
import { loadLastMachineScan, saveLastMachineScan } from "@/lib/machineScanStorage";
import type { MessageKey } from "@/lib/i18n";
import { useTranslation } from "@/hooks/useTranslation";
import { useCallback, useRef, useState } from "react";

export function MachineScanCard() {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(() => loadLastMachineScan());

  const onPick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : null;
      setPreview(url);
    };
    reader.readAsDataURL(file);
  }, []);

  const onSave = useCallback(() => {
    if (!preview) return;
    const rec = saveLastMachineScan({
      imageDataUrl: preview,
      notes,
    });
    setSaved(rec);
  }, [preview, notes]);

  return (
    <div className="space-y-5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onFile}
      />

      <div className="rounded-[var(--radius-xl)] border border-white/[0.1] bg-white/[0.03] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">
          {t("machineScan.cardEyebrow")}
        </p>
        <h2 className="mt-2 text-[1.15rem] font-semibold text-foreground">
          {t("machineScan.cardTitle")}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          {t("machineScan.cardBody")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPick}
            className="rounded-xl bg-accent px-4 py-2.5 text-[14px] font-semibold text-white"
          >
            {t("machineScan.openCamera")}
          </button>
          <button
            type="button"
            onClick={onPick}
            className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-[14px] font-semibold text-foreground"
          >
            {t("machineScan.pickImage")}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt=""
            className="max-h-56 w-full object-contain"
          />
        </div>
      ) : null}

      <label className="block">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-2">
          {t("machineScan.notesLabel")}
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-[var(--radius-md)] border border-border/50 bg-white/[0.06] px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-accent/50"
          placeholder={t("machineScan.notesPlaceholder")}
        />
      </label>

      {preview ? (
        <button
          type="button"
          onClick={onSave}
          className="w-full rounded-xl border border-accent/40 bg-accent/15 py-3 text-[14px] font-semibold text-foreground"
        >
          {t("machineScan.saveScan")}
        </button>
      ) : null}

      <div className="rounded-[var(--radius-lg)] border border-accent/25 bg-accent/[0.07] px-4 py-4">
        <p className="text-[13px] font-semibold text-foreground">
          {t(MACHINE_SCAN_FUTURE_KEYS.title)}
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-muted">
          {t(MACHINE_SCAN_FUTURE_KEYS.body)}
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[12px] text-muted-2">
          <li>{t(MACHINE_SCAN_FUTURE_KEYS.bullet1)}</li>
          <li>{t(MACHINE_SCAN_FUTURE_KEYS.bullet2)}</li>
        </ul>
      </div>

      {saved ? (
        <p className="text-[12px] text-muted-2" role="status">
          {t("machineScan.savedHint")}
        </p>
      ) : null}
    </div>
  );
}
