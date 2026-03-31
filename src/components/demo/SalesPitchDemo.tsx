"use client";

import { useTranslation } from "@/hooks/useTranslation";

/**
 * HÄRMÄ18 — myyntipuhe + demo-polku; luettava ääneen & näytettävä alle ~2 min.
 */
export function SalesPitchIntro() {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <section
        className="rounded-[var(--radius-xl)] border border-accent/25 bg-accent/[0.07] px-4 py-4 shadow-[0_12px_40px_-24px_rgb(47_95_255/0.5)]"
        aria-labelledby="sales-pitch-opening"
      >
        <p
          id="sales-pitch-opening"
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent"
        >
          {t("demo.salesOpeningLabel")}
        </p>
        <ul className="mt-3 list-none space-y-2.5 text-[14px] font-medium leading-snug text-foreground/95">
          <li>{t("demo.salesOpen1")}</li>
          <li>{t("demo.salesOpen2")}</li>
          <li>{t("demo.salesOpen3")}</li>
        </ul>
      </section>

      <section aria-labelledby="sales-pitch-flow">
        <p
          id="sales-pitch-flow"
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2"
        >
          {t("demo.salesFlowLabel")}
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[13px] leading-snug text-muted">
          <li className="marker:text-accent">{t("demo.salesFlowToday")}</li>
          <li className="marker:text-accent">{t("demo.salesFlowWorkout")}</li>
          <li className="marker:text-accent">{t("demo.salesFlowFood")}</li>
          <li className="marker:text-accent">{t("demo.salesFlowProgress")}</li>
        </ol>
      </section>
    </div>
  );
}

export function SalesPitchOutro() {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <section
        className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.04] px-4 py-4"
        aria-labelledby="sales-pitch-value"
      >
        <p
          id="sales-pitch-value"
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent"
        >
          {t("demo.salesValueLabel")}
        </p>
        <ul className="mt-3 list-none space-y-2 text-[13px] font-medium leading-snug text-foreground/95">
          <li>{t("demo.salesValue1")}</li>
          <li>{t("demo.salesValue2")}</li>
          <li>{t("demo.salesValue3")}</li>
        </ul>
      </section>

      <section aria-labelledby="sales-pitch-who">
        <p
          id="sales-pitch-who"
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2"
        >
          {t("demo.salesWhoLabel")}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {(["demo.salesWho1", "demo.salesWho2", "demo.salesWho3", "demo.salesWho4"] as const).map(
            (key) => (
              <li
                key={key}
                className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-muted"
              >
                {t(key)}
              </li>
            ),
          )}
        </ul>
      </section>

      <section
        className="rounded-[var(--radius-xl)] border border-white/[0.1] bg-[rgba(8,10,16,0.65)] px-4 py-4"
        aria-labelledby="sales-pitch-close"
      >
        <p
          id="sales-pitch-close"
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-2"
        >
          {t("demo.salesCloseLabel")}
        </p>
        <p className="mt-3 text-[15px] font-semibold leading-snug text-foreground">
          {t("demo.salesClose1")}
        </p>
        <p className="mt-2 text-[14px] font-semibold text-accent">{t("demo.salesClose2")}</p>
      </section>
    </div>
  );
}
