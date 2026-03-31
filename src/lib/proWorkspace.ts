import type { ProWorkspace } from "@/types/pro";

export const PRO_WORKSPACE_KEY = "ai-coach-pro-workspace-v1";

export function defaultProWorkspace(): ProWorkspace {
  return {
    trainingProgram: null,
    mealPlan: null,
    exerciseProgress: {},
    pendingAiSuggestions: [],
    appliedSuggestionIds: [],
  };
}

export function loadProWorkspace(): ProWorkspace {
  if (typeof window === "undefined") return defaultProWorkspace();
  try {
    const raw = localStorage.getItem(PRO_WORKSPACE_KEY);
    if (!raw) return defaultProWorkspace();
    const p = JSON.parse(raw) as Partial<ProWorkspace>;
    return {
      ...defaultProWorkspace(),
      ...p,
      exerciseProgress: p.exerciseProgress ?? {},
      pendingAiSuggestions: p.pendingAiSuggestions ?? [],
      appliedSuggestionIds: p.appliedSuggestionIds ?? [],
    };
  } catch {
    return defaultProWorkspace();
  }
}

export function saveProWorkspace(w: ProWorkspace): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRO_WORKSPACE_KEY, JSON.stringify(w));
  } catch {
    /* ignore */
  }
}
