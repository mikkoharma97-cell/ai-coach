"use client";

import { useTranslation } from "@/hooks/useTranslation";

const FEAT_KEYS = [
  "prestart.feat1",
  "prestart.feat2",
  "prestart.feat3",
  "prestart.feat4",
  "prestart.feat5",
  "prestart.feat6",
  "prestart.feat7",
  "prestart.feat8",
] as const;

const MAP_KEYS = [
  "prestart.mapToday",
  "prestart.mapFood",
  "prestart.mapTrain",
  "prestart.mapProgress",
  "prestart.mapWeek",
  "prestart.mapExceptions",
  "prestart.mapCoach",
] as const;

export function PreStartSalesWall({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="relative pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <div
        className="pointer-events-none absolute -top-8 left-1/2 h-48 w-[min(100%,28rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(59_107_255/0.18),transparent_68%)]"
        aria-hidden
      />

      <div className="relative text-center sm:text-left">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--text-eyebrow)]">
          {t("prestart.eyebrow")}
        </p>
        <h1 className="mt-4 text-balance text-[1.65rem] font-semibold leading-[1.08] tracking-[-0.045em] text-foreground sm:text-[1.85rem]">
          {t("prestart.heroTitle")}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] font-medium leading-snug text-muted sm:mx-0">
          {t("prestart.heroSubline")}
        </p>
      </div>

      <div className="relative mt-10 grid gap-2">
        {FEAT_KEYS.map((key) => (
          <div
            key={key}
            className="flex gap-3 rounded-[var(--radius-lg)] border border-white/[0.07] bg-[var(--coach-surface-muted)] px-3.5 py-3 shadow-[0_8px_28px_rgb(0_0_0/0.28)]"
          >
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_12px_var(--accent-glow-soft)]"
              aria-hidden
            />
            <p className="text-left text-[13px] font-medium leading-snug tracking-[-0.01em] text-foreground/95">
              {t(key)}
            </p>
          </div>
        ))}
      </div>

      <div className="relative mt-10 overflow-hidden rounded-[var(--radius-2xl)] border border-accent/35 bg-gradient-to-br from-accent/[0.09] via-background-high/80 to-background px-4 py-5 shadow-[0_0_48px_rgb(41_92_255/0.22),inset_0_1px_0_rgb(255_255_255/0.06)]">
        <p className="text-center text-[15px] font-semibold leading-snug tracking-[-0.02em] text-foreground">
          {t("prestart.contrastTitle")}
        </p>
        <ul className="mt-4 space-y-3 text-center">
          <li className="text-[13px] font-medium leading-snug text-muted">
            {t("prestart.contrast1")}
          </li>
          <li className="text-[13px] font-medium leading-snug text-muted">
            {t("prestart.contrast2")}
          </li>
          <li className="text-[13px] font-medium leading-snug text-muted">
            {t("prestart.contrast3")}
          </li>
        </ul>
      </div>

      <div className="relative mt-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
          {t("prestart.mapSectionTitle")}
        </p>
        <div className="relative mt-4 flex flex-col gap-0 border-l border-white/[0.1] pl-4">
          {MAP_KEYS.map((key, i) => (
            <div
              key={key}
              className={`relative py-2 ${i === 0 ? "pt-0" : ""}`}
            >
              <span
                className="absolute -left-[21px] top-[calc(50%-5px)] h-2.5 w-2.5 rounded-full border border-accent/50 bg-background ring-2 ring-accent/25"
                aria-hidden
              />
              <p className="text-[14px] font-semibold tracking-[-0.02em] text-foreground">
                {t(key)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-10 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-lg)] border border-white/[0.07] bg-white/[0.02] px-3 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            {t("prestart.compareLeftTitle")}
          </p>
          <ul className="mt-3 space-y-2 text-[12px] leading-snug text-muted">
            <li>{t("prestart.compareLeft1")}</li>
            <li>{t("prestart.compareLeft2")}</li>
            <li>{t("prestart.compareLeft3")}</li>
          </ul>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-accent/30 bg-accent/[0.06] px-3 py-3.5 shadow-[inset_0_0_24px_rgb(59_107_255/0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
            {t("prestart.compareRightTitle")}
          </p>
          <ul className="mt-3 space-y-2 text-[12px] font-medium leading-snug text-foreground/90">
            <li>{t("prestart.compareRight1")}</li>
            <li>{t("prestart.compareRight2")}</li>
            <li>{t("prestart.compareRight3")}</li>
          </ul>
        </div>
      </div>

      <p className="relative mt-8 border-t border-white/[0.06] pt-6 text-center text-[12px] font-medium leading-snug text-muted">
        {t("prestart.punchLine")}
      </p>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-background from-[72%] via-background/95 to-transparent pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-10">
        <div className="pointer-events-auto mx-auto max-w-md px-5">
          <button
            type="button"
            onClick={onContinue}
            className="flex h-[52px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[16px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("prestart.cta")}
          </button>
        </div>
      </div>
    </div>
  );
}
