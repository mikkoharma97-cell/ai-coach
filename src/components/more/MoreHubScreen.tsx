"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import type { AppUsageMode } from "@/types/coach";
import { loadProfile, saveProfile } from "@/lib/storage";
import { getAppUsageMode } from "@/lib/appUsageMode";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

type HubLink = { href: string; label: string };

function LinkList({ items }: { items: HubLink[] }) {
  return (
    <ul className="mt-3 space-y-0 divide-y divide-white/[0.06] rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.02]">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="flex min-h-[48px] items-center px-4 py-3 text-[15px] font-medium text-foreground transition hover:bg-white/[0.04]"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MoreHubScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [mode, setMode] = useState<AppUsageMode>(() =>
    getAppUsageMode(loadProfile()),
  );

  /** HÄRMÄ39: yksi selkeä lista — sama kuin bottom-navin “Lisää” -lupaus. */
  const primaryLinks = useMemo(
    (): HubLink[] => [
      { href: "/plans", label: t("more.linkChangeProgram") as string },
      { href: "/nutrition-plans", label: t("more.linkChangeNutrition") as string },
      { href: "/settings", label: t("nav.settings") as string },
      { href: "/review", label: t("more.linkReview") as string },
    ],
    [t],
  );

  const advancedLinks = useMemo(
    (): HubLink[] => [
      { href: "/adjustments", label: t("nav.adjustments") as string },
      { href: "/preferences", label: t("ui.preferences") as string },
      { href: "/food-library", label: t("foodLibrary.pageTitle") as string },
      { href: "/paywall", label: t("paywall.linkPremium") as string },
    ],
    [t],
  );

  const setUsageMode = useCallback(
    (next: AppUsageMode) => {
      const p = loadProfile();
      if (!p) {
        router.push("/start");
        return;
      }
      setMode(next);
      saveProfile({ ...p, appUsageMode: next });
      router.push("/app");
    },
    [router],
  );

  return (
    <main className="coach-page">
      <Container size="phone" className="px-5 pb-28 pt-4">
        <h1 className="coach-page-headline">{t("more.title")}</h1>
        <p className="coach-page-body-soft mt-2 max-w-md">{t("more.intro")}</p>

        <section className="mt-8" aria-labelledby="more-primary">
          <h2 id="more-primary" className="sr-only">
            {t("more.title")}
          </h2>
          <LinkList items={primaryLinks} />
        </section>

        <section className="mt-10" aria-labelledby="more-advanced">
          <h2
            id="more-advanced"
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2"
          >
            {t("more.sectionAdvanced")}
          </h2>
          <LinkList items={advancedLinks} />
        </section>

        <section className="mt-10" aria-labelledby="more-mode">
          <h2
            id="more-mode"
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2"
          >
            {t("more.sectionMode")}
          </h2>
          <p className="mt-2 text-[12px] leading-snug text-muted">
            {t("appMode.hintFoodOnly")}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setUsageMode("full_coach")}
              className={`rounded-[var(--radius-lg)] border px-4 py-3 text-left text-[14px] font-semibold transition ${
                mode === "full_coach" || mode === "maintenance"
                  ? "border-accent/50 bg-accent/[0.12] text-foreground"
                  : "border-white/[0.08] bg-white/[0.02] text-muted hover:border-white/15"
              }`}
            >
              {t("appMode.fullCoach")}
            </button>
            <button
              type="button"
              onClick={() => setUsageMode("food_only")}
              className={`rounded-[var(--radius-lg)] border px-4 py-3 text-left text-[14px] font-semibold transition ${
                mode === "food_only"
                  ? "border-accent/50 bg-accent/[0.12] text-foreground"
                  : "border-white/[0.08] bg-white/[0.02] text-muted hover:border-white/15"
              }`}
            >
              {t("appMode.foodOnly")}
            </button>
            <p className="text-[11px] text-muted-2">{t("appMode.maintenanceLater")}</p>
          </div>
        </section>
      </Container>
    </main>
  );
}
