import type { Locale } from "@/lib/i18n";
import type { ProExercise } from "@/types/pro";
import { WORKOUT_DISPLAY_FALLBACK } from "@/data/workoutDisplay.mock";

const MAX_SHOW_LINES = 4;
const MAX_CHARS_PER_LINE = 96;

/** Sarjamäärä aina vähintään 1 näkymässä. */
export function effectiveSetCount(ex: ProExercise): number {
  const n = Math.floor(Number(ex.sets));
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function chunkToLineBudget(sentences: string[], maxLines: number): string[] {
  const out: string[] = [];
  for (const s of sentences) {
    if (out.length >= maxLines) break;
    if (s.length <= MAX_CHARS_PER_LINE) {
      out.push(s);
      continue;
    }
    const parts = s.split(/[,;]\s+/);
    let cur = "";
    for (const p of parts) {
      const next = cur ? `${cur}, ${p}` : p;
      if (next.length <= MAX_CHARS_PER_LINE) {
        cur = next;
      } else {
        if (cur) out.push(cur);
        cur = p;
        if (out.length >= maxLines) break;
      }
    }
    if (cur && out.length < maxLines) out.push(cur);
  }
  return out.slice(0, maxLines);
}

/**
 * Lyhyt valmennus show-vaiheeseen (2–4 riviä), ei täyttä artikkelia.
 * Prioriteetti: coachFocus → coachTip → lyhennetty prescription → fallback.
 */
export function coachingLinesForShow(
  ex: ProExercise,
  locale: Locale,
): string[] {
  const focus = locale === "en" ? ex.coachFocusEn : ex.coachFocusFi;
  if (focus?.trim()) {
    if (focus.includes("\n")) {
      return focus
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, MAX_SHOW_LINES);
    }
    return chunkToLineBudget(splitSentences(focus.trim()), MAX_SHOW_LINES);
  }
  const tip = locale === "en" ? ex.coachTipEn : ex.coachTipFi;
  if (tip?.trim()) {
    return chunkToLineBudget(splitSentences(tip.trim()), MAX_SHOW_LINES);
  }
  const presc = locale === "en" ? ex.prescriptionLineEn : ex.prescriptionLineFi;
  if (presc?.trim()) {
    return chunkToLineBudget(splitSentences(presc.trim()), MAX_SHOW_LINES);
  }
  return [
    locale === "en"
      ? WORKOUT_DISPLAY_FALLBACK.coachingLineEn
      : WORKOUT_DISPLAY_FALLBACK.coachingLineFi,
  ];
}

export function repsTargetLine(ex: ProExercise, locale: Locale): string {
  const r = ex.reps?.trim();
  if (r) return r;
  const presc = locale === "en" ? ex.prescriptionLineEn : ex.prescriptionLineFi;
  if (presc?.trim()) return presc.trim().split(/[.!?]/)[0]?.trim() ?? "—";
  return "—";
}

export function restLine(ex: ProExercise, locale: Locale): string | null {
  const r = ex.rest?.trim();
  if (!r) return null;
  return locale === "en" ? `Recovery: ${r}` : `Palautus: ${r}`;
}
