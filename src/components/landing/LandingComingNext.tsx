"use client";

import { useTranslation } from "@/hooks/useTranslation";

export function LandingComingNext() {
  const { t } = useTranslation();
  const items = [
    t("landing.comingNext.scan"),
    t("landing.comingNext.handsfree"),
    t("landing.comingNext.autoProgram"),
    t("landing.comingNext.analytics"),
  ];
  return (
    <section className="border-y border-white/[0.06] bg-[#07080f] px-5 py-16 md:py-20">
      <div className="mx-auto max-w-xl">
        <h2 className="text-center text-[1.15rem] font-semibold tracking-tight text-foreground md:text-[1.35rem]">
          {t("landing.comingNext.title")}
        </h2>
        <ul className="mt-8 space-y-4 text-[15px] leading-relaxed text-muted md:text-[16px]">
          {items.map((line) => (
            <li key={line} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/80" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
