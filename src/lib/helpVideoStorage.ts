import type { HelpVideoPageId } from "@/types/help";

const PREFIX = "ai-coach-help-dismissed-v1:";

export function isHelpCardDismissed(pageId: HelpVideoPageId): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(PREFIX + pageId) === "1";
  } catch {
    return false;
  }
}

export function setHelpCardDismissed(
  pageId: HelpVideoPageId,
  dismissed: boolean,
): void {
  if (typeof window === "undefined") return;
  try {
    const k = PREFIX + pageId;
    if (dismissed) localStorage.setItem(k, "1");
    else localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}
