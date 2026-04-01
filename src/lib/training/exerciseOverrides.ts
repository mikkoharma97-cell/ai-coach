/**
 * Käyttäjän liikevaihdot — vain sallitut vaihtoehdot (sama liikekuvio / kategoria).
 */
import { coachTipsForExercise } from "@/lib/exerciseCoachTips";
import { getExerciseAlternatives, getExerciseById } from "@/lib/training/exercises";
import type { Locale } from "@/lib/i18n";
import type { ExerciseAlternative } from "@/types/exercise";
import type { ProExercise, ProExerciseAlternative } from "@/types/pro";

function resolveAlternativeTargetId(alt: ExerciseAlternative): string | undefined {
  if (alt.targetExerciseId && getExerciseById(alt.targetExerciseId)) {
    return alt.targetExerciseId;
  }
  if (getExerciseById(alt.id)) return alt.id;
  return undefined;
}

/** Vaihtoehdot, joihin saa vaihtaa (katalogin säännöt). */
export function getSwapTargetsForExercise(canonicalId: string): {
  id: string;
  nameFi: string;
  nameEn: string;
}[] {
  const ex = getExerciseById(canonicalId);
  if (!ex) return [];
  const out: { id: string; nameFi: string; nameEn: string }[] = [];
  const seen = new Set<string>([canonicalId]);
  for (const alt of getExerciseAlternatives(canonicalId)) {
    const tid = resolveAlternativeTargetId(alt);
    if (!tid || seen.has(tid)) continue;
    const target = getExerciseById(tid);
    if (!target || target.category !== ex.category) continue;
    seen.add(tid);
    out.push({
      id: target.id,
      nameFi: target.nameFi,
      nameEn: target.nameEn,
    });
  }
  return out;
}

export function isAllowedExerciseSwap(fromId: string, toId: string): boolean {
  if (fromId === toId) return true;
  return getSwapTargetsForExercise(fromId).some((t) => t.id === toId);
}

function mapAlts(
  ex: import("@/types/exercise").Exercise,
  locale: Locale,
): ProExerciseAlternative[] {
  return ex.alternatives.map((a) => ({
    id: a.id,
    name: locale === "en" ? a.nameEn : a.nameFi,
    reasonFi: a.reasonFi,
    reasonEn: a.reasonEn,
  }));
}

/** Säilyttää sarjat/toistot/lepo/ohjeet — vaihtaa identiteetin ja valmennustekstit. */
export function swapProExerciseIdentity(
  ex: ProExercise,
  targetId: string,
  locale: Locale,
): ProExercise | null {
  if (!isAllowedExerciseSwap(ex.id, targetId)) return null;
  const target = getExerciseById(targetId);
  if (!target) return null;
  const tips = coachTipsForExercise(target);
  return {
    ...ex,
    id: target.id,
    name: locale === "en" ? target.nameEn : target.nameFi,
    target: target.primaryMuscles.join(" + "),
    alternatives: mapAlts(target, locale),
    coachTipFi: tips.tipFi,
    coachTipEn: tips.tipEn,
    coachMistakeFi: tips.mistakeFi,
    coachMistakeEn: tips.mistakeEn,
    coachFocusFi: tips.focusFi,
    coachFocusEn: tips.focusEn,
    substitutionReasonFi: undefined,
    substitutionReasonEn: undefined,
  };
}

export function applyExerciseOverridesToProExercises(
  exercises: ProExercise[],
  overrides: Record<string, string> | undefined,
  locale: Locale,
): ProExercise[] {
  if (!overrides || Object.keys(overrides).length === 0) return exercises;
  return exercises.map((ex) => {
    const toId = overrides[ex.id];
    if (!toId) return ex;
    return swapProExerciseIdentity(ex, toId, locale) ?? ex;
  });
}
