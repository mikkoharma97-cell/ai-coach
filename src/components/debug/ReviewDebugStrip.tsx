"use client";

import { HARMÄ_BUILD } from "@/config/version";
import { useClientProfile } from "@/hooks/useClientProfile";
import { buildCoachProgramDecision } from "@/lib/coach/programDecisionEngine";
import { buildNutritionEngineSnapshot } from "@/lib/coach/nutritionEngine";
import { normalizeProfileForEngine } from "@/lib/coach/profileNormalizer";
import { getProgramLibraryEntry } from "@/lib/coachProgramCatalog";
import { getAppUsageMode } from "@/lib/appUsageMode";
import { getNutritionLibraryEntry } from "@/lib/nutritionLibrary";
import { resolveProgramFromProfile } from "@/lib/profileProgramResolver";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const SHOW_ENV =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_REVIEW_PANEL === "1";

/**
 * Kevyt review/debug: `?review=1` tai NEXT_PUBLIC_REVIEW_PANEL=1.
 */
export function ReviewDebugStrip() {
  const profile = useClientProfile();
  const searchParams = useSearchParams();
  const showQuery = searchParams.get("review") === "1";
  const visible = SHOW_ENV || showQuery;

  const text = useMemo(() => {
    if (!profile) return null;
    const p = normalizeProfileForEngine(profile);
    const mode = getAppUsageMode(profile);
    const nut = buildNutritionEngineSnapshot(p);
    const dec = buildCoachProgramDecision(p);
    const r = resolveProgramFromProfile(p);
    const plId =
      profile.selectedProgramLibraryId ?? profile.recommendedProgramLibraryId;
    const nlId =
      profile.selectedNutritionLibraryId ?? profile.recommendedNutritionLibraryId;
    const pl = plId ? getProgramLibraryEntry(plId) : null;
    const nl = nlId ? getNutritionLibraryEntry(nlId) : null;
    return [
      `mode: ${mode}`,
      `program: ${pl ? pl.nameFi : r.presetId}`,
      `nutrition BP: ${nut.nutritionBlueprintId} · ${nut.mealStructureKind}`,
      `food lib: ${nl ? nl.nameFi : "—"}`,
      `kcal ref: ${nut.targetKcal} · P ~${nut.macros.proteinG}g`,
      `preset: ${dec.presetId} · conf: ${dec.confidenceLevel}`,
      `ver build: ${HARMÄ_BUILD}`,
    ].join("\n");
  }, [profile]);

  if (!visible) return null;
  if (profile === undefined) return null;

  if (!profile) {
    return (
      <details className="fixed left-2 top-[max(3.25rem,env(safe-area-inset-top,0px))] z-[84] max-w-[min(100vw-0.75rem,18rem)] rounded-md border border-amber-500/25 bg-[rgba(8,10,14,0.92)] px-2 py-1.5 font-mono text-[9px] leading-snug text-amber-100/90 shadow-lg backdrop-blur-sm">
        <summary className="cursor-pointer select-none text-[10px] font-semibold text-amber-200/95">
          Review
        </summary>
        <p className="mt-1 text-muted-2">Ei profiilia</p>
      </details>
    );
  }

  return (
    <details className="fixed left-2 top-[max(3.25rem,env(safe-area-inset-top,0px))] z-[84] max-w-[min(100vw-0.75rem,18rem)] rounded-md border border-amber-500/25 bg-[rgba(8,10,14,0.92)] px-2 py-1.5 font-mono text-[9px] leading-snug text-amber-100/90 shadow-lg backdrop-blur-sm">
      <summary className="cursor-pointer select-none text-[10px] font-semibold text-amber-200/95">
        Review
      </summary>
      <pre className="mt-1.5 max-h-[40vh] overflow-auto whitespace-pre-wrap break-words text-[9px] text-amber-50/90">
        {text}
      </pre>
    </details>
  );
}
