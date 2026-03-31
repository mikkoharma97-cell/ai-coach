"use client";

import { PROGRAM_PACKAGES, packageLabel } from "@/lib/programPackages";
import { useTranslation } from "@/hooks/useTranslation";

export function ProgramPackageCards({
  onSelect,
  selectedId,
}: {
  onSelect: (packageId: string) => void;
  selectedId?: string;
}) {
  const { t, locale } = useTranslation();
  const loc = locale === "en" ? "en" : "fi";

  return (
    <div className="flex flex-col gap-3">
      {PROGRAM_PACKAGES.map((pkg) => {
        const L = packageLabel(pkg, loc);
        const selected = selectedId === pkg.id;
        return (
          <button
            key={pkg.id}
            type="button"
            onClick={() => onSelect(pkg.id)}
            className={`w-full rounded-[var(--radius-xl)] border px-4 py-4 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] ${
              selected
                ? "border-accent bg-accent-soft text-accent shadow-[0_0_0_1px_rgb(42_92_191/0.12)]"
                : "border-border/90 bg-card/85 hover:border-accent/40 hover:bg-card"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              {L.name}
            </p>
            <p
              className={`mt-2 text-[13px] font-medium leading-snug ${selected ? "text-accent/90" : "text-muted"}`}
            >
              {L.audience}
            </p>
            <p className="mt-2 text-[12px] tabular-nums text-foreground/90">
              {t("onboarding.packageTrainPerWeek", { n: pkg.trainingDays })}
            </p>
            <p className="mt-1 text-[12px] leading-snug text-muted-2">{L.rhythm}</p>
            <p className="mt-3 border-t border-border/40 pt-3 text-[13px] font-medium leading-snug text-foreground">
              {L.benefit}
            </p>
          </button>
        );
      })}
    </div>
  );
}
