"use client";

import { useBuildRefreshNotice } from "@/hooks/useBuildRefreshNotice";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Kiinnitetään coach-layoutiin — ilmoitus kun deploy-vaihto havaittu.
 */
export function BuildRefreshToast() {
  const { t } = useTranslation();
  const { showNotice, dismiss } = useBuildRefreshNotice();

  if (!showNotice) return null;

  return (
    <div
      className="pointer-events-auto fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[95] w-[min(100%,20rem)] -translate-x-1/2 px-4 sm:bottom-[calc(6rem+env(safe-area-inset-bottom,0px))]"
      role="status"
    >
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-accent/40 bg-[rgba(5,6,10,0.96)] px-4 py-3 shadow-[var(--shadow-float)] backdrop-blur-md">
        <p className="text-[12px] font-medium leading-snug text-foreground">
          {t("build.newVersionLoaded")}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold text-accent hover:underline"
        >
          {t("build.dismiss")}
        </button>
      </div>
    </div>
  );
}
