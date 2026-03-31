"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { PreviewHardRefreshButton } from "@/components/build/PreviewHardRefreshButton";
import {
  getBuildDisplayString,
  getBuildTimeIso,
  showPreviewBuildMarker,
} from "@/lib/buildInfo";
import { useEffect, useState } from "react";

export function SettingsPreviewDiagnostics() {
  const { t } = useTranslation();
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  if (!showPreviewBuildMarker()) return null;

  const buildDisplay =
    process.env.NODE_ENV === "development"
      ? t("preview.markerDev")
      : getBuildTimeIso();

  return (
    <section className="coach-panel-subtle mt-4 border border-amber-500/25 bg-amber-500/[0.06] px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-500/90">
        {t("settings.previewEyebrow")}
      </p>
      <dl className="mt-3 space-y-2 text-[12px] leading-snug">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            {t("settings.previewBuildLabel")}
          </dt>
          <dd className="mt-1 font-mono text-[11px] text-foreground/95 break-all">
            {buildDisplay}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            {t("settings.previewOriginLabel")}
          </dt>
          <dd className="mt-1 font-mono text-[11px] text-foreground/95 break-all">
            {origin || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            {t("settings.previewEnvBuildLabel")}
          </dt>
          <dd className="mt-1 font-mono text-[11px] text-foreground/95 break-all">
            {getBuildDisplayString()}
          </dd>
        </div>
      </dl>
      <PreviewHardRefreshButton />
      <p className="mt-4 text-[12px] leading-relaxed text-muted">
        {t("settings.previewTunnelNote")}
      </p>
    </section>
  );
}
