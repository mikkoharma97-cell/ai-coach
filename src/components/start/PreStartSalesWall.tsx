"use client";

import { HeroTodayLiving } from "@/components/landing/HeroTodayLiving";
import { useTranslation } from "@/hooks/useTranslation";

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
        <h1 className="coach-page-headline mt-2 text-balance">
          <span className="block">{t("prestart.heroLine1")}</span>
          <span className="mt-1 block text-foreground">{t("prestart.heroLine2")}</span>
        </h1>
        <p className="coach-page-body-soft mx-auto mt-5 max-w-md font-medium sm:mx-0">
          {t("prestart.heroSub")}
        </p>
      </div>

      <div className="relative mt-10 flex justify-center sm:justify-start">
        <div className="w-full max-w-[min(100%,340px)]">
          <HeroTodayLiving context="darkHero" />
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] bg-gradient-to-t from-background from-[72%] via-background/95 to-transparent pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-10">
        <div className="pointer-events-auto mx-auto max-w-md px-5">
          <button
            type="button"
            onClick={onContinue}
            className="flex h-[52px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[16px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition duration-200 ease-out hover:scale-[1.02] hover:bg-[var(--accent-hover)] hover:shadow-[0_18px_48px_rgba(41,92,255,0.5)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("prestart.cta")}
          </button>
        </div>
      </div>
    </div>
  );
}
