"use client";

import { loadProfile } from "@/lib/storage";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Juuripolku `/`: profiili tallessa → `/app`, muuten `/home`.
 */
export function EntryGate() {
  const router = useRouter();
  const { t } = useTranslation();
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    try {
      const p = loadProfile();
      if (p) {
        router.replace("/app");
      } else {
        router.replace("/home");
      }
    } catch (e) {
      console.warn("[coach] EntryGate error", e);
      setStuck(true);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => setStuck(true), 4000);
    return () => window.clearTimeout(timer);
  }, []);

  if (stuck) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#06070b] px-6 text-center text-[14px] text-muted">
        <p className="text-[15px] font-semibold text-foreground">
          {t("fallback.profileMissingTitle")}
        </p>
        <p className="max-w-sm text-muted">
          {t("fallback.profileLoadFailed")}
        </p>
        <p className="max-w-sm text-muted">{t("fallback.entryStuckContinue")}</p>
        <div className="flex w-full max-w-sm flex-col gap-3">
          <a
            href="/start"
            className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-[15px] font-semibold text-white"
          >
            {t("fallback.openStart")}
          </a>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href="/launch"
              className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-[14px] font-medium text-foreground"
            >
              {t("fallback.entryStuckLinkLaunch")}
            </a>
            <a
              href="/home"
              className="rounded-xl border border-white/10 px-4 py-2.5 text-[14px] font-medium text-muted"
            >
              {t("launch.linkFullMarketing")}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#06070b] px-6">
      <div
        className="size-10 animate-pulse rounded-2xl bg-accent/30"
        aria-hidden
      />
      <p className="mt-6 text-[12px] font-medium uppercase tracking-[0.2em] text-muted-2">
        {t("nav.brand")}
      </p>
      <p className="mt-3 max-w-xs text-center text-[14px] leading-snug text-muted">
        {t("fallback.entryLoadingHint")}
      </p>
    </div>
  );
}
