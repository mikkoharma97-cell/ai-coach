import type { OnboardingAnswers } from "@/types/coach";
import type { UserSupplementEntry } from "@/types/supplements";

function uid(): string {
  return `us_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function sanitizeSupplementStack(
  raw: unknown,
): UserSupplementEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: UserSupplementEntry[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Partial<UserSupplementEntry>;
    const type = o.type;
    if (
      type !== "protein_powder" &&
      type !== "creatine" &&
      type !== "other"
    ) {
      continue;
    }
    const name = typeof o.name === "string" ? o.name.trim().slice(0, 80) : "";
    if (!name) continue;
    const proteinGPerDay =
      typeof o.proteinGPerDay === "number" && Number.isFinite(o.proteinGPerDay)
        ? Math.max(0, Math.min(120, Math.round(o.proteinGPerDay)))
        : 0;
    const doseLabel =
      typeof o.doseLabel === "string"
        ? o.doseLabel.trim().slice(0, 40)
        : undefined;
    out.push({
      id: typeof o.id === "string" && o.id.length > 2 ? o.id : uid(),
      type,
      name,
      proteinGPerDay: type === "protein_powder" ? proteinGPerDay : 0,
      doseLabel: type !== "protein_powder" ? doseLabel : undefined,
    });
  }
  return out.slice(0, 12);
}

/** Päivän proteiini grammoina lisäravinteista (jauheet). */
export function totalSupplementProteinG(
  profile: OnboardingAnswers | null | undefined,
): number {
  const stack = profile?.supplementStack;
  if (!stack?.length) return 0;
  return stack.reduce((s, x) => s + (x.proteinGPerDay ?? 0), 0);
}

export function newSupplementEntry(
  type: UserSupplementEntry["type"],
): UserSupplementEntry {
  return {
    id: uid(),
    type,
    name:
      type === "protein_powder"
        ? "Proteiinijauhe"
        : type === "creatine"
          ? "Kreatiini"
          : "Lisäravinne",
    proteinGPerDay: type === "protein_powder" ? 25 : 0,
    doseLabel: type === "creatine" ? "5 g" : undefined,
  };
}
