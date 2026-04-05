"use client";

import { isAppShellRoute } from "@/lib/appShellRoutes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function showFloatingHomeRefresh(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return process.env.NEXT_PUBLIC_COACH_DEV_TOOLS === "1";
}

/**
 * Kiinteä etusivu + täysi reload — kehitys / eksplisiittinen preview (NEXT_PUBLIC_COACH_DEV_TOOLS).
 * Tuotannossa piilossa: ei kolmatta "debug" vihjettä build-merkin ja palautteen kanssa.
 * Ei käytä LocaleProvideria (root layout).
 */
export function HomeCheckButton() {
  const pathname = usePathname() ?? "";
  const shell = isAppShellRoute(pathname);
  const [homeLabel, setHomeLabel] = useState("Home");
  const [refreshLabel, setRefreshLabel] = useState("Refresh");

  useEffect(() => {
    try {
      const l = navigator.language.toLowerCase();
      const fi = l.startsWith("fi");
      setHomeLabel(fi ? "Etusivu" : "Home");
      setRefreshLabel(fi ? "Päivitä" : "Refresh");
    } catch {
      setHomeLabel("Home");
      setRefreshLabel("Refresh");
    }
  }, []);

  const onHardRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  if (!showFloatingHomeRefresh()) return null;

  const bottomClass = shell
    ? "bottom-[calc(var(--bottom-stack)+4px)]"
    : "bottom-[max(3.5rem,env(safe-area-inset-bottom,0px)+2.75rem)]";

  const btnClass =
    "pointer-events-auto inline-flex min-h-[36px] min-w-[4.25rem] items-center justify-center rounded-md border border-white/[0.12] bg-[rgba(5,7,12,0.88)] px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-2 shadow-[0_0_20px_rgba(41,92,255,0.12)] backdrop-blur-md transition hover:border-accent/35 hover:text-foreground";

  return (
    <div
      className={`pointer-events-none fixed left-2 z-[92] flex flex-col gap-2 sm:flex-row sm:items-center ${bottomClass}`}
    >
      <Link
        href="/home"
        className={btnClass}
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        }}
      >
        {homeLabel}
      </Link>
      <button
        type="button"
        onClick={onHardRefresh}
        className={btnClass}
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        }}
      >
        {refreshLabel}
      </button>
    </div>
  );
}
