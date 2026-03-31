"use client";

import { useTranslation } from "@/hooks/useTranslation";

/**
 * Vain dev / kun NEXT_PUBLIC_PREVIEW_BUILD=1 — pakota täysi reload (cache-testit).
 */
export function PreviewHardRefreshButton() {
  const { t } = useTranslation();
  const show =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_PREVIEW_BUILD === "1";

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="mt-3 w-full min-h-[44px] rounded-[var(--radius-lg)] border border-amber-500/35 bg-amber-500/[0.08] text-[13px] font-semibold text-amber-100/95 transition hover:bg-amber-500/15"
    >
      {t("build.hardRefresh")}
    </button>
  );
}
