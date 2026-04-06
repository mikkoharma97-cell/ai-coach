/**
 * Kevyt “päivän ankkuri” — yksi checkbox / päivä, ei habit-järjestelmää.
 */
const PREFIX = "coach-day-anchor-done:";

export function isAnchorDone(dayKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(PREFIX + dayKey) === "1";
  } catch {
    return false;
  }
}

export function setAnchorDone(dayKey: string, done: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (done) localStorage.setItem(PREFIX + dayKey, "1");
    else localStorage.removeItem(PREFIX + dayKey);
  } catch {
    /* ignore */
  }
}

/** Deterministinen ankkuri päivästä (0–2) — sama päivä = sama ehdotus. */
export function anchorKindForDay(dayKey: string): 0 | 1 | 2 {
  let h = 0;
  for (let i = 0; i < dayKey.length; i++) h = (h + dayKey.charCodeAt(i) * (i + 1)) % 997;
  return (h % 3) as 0 | 1 | 2;
}
