"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import type { AppUsageMode } from "@/types/coach";
import {
  getUserSubscriptionState,
  type UserSubscriptionState,
} from "@/lib/subscription";
import { clearAllCoachLocalData, loadProfile, saveProfile } from "@/lib/storage";
import { getAppUsageMode } from "@/lib/appUsageMode";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

type HubLink = { href: string; label: string };

function LinkList({ items, variant = "default" }: { items: HubLink[]; variant?: "default" | "subtle" }) {
  const ring =
    variant === "subtle"
      ? "border-white/[0.05] bg-white/[0.015]"
      : "border-white/[0.07] bg-white/[0.02]";
  return (
    <ul className={`mt-2 space-y-0 divide-y divide-white/[0.05] rounded-[var(--radius-lg)] border ${ring}`}>
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="flex min-h-[46px] items-center px-3.5 py-2.5 text-[14.5px] font-medium text-foreground transition hover:bg-white/[0.035] active:bg-white/[0.05]"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

const groupHeadingClass =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2";

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
    <section className="mt-7" aria-labelledby={id}>
      <h2 id={id} className={groupHeadingClass}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function MoreHubScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [mode, setMode] = useState<AppUsageMode>("full_coach");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [debugProfile, setDebugProfile] = useState<"yes" | "no">("no");
  const [debugSubscription, setDebugSubscription] =
    useState<UserSubscriptionState>("NO_PROFILE");

  const showDebugLink =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_COACH_DEV_TOOLS === "1";

  useEffect(() => {
    setMode(getAppUsageMode(loadProfile()));
    setProfileLoaded(true);
  }, []);

  useEffect(() => {
    if (!showDebugLink) return;
    const hasProfile = Boolean(loadProfile());
    setDebugProfile(hasProfile ? "yes" : "no");
    setDebugSubscription(getUserSubscriptionState());
  }, [showDebugLink]);

  const primaryLinks = useMemo(
    (): HubLink[] => [
      { href: "/settings", label: t("nav.settings") as string },
      { href: "/preferences#pref-language", label: t("settings.language") as string },
      { href: "/paywall", label: t("settings.subscription") as string },
      { href: "/feedback", label: t("feedback.button") as string },
    ],
    [t],
  );

  const coachingLinks = useMemo(
    (): HubLink[] => [
      { href: "/plans", label: t("more.linkChangeProgram") as string },
      { href: "/nutrition-plans", label: t("more.linkChangeNutrition") as string },
    ],
    [t],
  );

  const extraLinks = useMemo(
    (): HubLink[] => [
      { href: "/pro", label: t("nav.pro") as string },
      { href: "/review", label: t("more.linkReview") as string },
      { href: "/adjustments", label: t("nav.adjustments") as string },
      { href: "/food-library", label: t("foodLibrary.pageTitle") as string },
    ],
    [t],
  );

  const debugLinks = useMemo((): HubLink[] => {
    if (!showDebugLink) return [];
    return [{ href: "/feedback", label: t("more.linkDebug") as string }];
  }, [showDebugLink, t]);

  const debugResetButtonClass =
    "mt-2 w-full rounded-[var(--radius-lg)] border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-left text-[13px] font-semibold text-foreground transition hover:bg-white/[0.06]";

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
      <Container size="phone" className="px-5 pb-28 pt-1.5 sm:pt-2">
        <h1 className="coach-page-headline">{t("more.title")}</h1>
        <p className="coach-page-body-soft mt-1.5 max-w-md text-[14px] leading-relaxed">
          {t("more.intro")}
        </p>

        <Section id="more-primary" title={t("more.sectionPrimary") as string}>
          <LinkList items={primaryLinks} />
        </Section>

        <Section id="more-coaching" title={t("more.sectionCoaching") as string}>
          <LinkList items={coachingLinks} variant="subtle" />
        </Section>

        <Section id="more-extra" title={t("more.sectionTools") as string}>
          <LinkList items={extraLinks} variant="subtle" />
        </Section>

        {showDebugLink ? (
          <Section id="more-debug" title={t("more.sectionDebug") as string}>
            <p className="mt-2 rounded-[10px] border border-white/[0.08] bg-white/[0.02] px-3 py-2 font-mono text-[10px] text-muted">
              profile: {debugProfile} · subscription: {debugSubscription}
            </p>
            {debugLinks.length > 0 ? <LinkList items={debugLinks} variant="subtle" /> : null}
            <button
              type="button"
              onClick={() => {
                clearAllCoachLocalData();
                router.replace("/start");
              }}
              className={debugResetButtonClass}
            >
              Reset app
            </button>
          </Section>
        ) : null}

        <Section id="more-mode" title={t("more.sectionMode") as string}>
          <p className="mt-1.5 text-[12px] leading-snug text-muted">
            {t("appMode.hintFoodOnly")}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setUsageMode("full_coach")}
              className={`rounded-[var(--radius-lg)] border px-3 py-2.5 text-left text-[14px] font-semibold transition ${
                mode === "full_coach" || mode === "maintenance"
                  ? "border-accent/45 bg-accent/[0.1] text-foreground"
                  : "border-white/[0.07] bg-white/[0.02] text-muted hover:border-white/12"
              }`}
              disabled={!profileLoaded}
            >
              {t("appMode.fullCoach")}
            </button>
            <button
              type="button"
              onClick={() => setUsageMode("food_only")}
              className={`rounded-[var(--radius-lg)] border px-3 py-2.5 text-left text-[14px] font-semibold transition ${
                mode === "food_only"
                  ? "border-accent/45 bg-accent/[0.1] text-foreground"
                  : "border-white/[0.07] bg-white/[0.02] text-muted hover:border-white/12"
              }`}
              disabled={!profileLoaded}
            >
              {t("appMode.foodOnly")}
            </button>
            <p className="text-[11px] text-muted-2">{t("appMode.maintenanceLater")}</p>
          </div>
        </Section>
      </Container>
    </main>
  );
}
