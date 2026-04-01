"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { getPreviewBuildLabel, showPreviewBuildMarker } from "@/lib/buildInfo";
import { useEffect, useState } from "react";

/** Ohut merkki navin yläpuolella — vain dev / preview-build. */
export function PreviewBuildStrip() {
  const { t } = useTranslation();
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  if (!showPreviewBuildMarker()) return null;

  const isDev = process.env.NODE_ENV === "development";
  const line = isDev
    ? `${t("preview.markerTitle")} · ${t("preview.markerDev")}`
    : `${t("preview.markerTitle")} · ${getPreviewBuildLabel()}`;

  return (
    <div
      className="relative z-[var(--z-preview-strip)] shrink-0 border-t border-amber-500/25 bg-amber-500/[0.07] px-3 py-1.5 text-center text-[10px] font-medium leading-snug text-amber-200/95"
      role="status"
    >
      <span className="tabular-nums">{line}</span>
      {origin ? (
        <span className="mt-0.5 block truncate text-[9px] text-amber-200/70">
          {origin}
        </span>
      ) : null}
    </div>
  );
}
