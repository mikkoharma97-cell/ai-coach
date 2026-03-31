const KEY = "ai-coach-autopilot-week-v1";

export const AUTOPILOT_CHANGED = "ai-coach-autopilot-changed";

export function loadAutopilotEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const v = JSON.parse(raw) as { enabled?: boolean };
    return v?.enabled === true;
  } catch {
    return false;
  }
}

export function saveAutopilotEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ enabled }));
    window.dispatchEvent(new CustomEvent(AUTOPILOT_CHANGED));
  } catch {
    /* ignore */
  }
}
