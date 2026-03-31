/**
 * Käyttäjän täydennysvalinnat (paikallinen) — vaikuttaa valmentajaviesteihin.
 */
export type SupplementPreferences = {
  usesCreatine: boolean;
  usesProteinPowder: boolean;
};

const KEY = "ai-coach-supplement-prefs-v1";

const DEFAULT: SupplementPreferences = {
  usesCreatine: false,
  usesProteinPowder: false,
};

export function loadSupplementPreferences(): SupplementPreferences {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const p = JSON.parse(raw) as Partial<SupplementPreferences>;
    return {
      usesCreatine: Boolean(p.usesCreatine),
      usesProteinPowder: Boolean(p.usesProteinPowder),
    };
  } catch {
    return DEFAULT;
  }
}

export function saveSupplementPreferences(p: SupplementPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}
