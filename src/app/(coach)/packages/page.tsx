"use client";

import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { ProgramPackageCards } from "@/components/packages/ProgramPackageCards";
import { CoachScreenHeader } from "@/components/ui/CoachScreenHeader";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { applyPackageToAnswers } from "@/lib/programPackages";
import { loadProfile, saveProfile } from "@/lib/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function PackagesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [profile] = useState(() => loadProfile());

  useEffect(() => {
    if (!profile) router.replace("/start");
  }, [profile, router]);

  const onSelect = useCallback(
    (packageId: string) => {
      const p = loadProfile();
      if (!p) {
        router.push("/start");
        return;
      }
      const patch = applyPackageToAnswers(packageId);
      saveProfile({ ...p, ...patch });
      router.push("/app");
    },
    [router],
  );

  if (!profile) {
    return <CoachProfileMissingFallback />;
  }

  return (
    <main className="coach-page">
      <Container size="phone" className="px-5 pb-16 pt-8">
        <CoachScreenHeader
          eyebrow={t("packages.eyebrow")}
          eyebrowClassName="sr-only"
          title={t("packages.title")}
          description={t("packages.subtitle")}
        />
        <div className="mt-8">
          <ProgramPackageCards
            selectedId={profile.selectedPackageId}
            onSelect={onSelect}
          />
        </div>
        <p className="mt-8 text-center text-[12px] text-muted-2">
          <Link
            href="/app"
            className="font-semibold text-accent underline-offset-[3px] hover:underline"
          >
            {t("packages.saveBack")}
          </Link>
        </p>
      </Container>
    </main>
  );
}
