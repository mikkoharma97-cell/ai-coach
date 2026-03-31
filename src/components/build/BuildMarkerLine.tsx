"use client";

import { useTranslation } from "@/hooks/useTranslation";
import {
  formatBuildTimestampForUi,
  getPublicBuildInfo,
} from "@/lib/buildInfo";

type Props = {
  className?: string;
  /** Tiiviimpi rivi (esim. footer) */
  compact?: boolean;
};

/**
 * Näkyvä build / versio — puhelimesta näkee onko uusin deploy.
 */
export function BuildMarkerLine({ className = "", compact = false }: Props) {
  const { locale } = useTranslation();
  const { buildVersion, buildTimestamp } = getPublicBuildInfo();
  const timeLabel = formatBuildTimestampForUi(
    buildTimestamp,
    locale === "en" ? "en" : "fi",
  );

  return (
    <p
      className={`font-mono leading-snug text-muted-2 ${compact ? "text-[9px]" : "text-[10px] text-center sm:text-left"} ${className}`}
      role="status"
    >
      <span className="text-muted-2/90">
        v{buildVersion} · {timeLabel}
      </span>
    </p>
  );
}
