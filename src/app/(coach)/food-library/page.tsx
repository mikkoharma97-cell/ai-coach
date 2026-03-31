"use client";

import { FoodLibrarySearch } from "@/components/food/FoodLibrarySearch";
import { Container } from "@/components/ui/Container";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useTranslation } from "@/hooks/useTranslation";
import { useClientProfile } from "@/hooks/useClientProfile";

export default function FoodLibraryPage() {
  const { t } = useTranslation();
  const profile = useClientProfile();

  if (profile === undefined) {
    return (
      <main className="coach-page flex min-h-[40vh] items-center justify-center text-muted-2">
        {t("common.loading")}
      </main>
    );
  }
  if (!profile) return <CoachProfileMissingFallback />;

  return (
    <main className="coach-page">
      <Container size="phone" className="px-5 py-8">
        <h1 className="text-[1.375rem] font-semibold tracking-[-0.03em] text-foreground">
          {t("foodLibrary.pageTitle")}
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          {t("foodLibrary.searchPlaceholder")}
        </p>
        <div className="mt-8">
          <FoodLibrarySearch />
        </div>
      </Container>
    </main>
  );
}
