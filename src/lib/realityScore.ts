/**
 * Reality Score — "real life match", not perfection points.
 */

export type RealityScore = {
  score: number;
  labelFi: string;
  labelEn: string;
  reasonFi: string;
  reasonEn: string;
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function bandLabel(score: number): {
  labelFi: string;
  labelEn: string;
} {
  if (score >= 85) {
    return { labelFi: "Rytmi pitää", labelEn: "Rhythm holds" };
  }
  if (score >= 70) {
    return { labelFi: "Hyvä hallinta", labelEn: "Good control" };
  }
  if (score >= 50) {
    return { labelFi: "Rytmi horjuu", labelEn: "Rhythm is slipping" };
  }
  return { labelFi: "Arki vie ohjelmaa", labelEn: "Life is driving the plan" };
}

function bandReason(score: number): { reasonFi: string; reasonEn: string } {
  if (score >= 85) {
    return {
      reasonFi: "Arki ja ohjelma kulkevat samaan suuntaan.",
      reasonEn: "Life and the plan are moving together.",
    };
  }
  if (score >= 70) {
    return {
      reasonFi: "Arki ja ohjelma ovat vielä samalla puolella.",
      reasonEn: "Life and the plan are still on the same side.",
    };
  }
  if (score >= 50) {
    return {
      reasonFi: "Poikkeamat näkyvät — rytmi kannattaa vahvistaa.",
      reasonEn: "Noise shows up — worth tightening the rhythm.",
    };
  }
  return {
    reasonFi: "Ohjelmaa kannattaa keventää tai ankkuroida uudelleen.",
    reasonEn: "Lighten the plan or re-anchor — the week needs room.",
  };
}

export function buildRealityScore(input: {
  consistency: number;
  streak: number;
  macrosOnTrackRatio: number;
  workoutsHitRatio: number;
  exceptionsCount: number;
  offPlanCount: number;
  recoverySignal?: "good" | "mixed" | "poor";
  /** Reserved for UI that picks a single language client-side. */
  locale: "fi" | "en";
}): RealityScore {
  void input.locale;
  const c = clamp(input.consistency, 0, 100) / 100;
  const w = clamp(input.workoutsHitRatio, 0, 1);
  const m = clamp(input.macrosOnTrackRatio, 0, 1);
  const streakN = clamp(input.streak, 0, 21);
  const streakTerm = Math.min(1, streakN / 10);

  const ex = clamp(input.exceptionsCount, 0, 14);
  const off = clamp(input.offPlanCount, 0, 21);

  /** Softer penalty when base rhythm is still decent */
  const exPenalty = ex * (c > 0.55 ? 5 : 8);
  const offPenalty = off * (c > 0.5 ? 4 : 7);

  let recoveryMul = 1;
  if (input.recoverySignal === "poor") recoveryMul = 0.88;
  else if (input.recoverySignal === "mixed") recoveryMul = 0.96;

  let raw =
    (0.3 * c + 0.24 * w + 0.2 * m + 0.14 * streakTerm) * 100 -
    exPenalty -
    offPenalty;
  raw *= recoveryMul;

  const score = Math.round(clamp(raw, 0, 100));
  const labels = bandLabel(score);
  const reasons = bandReason(score);

  return {
    score,
    labelFi: labels.labelFi,
    labelEn: labels.labelEn,
    reasonFi: reasons.reasonFi,
    reasonEn: reasons.reasonEn,
  };
}
