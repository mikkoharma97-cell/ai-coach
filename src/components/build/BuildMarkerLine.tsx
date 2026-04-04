"use client";

import { usePathname } from "next/navigation";
import { BUILD_DISPLAY_LINE, BUILD_V_DISPLAY } from "@/config/version";
import { useClientMounted } from "@/hooks/useClientMounted";
import { isAppShellRoute } from "@/lib/appShellRoutes";

type Props = {
  className?: string;
  /** Tiiviimpi rivi (esim. footer) */
  compact?: boolean;
};

/** Vain `BUILD_V_DISPLAY` + `BUILD_DISPLAY_LINE` (`version.ts` → `buildInfo.generated.ts`) — ei render-ajan aikaa. */
function BuildMarkerLines({ className = "" }: { className?: string }) {
  const firstLine = BUILD_V_DISPLAY;
  const secondLine = BUILD_DISPLAY_LINE;

  return (
    <span className={className}>
      <span className="block font-semibold tracking-tight text-foreground/95">
        {firstLine}
      </span>
      <span className="mt-0.5 block text-[10px] tabular-nums leading-tight text-muted-2/95 sm:text-[11px]">
        {secondLine}
      </span>
    </span>
  );
}

/** Piilota `NEXT_PUBLIC_SHOW_BUILD_MARKER=0` (esim. Vercel / native-julkaisu). */
export function buildMarkerVisible(): boolean {
  const flag = process.env.NEXT_PUBLIC_SHOW_BUILD_MARKER;
  if (process.env.NODE_ENV === "production") return flag === "1";
  return flag !== "0";
}

function showFloatingBuildMarker(): boolean {
  return buildMarkerVisible();
}

/**
 * Kiinteä build-merkki — coach-shell -reitit (root layout).
 * Marketing-sivuilla (esim. `/home`) oma footer-merkki — ei duplikaattia.
 * Ei käytä LocaleProvideria.
 * Offset: bottom nav + safe area (`appShellRoutes`).
 */
export function GlobalBuildMarker() {
  const mounted = useClientMounted();
  const pathname = usePathname() ?? "";
  const shell = isAppShellRoute(pathname);
  if (!mounted || !shell || !showFloatingBuildMarker()) return null;

  const bottomClass = "bottom-[calc(var(--bottom-stack)+4px)]";

  return (
    <div
      className={`pointer-events-none fixed left-4 z-[90] max-w-[min(100vw-1rem,18rem)] select-none text-left ${bottomClass}`}
    >
      <div
        className="inline-block rounded-md border border-white/[0.1] bg-[rgba(5,7,12,0.94)] px-2.5 py-1.5 font-mono shadow-[0_0_28px_rgba(41,92,255,0.14),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
        style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
        role="status"
      >
        <BuildMarkerLines />
      </div>
    </div>
  );
}

/**
 * Inline build / versio — asetukset, footer, marketing.
 */
export function BuildMarkerLine({ className = "", compact = false }: Props) {
  const mounted = useClientMounted();
  if (!mounted || !buildMarkerVisible()) return null;

  return (
    <p
      className={`leading-snug text-muted-2 ${compact ? "text-[9px]" : "text-[10px] text-center sm:text-left"} ${className}`}
      role="status"
      style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
    >
      <BuildMarkerLines />
    </p>
  );
}
