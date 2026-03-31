import type { ConsistencySignal } from "@/lib/review/weeklyCoachAnalysis";

export type WeeklyTruth = {
  labelFi: string;
  labelEn: string;
  summaryFi: string;
  summaryEn: string;
};

/**
 * One honest line for weekly review — direct, not shaming.
 */
export function buildWeeklyTruth(input: {
  streakDays: number;
  consistency: ConsistencySignal;
  trainingScheduled: number;
  trainingHit: number;
  trainingMissed: number;
  calorieDriftDays: number;
  exceptions: boolean;
}): WeeklyTruth {
  const rate =
    input.trainingScheduled > 0
      ? input.trainingHit / input.trainingScheduled
      : 1;

  const highSpread =
    input.calorieDriftDays >= 3 ||
    (input.trainingMissed >= 2 && input.trainingScheduled > 0);

  if (
    input.consistency === "high" &&
    rate >= 0.72 &&
    input.calorieDriftDays <= 1
  ) {
    return {
      labelFi: "Viikko pysyi kasassa.",
      labelEn: "The week held together.",
      summaryFi: "Rakenne ja rytmi kulkivat samaan suuntaan.",
      summaryEn: "Structure and rhythm pointed the same way.",
    };
  }

  if (highSpread) {
    return {
      labelFi: "Liikaa hajontaa viikolle.",
      labelEn: "Too much spread for one week.",
      summaryFi: "Viikossa oli väliä — tiivistä ankkuria, ei selitystä.",
      summaryEn: "Gaps added up — tighten one anchor, not the story.",
    };
  }

  if (
    input.exceptions &&
    input.calorieDriftDays >= 1 &&
    rate >= 0.45 &&
    input.trainingMissed <= 1
  ) {
    return {
      labelFi: "Rakenne piti, vaikka arki heitti.",
      labelEn: "Structure held even when life pushed back.",
      summaryFi: "Poikkeamat näkyivät, mutta runko ei hajonnut.",
      summaryEn: "Exceptions showed, but the frame stayed intact.",
    };
  }

  if (
    rate < 0.4 &&
    input.trainingScheduled >= 3 &&
    input.streakDays < 4 &&
    input.consistency !== "high"
  ) {
    return {
      labelFi: "Yksi hyvä päivä ei vielä pelasta viikkoa.",
      labelEn: "One strong day doesn’t save the whole week.",
      summaryFi: "Tarvitaan toistuvaa osumaa — ei yksittäistä piikkiä.",
      summaryEn: "You need repeats — not a single spike.",
    };
  }

  return {
    labelFi: "Viikko puhuu suoraan.",
    labelEn: "The week speaks plainly.",
    summaryFi: "Katso putkea ja tarkkuutta — totuus on jo tässä.",
    summaryEn: "Streak and consistency tell the story already.",
  };
}
