"use client";

import { useTranslation } from "@/hooks/useTranslation";

/** Kun dataa ei vielä ole — yhtenäinen copy */
export function CoachBuildsEmpty({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <p
      className={`text-[13px] leading-relaxed text-muted ${className ?? ""}`}
      role="status"
    >
      {t("empty.buildsWithUse")}
    </p>
  );
}
