"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";

type HeroTodayContext = "default" | "darkHero";

type Props = {
  /** `darkHero`: status line colors for dark landing hero; card stays bright. */
  context?: HeroTodayContext;
};

/**
 * Landing — yksi puhelinpreview, sama sävy kuin Tänään-näkymä.
 */
export function HeroTodayLiving({ context = "default" }: Props) {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);
  const dark = context === "darkHero";

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const delay = reduce ? 0 : 2100;
    const timer = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(timer);
  }, []);

  const statusGenerating = dark ? "text-muted-2" : "text-foreground";
  const statusReady = dark ? "text-muted" : "text-muted";

  const shellRing = dark
    ? "border border-white/[0.1] ring-white/[0.08] shadow-[0_0_0_1px_rgb(255_255_255/0.05),0_24px_56px_-12px_rgb(0_0_0/0.75),0_0_72px_-20px_rgb(41_92_255/0.35)]"
    : "border border-border-strong/90 ring-black/[0.04]";

  return (
    <div
      className="group/today w-full max-w-[340px] select-none lg:max-w-[384px]"
      aria-hidden
    >
      <div className="relative min-h-[1.125rem] text-center lg:text-right">
        <p
          className={`text-[11px] font-medium tracking-tight transition-opacity duration-500 ease-out ${statusGenerating} ${
            ready ? "pointer-events-none absolute inset-x-0 opacity-0" : "opacity-100"
          }`}
        >
          {t("landing.previewTodayStatusGen")}
        </p>
        <p
          className={`text-[11px] font-medium tracking-tight transition-opacity duration-500 ease-out ${statusReady} ${
            ready ? "opacity-100" : "pointer-events-none absolute inset-x-0 opacity-0"
          }`}
        >
          {t("landing.previewTodayStatusReady")}
        </p>
      </div>

      <div
        className={`motion-reduce:transform-none mt-2.5 origin-top rounded-[1.72rem] p-1 transition-[transform,box-shadow] duration-300 ease-out will-change-transform [box-shadow:var(--shadow-today)] [transform:rotate(-0.48deg)_translate3d(2px,-3px,0)] group-hover/today:[box-shadow:var(--shadow-today-hover)] group-hover/today:[transform:rotate(-0.32deg)_translate3d(3px,-8px,0)] motion-reduce:group-hover/today:[box-shadow:var(--shadow-today)] lg:mt-3 ${
          dark ? "border border-white/[0.06] bg-black/20" : "border border-white/[0.06] bg-card"
        } ${shellRing}`}
      >
        <div
          className={`overflow-hidden rounded-[calc(1.72rem-5px)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
            dark
              ? "border border-white/[0.08] bg-[var(--device-screen-bg)]"
              : "border border-transparent bg-gradient-to-b from-[#fcfdff] via-card to-[#eef1f7] shadow-[inset_0_1px_0_rgb(255_255_255/0.85)]"
          }`}
        >
          <div
            className={`border-b ${dark ? "border-white/[0.08]" : "border-border-strong/90"}`}
          >
            <div className={`h-[3px] w-full ${dark ? "bg-white/[0.08]" : "bg-[#e8ecf1]"}`}>
              <div
                className="h-full bg-accent/90 transition-[width] duration-700 ease-out motion-reduce:transition-none"
                style={{ width: ready ? "3.33%" : "0%" }}
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 pl-[1.1rem] pr-[1.2rem]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground)]">
                {t("landing.previewTodayDayCounter")}
              </p>
              <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                <span
                  className="inline-block size-1.5 rounded-full bg-accent/80 ring-2 ring-accent/25"
                  aria-hidden
                />
                {t("landing.previewTodayPlanActive")}
              </p>
            </div>
          </div>

          <div
            className={`border-b px-5 pb-4 pt-[1.05rem] pl-[1.15rem] ${dark ? "border-white/[0.06]" : "border-border-strong"}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
              {t("landing.previewTodayFocusEyebrow")}
            </p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-2">
              {t("landing.previewTodayTodayLabel")}
            </p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-[color:var(--foreground)]">
              {t("landing.previewTodayFocusHeadline")}
            </p>
            <p
              className={`mt-3 text-[10px] font-medium leading-snug ${
                dark ? "text-muted" : "text-muted-2"
              }`}
            >
              {t("landing.previewShiftHint")}
            </p>
          </div>

          <div className="px-5 py-4 pl-[1.05rem] pr-[1.3rem]">
            <div
              className={`overflow-hidden rounded-[var(--radius-md)] border shadow-[inset_0_1px_2px_rgb(0_0_0/0.2)] ${
                dark
                  ? "border-white/[0.08] bg-white/[0.03]"
                  : "border-border-strong/90 bg-[linear-gradient(180deg,rgb(252_253_255)_0%,rgb(244_246_250)_100%)] shadow-[inset_0_1px_2px_rgb(17_20_24/0.04)]"
              }`}
            >
              <SectionRow
                label={t("landing.previewTodayWorkout")}
                body={t("landing.previewTodayWorkoutLine")}
                showDivider
                dark={dark}
              />
              <SectionRow
                label={t("landing.previewTodayFood")}
                body={t("landing.previewTodayFoodLine")}
                showDivider
                dark={dark}
              />
              <SectionRow
                label={t("landing.previewTodayActivity")}
                body={t("landing.previewTodayActivityLine")}
                dark={dark}
              />
            </div>
          </div>

          <div
            className={`border-t px-5 pb-[1.1rem] pt-4 pl-[1.1rem] ${
              dark
                ? "border-white/[0.06] bg-black/[0.2]"
                : "border-border-strong bg-[linear-gradient(180deg,rgb(248_249_252)_0%,rgb(242_244_248)_100%)]"
            }`}
          >
            <div className="flex h-[52px] w-full items-center justify-center rounded-[var(--radius-md)] bg-accent text-[16px] font-semibold text-white shadow-[var(--shadow-primary-cta)] ring-1 ring-white/10 transition-shadow duration-300 group-hover/today:shadow-[0_8px_32px_rgba(41,92,255,0.45)]">
              {t("landing.previewTodayCta")}
            </div>
            <p className="mt-3 text-center text-[11px] font-medium leading-snug text-muted">
              {t("landing.previewTodayFooter1")}
            </p>
            <p className="mt-2 text-center text-[11px] font-medium leading-snug text-muted-2">
              {t("landing.previewTodayFooter2")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionRow({
  label,
  body,
  showDivider,
  dark,
}: {
  label: string;
  body: string;
  showDivider?: boolean;
  dark?: boolean;
}) {
  return (
    <div
      className={`relative pl-3 ${showDivider ? `border-b ${dark ? "border-white/[0.06]" : "border-border/90"}` : ""}`}
    >
      <span
        className="absolute left-0 top-2.5 bottom-2.5 w-px bg-gradient-to-b from-accent/50 via-white/10 to-accent/10"
        aria-hidden
      />
      <div className="py-3.5 pl-2.5 pr-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
          {label}
        </p>
        <p className="mt-1.5 text-[15px] font-medium leading-snug text-[color:var(--foreground)]">
          {body}
        </p>
      </div>
    </div>
  );
}
