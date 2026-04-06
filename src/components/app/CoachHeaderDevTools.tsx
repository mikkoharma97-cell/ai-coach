"use client";

import { BUILD_INFO, buildMarkerVisible } from "@/lib/buildInfo";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

function coachDevToolsEnabled(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  if (process.env.NEXT_PUBLIC_COACH_DEV_TOOLS === "1") return true;
  return buildMarkerVisible();
}

function shortBuildId(id: string): string {
  if (!id?.trim()) return "—";
  const s = id.trim();
  return s.length > 10 ? `${s.slice(0, 10)}…` : s;
}

function envPrefix(): string {
  if (process.env.NODE_ENV === "development") return "DEV";
  if (process.env.VERCEL_ENV === "preview") return "PRV";
  if (process.env.VERCEL_ENV === "production") return "REL";
  if (process.env.NEXT_PUBLIC_PREVIEW_BUILD === "1") return "PRV";
  return "LOC";
}

export function CoachHeaderDevTools() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [freshLine, setFreshLine] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !open) return;
    const buildMs = new Date(BUILD_INFO.buildTime).getTime();
    const tick = () => {
      if (Number.isNaN(buildMs)) {
        setFreshLine(`${envPrefix()} · v${BUILD_INFO.version} · ${shortBuildId(BUILD_INFO.buildId)}`);
        return;
      }
      const minutesOld = Math.floor((Date.now() - buildMs) / 1000 / 60);
      const id = shortBuildId(BUILD_INFO.buildId);
      if (minutesOld <= 60) {
        setFreshLine(`${envPrefix()} · OK · ${minutesOld}m · ${id}`);
      } else if (minutesOld <= 1440) {
        setFreshLine(`${envPrefix()} · STALE · ${Math.floor(minutesOld / 60)}h · ${id}`);
      } else {
        setFreshLine(`${envPrefix()} · OLD · ${Math.floor(minutesOld / 1440)}d · ${id}`);
      }
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [mounted, open]);

  const onOpenFeedback = useCallback(() => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("coach-open-feedback"));
  }, []);

  const onHardRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const buildBlock = useMemo(() => {
    if (!mounted) return `${envPrefix()} · v${BUILD_INFO.version} · ${shortBuildId(BUILD_INFO.buildId)}`;
    return freshLine ?? `${envPrefix()} · v${BUILD_INFO.version} · ${shortBuildId(BUILD_INFO.buildId)}`;
  }, [mounted, freshLine]);

  if (!coachDevToolsEnabled()) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-[13px] font-semibold leading-none text-muted-2/70 transition hover:border-accent/30 hover:bg-white/[0.06] hover:text-foreground/90 active:scale-[0.97]"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("devTools.aria")}
        title={t("devTools.aria")}
      >
        <span aria-hidden className="translate-y-px">
          ·
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[var(--z-overlay-backdrop)] bg-black/40"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="fixed right-3 top-[calc(env(safe-area-inset-top,0px)+3.25rem)] z-[var(--z-overlay-sheet)] w-[min(calc(100vw-1.5rem),17.5rem)] rounded-[var(--radius-lg)] border border-white/[0.1] bg-[rgba(8,10,16,0.97)] p-3 shadow-[var(--shadow-float)] backdrop-blur-[16px]"
          >
            <p className="font-mono text-[10px] font-medium leading-snug tracking-wide text-muted-2">
              {buildBlock}
            </p>
            <p className="mt-1 font-mono text-[9px] text-muted-2/75">
              {BUILD_INFO.buildTime}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={onHardRefresh}
                className="flex min-h-[44px] w-full items-center justify-center rounded-[var(--radius-md)] border border-white/[0.1] bg-white/[0.05] text-[13px] font-semibold text-foreground transition hover:border-accent/35 hover:bg-white/[0.08] active:scale-[0.99]"
              >
                {t("devTools.refresh")}
              </button>
              <Link
                href="/home"
                className="flex min-h-[44px] w-full items-center justify-center rounded-[var(--radius-md)] border border-white/[0.1] bg-white/[0.05] text-[13px] font-semibold text-foreground transition hover:border-accent/35 hover:bg-white/[0.08] active:scale-[0.99]"
                onClick={() => setOpen(false)}
              >
                {t("devTools.home")}
              </Link>
              <button
                type="button"
                onClick={onOpenFeedback}
                className="flex min-h-[44px] w-full items-center justify-center rounded-[var(--radius-md)] border border-accent/25 bg-accent/10 text-[13px] font-semibold text-foreground transition hover:bg-accent/18 active:scale-[0.99]"
              >
                {t("devTools.feedback")}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
