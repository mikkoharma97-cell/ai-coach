/**
 * Kevyt komentopohjainen parseri — ei täyttä NLP:ää.
 */
import type { DailyActivity } from "@/types/activity";

export type CoachVoiceQuickResult =
  | {
      kind: "food";
      label: string;
      kcal: number;
      slot: "breakfast" | "lunch" | "dinner" | "snack";
    }
  | {
      kind: "activity";
      type: DailyActivity["type"];
      durationMin: number;
      intensity: DailyActivity["intensity"];
    }
  | { kind: "weight"; kg: number }
  | { kind: "note"; text: string }
  | { kind: "unknown" };

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function roughFoodFromText(raw: string): { label: string; kcal: number } | null {
  const t = raw.replace(/^(söin|join|ate)\s+/i, "").trim();
  if (t.length < 2) return null;
  const s = norm(t);
  let kcal = 380;
  if (/proteiinijuoma|protskujuoma|protein shake|shake/.test(s)) kcal = 220;
  else if (/kanan|kanaa|riisi|broiler|chicken|rice/.test(s)) kcal = 480;
  else if (/pizza|burger|hampurilais/.test(s)) kcal = 650;
  else if (/salaatti|salad/.test(s)) kcal = 280;
  else if (/puuro|oatmeal|kaurapuuro/.test(s)) kcal = 320;
  return { label: t.slice(0, 80), kcal };
}

function foodSlot(low: string): "breakfast" | "lunch" | "dinner" | "snack" {
  if (/aamu|breakfast|morning/.test(low)) return "breakfast";
  if (/ilta|dinner|evening|päiväll/.test(low)) return "dinner";
  if (/välipala|snack|proteiini|shake/.test(low)) return "snack";
  return "lunch";
}

export function parseCoachVoiceQuick(
  raw: string,
  locale: "fi" | "en",
): CoachVoiceQuickResult {
  const t = raw.trim();
  if (!t) return { kind: "unknown" };
  const low = norm(t);

  const wMatch = low.match(
    /(?:^|\s)(?:paino|weight|kg)\s*[:\s]*(\d+[.,]?\d*)/,
  );
  if (wMatch) {
    const kg = parseFloat(wMatch[1].replace(",", "."));
    if (Number.isFinite(kg) && kg >= 35 && kg <= 250) {
      return { kind: "weight", kg };
    }
  }

  if (
    /kävel|walk|pyörä|bike|cycling|polkupyör|minuut|min\b/.test(low) &&
    /\d/.test(t)
  ) {
    const minMatch = low.match(/(\d+)\s*(?:min|minuut)/);
    const durationMin = minMatch
      ? Math.min(240, Math.max(5, parseInt(minMatch[1], 10)))
      : 30;
    let type: DailyActivity["type"] = "walk";
    if (/pyörä|bike|cycling|polkupyör/.test(low)) type = "cycling";
    else if (/koira|dog/.test(low)) type = "dog_walk";
    else if (/työ|työpäivä|active work/.test(low)) type = "active_work";
    let intensity: DailyActivity["intensity"] = "moderate";
    if (/kevy|light|hidas|slow/.test(low)) intensity = "light";
    if (/kova|hard|rankka|nopea|fast/.test(low)) intensity = "hard";
    return { kind: "activity", type, durationMin, intensity };
  }

  if (
    /^söin\s+/i.test(t) ||
    /^ate\s+/i.test(t) ||
    /^join\s+/i.test(t) ||
    /proteiinijuoma|protein shake/.test(low)
  ) {
    const rough = roughFoodFromText(t);
    if (rough) {
      return { kind: "food", ...rough, slot: foodSlot(low) };
    }
  }

  if (
    /treeni|tuntu|raska|kevyt|fiilis|muisti|note|felt|heavy|easy/.test(low) &&
    !/^söin/.test(low)
  ) {
    return { kind: "note", text: t.slice(0, 240) };
  }

  if (locale === "en" && /^log\s+/i.test(t)) {
    const rough = roughFoodFromText(t.replace(/^log\s+/i, ""));
    if (rough) return { kind: "food", ...rough, slot: foodSlot(low) };
  }

  return { kind: "unknown" };
}
