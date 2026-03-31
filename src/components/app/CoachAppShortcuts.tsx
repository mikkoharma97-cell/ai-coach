"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import type { MessageKey } from "@/lib/i18n";

export type CoachShortcutItem = {
  href: string;
  labelKey: MessageKey;
};

const DEFAULT_SHORTCUTS: CoachShortcutItem[] = [
  { href: "/app", labelKey: "ui.today" },
  { href: "/food", labelKey: "ui.food" },
  { href: "/workout", labelKey: "ui.workout" },
  { href: "/plans", labelKey: "plans.title" },
  { href: "/food-library", labelKey: "foodLibrary.pageTitle" },
  { href: "/scan", labelKey: "nav.scan" },
  { href: "/progress", labelKey: "nav.progress" },
  { href: "/review", labelKey: "nav.review" },
  { href: "/adjustments", labelKey: "nav.adjustments" },
];

/** Neljä ydinkorttia — vähemmän päällekkäisyyttä alapalkkiin kuin täydessä listassa. */
const COMPACT_SHORTCUTS: CoachShortcutItem[] = [
  { href: "/app", labelKey: "ui.today" },
  { href: "/food", labelKey: "ui.food" },
  { href: "/workout", labelKey: "ui.workout" },
  { href: "/plans", labelKey: "plans.title" },
  { href: "/food-library", labelKey: "foodLibrary.pageTitle" },
  { href: "/scan", labelKey: "nav.scan" },
  { href: "/progress", labelKey: "nav.progress" },
  { href: "/review", labelKey: "nav.review" },
  { href: "/adjustments", labelKey: "nav.adjustments" },
];

type Props = {
  omit?: readonly string[];
  extra?: readonly CoachShortcutItem[];
  eyebrowKey?: MessageKey;
  className?: string;
  /** Lyhyempi lista — sopii näkymiin joissa alapalkki näkyy. */
  compact?: boolean;
};

export function CoachAppShortcuts({
  omit = [],
  extra = [],
  eyebrowKey,
  compact = false,
  className = "",
}: Props) {
  const { t } = useTranslation();
  const base = compact ? COMPACT_SHORTCUTS : DEFAULT_SHORTCUTS;
  const defaultEyebrow = compact
    ? ("nav.shortcutsCompactEyebrow" as MessageKey)
    : ("today.shortcutsEyebrow" as MessageKey);
  const merged = [...base, ...extra];
  const seen = new Set<string>();
  const items = merged.filter((it) => {
    if (omit.includes(it.href) || seen.has(it.href)) return false;
    seen.add(it.href);
    return true;
  });

  return (
    <nav
      className={`mt-10 border-t border-border/40 pt-8 ${className}`}
      aria-label={t(eyebrowKey ?? defaultEyebrow)}
    >
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
        {t(eyebrowKey ?? defaultEyebrow)}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px]">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="font-semibold text-accent underline-offset-[3px] hover:underline"
          >
            {t(it.labelKey)}
          </Link>
        ))}
      </div>
    </nav>
  );
}
