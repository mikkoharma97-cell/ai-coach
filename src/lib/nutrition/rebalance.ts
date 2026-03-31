/**
 * Ylisyönnin hallittu tasapainotus — ei rankaisua, maltillinen korjaus usealle päivälle.
 */

import type { Locale } from "@/lib/i18n";
import type { DailyMacros } from "@/types/coach";
import type { OvereatingEvent, RebalancePlan } from "@/types/rebalance";

export type { OvereatingEvent, RebalancePlan } from "@/types/rebalance";

const MIN_TOTAL = 250;
const MAX_DAILY_ADJ = 200;

function pickDaysToBalance(total: number): number {
  if (total < MIN_TOTAL) return 0;
  if (total <= 900) {
    if (total <= 450) return 3;
    return 4;
  }
  if (total <= 2000) {
    if (total <= 1200) return 5;
    if (total <= 1600) return 6;
    return 7;
  }
  return 7;
}

function bandMessages(total: number): { fi: string; en: string } {
  if (total < 600) {
    return {
      fi: "Viikko ei hajonnut. Korjataan rauhassa.",
      en: "The week didn’t fall apart. We fix this calmly.",
    };
  }
  if (total < 1400) {
    return {
      fi: "Ylitys huomioitu. Korjaus tehdään hallitusti, ei rankaisemalla.",
      en: "The overshoot is noted. The fix is controlled — not punishment.",
    };
  }
  return {
    fi: "Kokonaiskuorma oli iso — tasapainotetaan maltillisesti usean päivän yli.",
    en: "The load was large — we’ll balance it gently across several days.",
  };
}

/**
 * Yhdistää tapahtumat: odotetaan jo filtteröityä ikkunaa (esim. 7 pv).
 * Palauttaa null jos korjausta ei tarvita.
 */
export function buildRebalancePlan(
  events: OvereatingEvent[],
): RebalancePlan | null {
  const total = events.reduce((s, e) => s + Math.max(0, e.extraCalories), 0);
  if (total < MIN_TOTAL) return null;

  const daysToBalance = pickDaysToBalance(total);
  if (daysToBalance <= 0) return null;

  const rawDaily = Math.ceil(total / daysToBalance);
  const dailyAdjustmentCalories = Math.min(MAX_DAILY_ADJ, rawDaily);
  const { fi, en } = bandMessages(total);

  return {
    totalExtraCalories: total,
    daysToBalance,
    dailyAdjustmentCalories,
    messageFi: fi,
    messageEn: en,
  };
}

export function getRebalanceMessage(
  plan: RebalancePlan,
  locale: Locale,
): string {
  return locale === "en" ? plan.messageEn : plan.messageFi;
}

/**
 * Pienentää energiatavoitetta; proteiini säilyy, hiilarit ja rasva suhteessa.
 */
export function applyRebalanceToFoodTargets(
  calories: number,
  macros: DailyMacros,
  dailyAdjustmentCalories: number,
): { calories: number; macros: DailyMacros } {
  const adj = Math.max(0, dailyAdjustmentCalories);
  const targetCal = Math.max(
    Math.round(macros.proteinG * 4 + 80),
    Math.round(calories - adj),
  );
  const pK = macros.proteinG * 4;
  const rem = targetCal - pK;
  if (rem <= 40) {
    return {
      calories: targetCal,
      macros: {
        proteinG: macros.proteinG,
        carbsG: Math.max(0, macros.carbsG - 1),
        fatG: Math.max(0, macros.fatG - 1),
      },
    };
  }
  const origCarbK = macros.carbsG * 4;
  const origFatK = macros.fatG * 9;
  const origRem = origCarbK + origFatK;
  if (origRem <= 0) {
    return { calories: targetCal, macros };
  }
  const cShare = origCarbK / origRem;
  const newCarbK = rem * cShare;
  const newFatK = rem * (1 - cShare);
  return {
    calories: targetCal,
    macros: {
      proteinG: macros.proteinG,
      carbsG: Math.max(0, Math.round(newCarbK / 4)),
      fatG: Math.max(0, Math.round(newFatK / 9)),
    },
  };
}
