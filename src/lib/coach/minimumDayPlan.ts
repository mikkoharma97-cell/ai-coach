import type { Locale } from "@/lib/i18n";
import type { CoachDailyPlan } from "@/types/coach";

const COPY: Record<
  Locale,
  { prefix: string; food: string; activity: string }
> = {
  fi: {
    prefix: "Minimi päivä",
    food: "Yksi nopea ateria: proteiini + hedelmä tai täysjyvä — ei pitkää prepii.",
    activity: "Noin 10 min kevyt liike — lista Minimi päivä -ikkunassa.",
  },
  en: {
    prefix: "Minimum day",
    food: "One quick meal: protein plus fruit or whole grain — skip the long prep.",
    activity: "About 10 min easy movement — see the Minimum day panel.",
  },
};

/**
 * Kevyt päivä: ruoka- ja liikerivit korvataan fallbackilla; päivän sulkeminen toimii normaalisti.
 */
export function mergeMinimumDayIntoDailyPlan(
  plan: CoachDailyPlan,
  locale: Locale,
): CoachDailyPlan {
  const L = COPY[locale] ?? COPY.en;
  const sep = locale === "en" ? " — " : " — ";
  return {
    ...plan,
    todayFoodTask: `${L.prefix}${sep}${L.food}`,
    todayActivityTask: L.activity,
  };
}
