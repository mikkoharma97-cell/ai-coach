"use client";

import { MachineScanCard } from "@/components/workout/MachineScanCard";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { CoachScreenHeader } from "@/components/ui/CoachScreenHeader";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { useClientProfile } from "@/hooks/useClientProfile";
import Link from "next/link";

export function ScanPlaceholderScreen() {
  const { t } = useTranslation();
  const profile = useClientProfile();

  if (profile === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[15px] text-muted-2">
        {t("common.loading")}
      </div>
    );
  }

  if (!profile) {
    return <CoachProfileMissingFallback />;
  }

  return (
    <main className="coach-page">
      <Container size="phone" className="px-5">
        <CoachScreenHeader
          eyebrow={t("scan.eyebrow")}
          title={t("scan.title")}
          description={t("scan.body")}
        />
        <MachineScanCard />
        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.06] pt-8">
          <Link
            href="/app"
            className="text-center text-[15px] font-semibold text-accent hover:underline"
          >
            {t("nav.backToToday")}
          </Link>
          <Link
            href="/workout"
            className="text-center text-[14px] font-medium text-muted hover:text-foreground"
          >
            {t("workout.eyebrow")}
          </Link>
          <Link
            href="/plan"
            className="text-center text-[14px] font-medium text-muted hover:text-foreground"
          >
            {t("nav.plan")}
          </Link>
          <Link
            href="/food"
            className="text-center text-[14px] font-medium text-muted hover:text-foreground"
          >
            {t("nav.food")}
          </Link>
        </div>
      </Container>
    </main>
  );
}
