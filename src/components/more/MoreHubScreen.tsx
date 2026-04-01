"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import type { AppUsageMode } from "@/types/coach";
import { loadProfile, saveProfile } from "@/lib/storage";
import { getAppUsageMode } from "@/lib/appUsageMode";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type ReactNode } from "react";

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

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10" aria-labelledby={id}>
      <h2
        id={id}
        className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function MoreHubScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [mode, setMode] = useState<AppUsageMode>(() =>
    getAppUsageMode(loadProfile()),
  );

  const coachingLinks = useMemo(
    (): HubLink[] => [
      { href: "/plans", label: t("more.linkChangeProgram") as string },
      { href: "/nutrition-plans", label: t("more.linkChangeNutrition") as string },
    ],
    [t],
  );

  const trackingLinks = useMemo(
    (): HubLink[] => [
      { href: "/review", label: t("more.linkReview") as string },
      { href: "/progress", label: t("nav.progress") as string },
    ],
    [t],
  );

  const settingsLinks = useMemo(
    (): HubLink[] => [
      { href: "/preferences", label: t("ui.preferences") as string },
      { href: "/settings", label: t("nav.settings") as string },
    ],
    [t],
  );

  const toolsLinks = useMemo(
    (): HubLink[] => [
      { href: "/adjustments", label: t("nav.adjustments") as string },
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

        <Section id="more-coaching" title={t("more.sectionCoaching") as string}>
          <LinkList items={coachingLinks} />
        </Section>

        <Section id="more-mode" title={t("more.sectionMode") as string}>
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
        </Section>

        <Section id="more-tracking" title={t("more.sectionTracking") as string}>
          <LinkList items={trackingLinks} />
        </Section>

        <Section id="more-settings" title={t("more.sectionSettings") as string}>
          <LinkList items={settingsLinks} />
        </Section>

        <Section id="more-tools" title={t("more.sectionTools") as string}>
          <LinkList items={toolsLinks} />
        </Section>
      </Container>
    </main>
  );
}
