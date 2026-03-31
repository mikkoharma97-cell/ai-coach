/**
 * Ateria-ajoitus ilman kiinteitä kellonaikoja — ikkunat suhteessa heräämiseen, treeniin, uneen.
 */
import type { OnboardingAnswers } from "@/types/coach";
import { resolveNutritionBlueprint } from "@/lib/nutritionBlueprints";

export type DailyTiming = {
  wakeWindow: string;
  firstMealWindow: string;
  preWorkoutWindow?: string;
  postWorkoutWindow?: string;
  lateMealWindow?: string;
  sleepWindow?: string;
};

type TimingMode = "standard" | "shift_based" | "training_day" | "flex";

function timingMode(profile: OnboardingAnswers): TimingMode {
  return resolveNutritionBlueprint(profile).timingMode;
}

/** fi / en - sama rakenne, eri kopiointi */
function windowsForMode(
  mode: TimingMode,
  hasTraining: boolean,
): { fi: DailyTiming; en: DailyTiming } {
  const baseFi: DailyTiming = {
    wakeWindow: "Heräämisen jälkeen — ensimmäinen ateria kun nälkä herää, ei heti sängystä.",
    firstMealWindow: "Aamu / alkupäivä: 1–3 h heräämisen jälkeen (ei kiinteää kelloa).",
    lateMealWindow: "Myöhäinen ateria: kevyt proteiini + kasvikset, ei raskasta juuri ennen unta.",
    sleepWindow: "Uni: jätä 2–3 h buffer ennen nukkumaanmenoa raskaaseen ateriaan.",
  };
  const baseEn: DailyTiming = {
    wakeWindow: "After waking — first meal when hunger shows up, not instantly out of bed.",
    firstMealWindow: "Morning / early day: 1–3 h after waking (no fixed clock).",
    lateMealWindow: "Late meal: light protein + veg, not a heavy load right before sleep.",
    sleepWindow: "Sleep: keep ~2–3 h buffer before bed for a heavy meal.",
  };

  if (mode === "shift_based") {
    return {
      fi: {
        ...baseFi,
        wakeWindow:
          "Vuororytmi: “aamu” = kun heräät — ateriat rytmitetään heräämisen ympärille, ei kelloon.",
        firstMealWindow:
          "Ensimmäinen ateria 1–2 h heräämisen jälkeen; välipala ennen vuoroa jos pitkä pätkä.",
        preWorkoutWindow: "Ennen vuoroa: kevyt hiilaripohja + vähän proteiinia jos ehtii 2–3 h ennen.",
        postWorkoutWindow: "Vuoron jälkeen: täydennä proteiini + hiilarit ensimmäisessä “oikeassa” ateriassa.",
        lateMealWindow:
          "Myöhäinen vuoro: pieni proteiinivälipala ennen lepoa; iso ateria ennen pitkää jaksoa.",
      },
      en: {
        ...baseEn,
        wakeWindow:
          "Shift rhythm: “morning” = when you wake — meals anchor to wake time, not the clock.",
        firstMealWindow:
          "First meal 1–2 h after waking; snack before a long shift block if needed.",
        preWorkoutWindow: "Before shift: light carbs + a little protein if 2–3 h ahead.",
        postWorkoutWindow: "After shift: refill protein + carbs in the first real meal.",
        lateMealWindow:
          "Late shift: small protein snack before rest; bigger meal before a long stretch.",
      },
    };
  }

  if (mode === "training_day" && hasTraining) {
    return {
      fi: {
        ...baseFi,
        preWorkoutWindow:
          "Ennen treeniä (ei kelloa): kevyt, tuttu ruoka 1,5–3 h ennen — ei uutta kokeilua.",
        postWorkoutWindow:
          "Treenin jälkeen: proteiini + hiilarit seuraavassa ateriassa tai välipalassa heti perään.",
        firstMealWindow:
          "Jos treeni aamupäivällä: aamupala voi olla pienempi; lounas kantaa pääosan.",
      },
      en: {
        ...baseEn,
        preWorkoutWindow:
          "Pre-training (no clock): familiar food ~1.5–3 h before — no experiments.",
        postWorkoutWindow:
          "Post-training: protein + carbs in the next meal or snack soon after.",
        firstMealWindow:
          "If you train early: breakfast can be smaller; lunch carries most of the load.",
      },
    };
  }

  if (mode === "flex") {
    return {
      fi: {
        ...baseFi,
        wakeWindow:
          "Joustava päivä: kaksi ankkuria (esim. herääminen + viimeinen ateria) — väli jakautuu.",
        firstMealWindow: "Ensimmäinen ateria kun ehdit; vältä vain pitkää paastoa + myöhäistä mässäilyä samaan päivään.",
        lateMealWindow: "Tapahtuma-ilta: seuraavana päivänä kevennä illan hiilareita, ei rankkoja rangaistuksia.",
      },
      en: {
        ...baseEn,
        wakeWindow:
          "Flexible day: two anchors (e.g. wake + last meal) — spread what’s in between.",
        firstMealWindow: "First meal when you can; avoid long fast + late grazing on the same day.",
        lateMealWindow: "Event night: lighten evening carbs the next day — no harsh punishment.",
      },
    };
  }

  return { fi: baseFi, en: baseEn };
}

/**
 * Päivän ateriaikkunat profiilin ja (valinnaisen) treenipäivän mukaan.
 */
export function getMealTimingForProfile(
  profile: OnboardingAnswers,
  referenceDate: Date,
  opts?: { hasTrainingToday?: boolean },
): DailyTiming {
  const mode = timingMode(profile);
  const hasTraining = opts?.hasTrainingToday ?? false;
  const w = windowsForMode(mode, hasTraining);
  const locale = profile.uiLocale ?? "fi";
  return locale === "en" ? w.en : w.fi;
}
