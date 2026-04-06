"use client";

import {
  BUILD_INFO,
  buildMarkerVisible,
  getEnvironmentMarker,
} from "@/lib/buildInfo";
import { isAppShellRoute } from "@/lib/appShellRoutes";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const LS_BUILD = "last-build-id";

function parseBuildMs(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function staleStatus(minutesOld: number): "fresh" | "stale" | "very-stale" {
  if (minutesOld > 1440) return "very-stale";
  if (minutesOld > 60) return "stale";
  return "fresh";
}

/** Paikallinen kello — vain clientillä mountin jälkeen (ei koskaan SSR:ssä). */
function formatLocalClock(iso: string): string {
  if (!iso || iso === "dev") return "--:--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatStaleAge(minutesOld: number): string {
  if (minutesOld >= 1440) {
    const d = Math.floor(minutesOld / 1440);
    return `${d}d`;
  }
  if (minutesOld >= 60) {
    const h = Math.floor(minutesOld / 60);
    return `${h}h`;
  }
  return `${Math.max(1, minutesOld)}m`;
}

function envPrefix(): string {
  const e = getEnvironmentMarker();
  if (e === "preview") return "PRV";
  if (e === "production") return "REL";
  return "DEV";
}

/**
 * Yksi staattinen rivi — vain buildId + prefix, ei aikaa.
 * Käytössä heti mountin jälkeen kunnes freshness on laskettu (tai fresh-tilassa yksinkertaisena).
 */
function shortBuildId(id: string): string {
  if (!id?.trim()) return "—";
  const s = id.trim();
  return s.length > 10 ? `${s.slice(0, 10)}…` : s;
}

/** Yksi rivi heti mountin jälkeen — sama rakenne kuin fresh-tilassa (ei satunnaista sisältöä). */
function buildMarkerBaselineLine(): string {
  const id = shortBuildId(BUILD_INFO.buildId);
  const t = formatLocalClock(BUILD_INFO.buildTime);
  return `${envPrefix()} · BUILD OK · ${t} · ${id}`;
}

export function GlobalBuildMarker() {
  const pathname = usePathname() ?? "";
  const shell = isAppShellRoute(pathname);

  const [mounted, setMounted] = useState(false);
  const [freshness, setFreshness] = useState<{
    minutesOld: number;
    st: "fresh" | "stale" | "very-stale";
  } | null>(null);
  const [noUpdate, setNoUpdate] = useState(false);
  const [newBuildGlow, setNewBuildGlow] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const buildMs = parseBuildMs(BUILD_INFO.buildTime);
    const update = () => {
      const minutesOld = Math.floor((Date.now() - buildMs) / 1000 / 60);
      setFreshness({ minutesOld, st: staleStatus(minutesOld) });
    };
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [mounted]);

  useEffect(() => {
    try {
      const last = localStorage.getItem(LS_BUILD);
      const nav = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming | undefined;
      const isReload = nav?.type === "reload";

      if (last === BUILD_INFO.buildId && isReload) {
        setNoUpdate(true);
        const t = window.setTimeout(() => setNoUpdate(false), 8000);
        return () => window.clearTimeout(t);
      }

      if (last !== BUILD_INFO.buildId) {
        localStorage.setItem(LS_BUILD, BUILD_INFO.buildId);
        setNewBuildGlow(true);
        const t = window.setTimeout(() => setNewBuildGlow(false), 4500);
        return () => window.clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
    return undefined;
  }, []);

  const { line, toneClass, glowClass } = useMemo(() => {
    const base = buildMarkerBaselineLine();
    const defaultTone =
      "border-white/[0.1] bg-[rgba(6,8,14,0.78)] text-muted-2 shadow-[0_4px_18px_rgba(0,0,0,0.28)]";

    const updatedPrefix = newBuildGlow ? "UPDATED · " : "";

    if (!mounted || freshness === null) {
      return {
        line: `${updatedPrefix}${base}`,
        toneClass: defaultTone,
        glowClass: newBuildGlow ? "ring-1 ring-accent/35" : "",
      };
    }

    const { minutesOld, st } = freshness;
    const id = shortBuildId(BUILD_INFO.buildId);
    const clock = formatLocalClock(BUILD_INFO.buildTime);

    let nextTone = defaultTone;
    if (st === "stale") {
      nextTone =
        "border-amber-500/22 bg-amber-950/32 text-amber-100/88 shadow-[0_4px_20px_rgba(180,120,0,0.1)]";
    } else if (st === "very-stale") {
      nextTone =
        "border-red-500/20 bg-red-950/28 text-red-200/85 shadow-[0_4px_20px_rgba(180,40,40,0.1)]";
    }

    const glowClass = newBuildGlow ? "ring-1 ring-accent/35" : "";

    let lineInner = "";
    if (st === "fresh") {
      lineInner = `${envPrefix()} · BUILD OK · ${clock} · ${id}`;
    } else if (st === "stale") {
      lineInner = `STALE · ${formatStaleAge(minutesOld)} · ${id}`;
    } else {
      lineInner = `OLD · ${formatStaleAge(minutesOld)} · ${id}`;
    }

    return {
      line: `${updatedPrefix}${lineInner}`,
      toneClass: nextTone,
      glowClass,
    };
  }, [mounted, freshness, newBuildGlow]);

  if (!buildMarkerVisible() || !shell) return null;

  /**
   * Ei HTML:ää serverillä eikä hydrationin ensimmäisellä client-renderillä.
   * Estää mismatchin kun SSR-bundle ja client-chunk sisältävät eri buildInfo.generated -snapshotin (dev/HMR).
   */
  if (!mounted) return null;

  const devClick = process.env.NODE_ENV === "development";

  const markerTitle = [
    `v${BUILD_INFO.version}`,
    BUILD_INFO.buildId,
    BUILD_INFO.buildTime,
  ].join(" · ");

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[85] flex justify-center px-3 coach-build-marker-v2-enter"
      style={{
        bottom: "calc(var(--bottom-stack) + 10px)",
      }}
    >
      <button
        type="button"
        disabled={!devClick}
        onClick={() => {
          if (devClick) window.location.reload();
        }}
        className={`pointer-events-auto max-w-[min(20rem,calc(100vw-7.5rem))] truncate rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.05em] backdrop-blur-md transition duration-300 ${toneClass} ${glowClass} ${
          devClick
            ? "cursor-pointer hover:border-accent/35 hover:text-foreground active:scale-[0.99]"
            : "cursor-default"
        }`}
        style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
        title={devClick ? `Reload · ${markerTitle}` : markerTitle}
        aria-label={
          devClick
            ? "Build marker: reload page"
            : `Build: ${markerTitle}`
        }
      >
        <span className="whitespace-nowrap">{line}</span>
        {noUpdate ? (
          <span className="ml-1.5 whitespace-nowrap text-[9px] font-normal normal-case tracking-normal text-muted-2 opacity-90">
            · NO UPDATE
          </span>
        ) : null}
      </button>
    </div>
  );
}
