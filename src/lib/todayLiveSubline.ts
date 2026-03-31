import type { MessageKey } from "@/lib/i18n";

/** One quiet live line — morning vs rest of day, no API. */
export function todayLiveSublineKey(now: Date): MessageKey {
  return now.getHours() < 12
    ? "today.liveSignalMorning"
    : "today.liveSignalRecent";
}
