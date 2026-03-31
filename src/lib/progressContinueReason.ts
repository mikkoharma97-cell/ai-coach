import type { MessageKey } from "@/lib/i18n";

/** Yksi syy palata Progressiin / appiin huomenna — retention. */
export function progressContinueReasonKey(input: {
  combinedStreak: number;
  consistencyPct: number;
  rebalanceActive: boolean;
}): MessageKey {
  if (input.rebalanceActive) return "progress.continueReason.rebalance";
  if (input.combinedStreak >= 4) return "progress.continueReason.streak";
  if (input.consistencyPct >= 55) return "progress.continueReason.consistency";
  if (input.combinedStreak >= 1) return "progress.continueReason.streak";
  return "progress.continueReason.default";
}
