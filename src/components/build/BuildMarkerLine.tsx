"use client";

import { BUILD_DISPLAY_LINE, BUILD_V_DISPLAY } from "@/config/version";
import {
  formatBuildDateTimeForMarker,
  getPublicBuildInfo,
} from "@/lib/buildInfo";
import { isAppShellRoute } from "@/lib/appShellRoutes";
import { useTranslation } from "@/hooks/useTranslation";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Props = {
  className?: string;
  /** Tiiviimpi rivi (esim. footer) */
  compact?: boolean;
};

function BuildMarkerLines({
  locale,
  className = "",
}: {
  locale: "fi" | "en";
  className?: string;
}) {
  const { buildTimestamp } = useMemo(() => getPublicBuildInfo(), []);
  /** ISO generoitu jokaisessa buildissa — sama hetki kuin BUILD_DISPLAY_LINE, locale-aware. */
  const dateTimeLine =
    buildTimestamp && buildTimestamp !== "dev" && buildTimestamp.length > 0
      ? formatBuildDateTimeForMarker(buildTimestamp, locale)
      : BUILD_DISPLAY_LINE.trim().length > 0
        ? BUILD_DISPLAY_LINE
        : "—";

  return (
    <span className={className}>
      <span className="block font-semibold tracking-tight text-foreground/95">
        {BUILD_V_DISPLAY}
      </span>
      <span className="mt-0.5 block text-[10px] tabular-nums leading-tight text-muted-2/95 sm:text-[11px]">
        {dateTimeLine}
      </span>
    </span>
  );
}

/**
 * Kiinteä build-merkki — kaikilla sivuilla (root layout).
 * Ei käytä LocaleProvideria: locale selaimesta (SSR: fi).
 */
export function GlobalBuildMarker() {
  const pathname = usePathname() ?? "";
  const shellRoute = isAppShellRoute(pathname);
  const [locale, setLocale] = useState<"fi" | "en">("fi");

  useEffect(() => {
    try {
      const l = navigator.language.toLowerCase();
      setLocale(l.startsWith("fi") ? "fi" : "en");
    } catch {
      setLocale("fi");
    }
  }, []);

  /** Bottom-right: ei peitä headeria / tabeja; coach: navin yläpuolella (kuten PWA-banneri). */
  const bottomClass = shellRoute
    ? "bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))]"
    : "bottom-[max(0.5rem,env(safe-area-inset-bottom,0px))]";

  return (
    <div
      className={`pointer-events-none fixed right-2 z-[90] max-w-[min(100vw-1rem,18rem)] select-none text-right ${bottomClass}`}
    >
      <div
        className="inline-block rounded-md border border-white/[0.1] bg-[rgba(5,7,12,0.94)] px-2.5 py-1.5 font-mono shadow-[0_0_28px_rgba(41,92,255,0.14),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
        style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
        role="status"
      >
        <BuildMarkerLines locale={locale} />
      </div>
    </div>
  );
}

/**
 * Inline build / versio — asetukset, footer, marketing.
 */
export function BuildMarkerLine({ className = "", compact = false }: Props) {
  const { locale } = useTranslation();
  const loc = locale === "en" ? "en" : "fi";

  return (
    <p
      className={`leading-snug text-muted-2 ${compact ? "text-[9px]" : "text-[10px] text-center sm:text-left"} ${className}`}
      role="status"
      style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
    >
      <BuildMarkerLines locale={loc} />
    </p>
  );
}
