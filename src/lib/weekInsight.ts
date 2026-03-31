import type {
  CoachDailyPlan,
  OnboardingAnswers,
  PlannedEvent,
} from "@/types/coach";
import { displaySystemLine } from "@/lib/dailyEngine";
import { getProgramPackage } from "@/lib/programPackages";
import type { MessageKey, TranslateFn } from "@/lib/i18n";

function insightFromWeekEvents(
  events: PlannedEvent[] | undefined,
  t: TranslateFn,
): string | null {
  if (!events?.length) return null;
  if (events.some((e) => e.kind === "social")) {
    return t("plan.insightSocialAnchor");
  }
  if (events.some((e) => e.kind === "flexible_intake")) {
    return t("plan.insightFlexAnchor");
  }
  if (events.some((e) => e.kind === "travel")) {
    return t("plan.insightTravelAnchor");
  }
  return null;
}

function packageBiasInsightKey(
  planBias: ReturnType<typeof getProgramPackage>["planBias"],
): MessageKey {
  const m: Record<
    ReturnType<typeof getProgramPackage>["planBias"],
    MessageKey
  > = {
    steady: "plan.insightBiasSteady",
    muscle: "plan.insightBiasMuscle",
    cut: "plan.insightBiasCut",
    performance: "plan.insightBiasPerformance",
  };
  return m[planBias];
}

/**
 * Single dominant Plan insight — why this week isn’t a generic calendar.
 */
export function weekChangedBecause(
  answers: OnboardingAnswers,
  plan: CoachDailyPlan,
  t: TranslateFn,
  /** Optional: planned events intersecting this calendar week */
  eventsThisWeek?: PlannedEvent[],
): string {
  const steering = plan.systemLine?.trim();
  if (steering) {
    return displaySystemLine(plan.systemLine, t);
  }
  const fromCalendar = insightFromWeekEvents(eventsThisWeek, t);
  if (fromCalendar) return fromCalendar;
  if (plan.foodAdjustmentNote?.trim()) {
    return plan.foodAdjustmentNote;
  }

  const pkg = getProgramPackage(answers.selectedPackageId);
  return t(packageBiasInsightKey(pkg.planBias));
}
