"use client";

import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { CoachingPackagesView } from "@/components/packages/CoachingPackagesView";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { applyPackageToAnswers } from "@/lib/programPackages";
import { loadProfile, saveProfile } from "@/lib/storage";
import type { ProgramPackageId } from "@/types/coach";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function PackagesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ReturnType<typeof loadProfile> | undefined>(
    undefined,
  );

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const onSelectPackage = useCallback(
    (packageId: ProgramPackageId) => {
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

  if (profile === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[15px] text-muted-2">
        {t("common.loading")}
      </div>
    );
  }

  if (!profile) {
    return <CoachProfileMissingFallback handoff="packages" />;
  }

  return (
    <main className="coach-page flex min-h-0 min-w-0 flex-1 flex-col">
      <CoachingPackagesView
        selectedPackageId={profile.selectedPackageId}
        onSelectPackage={onSelectPackage}
      />
      <Container size="phone" className="border-t border-white/[0.06] bg-[#050608] px-5 py-6">
        <p className="text-center text-[13px] text-white/50">
          <Link
            href="/app"
            className="font-semibold text-cyan-300/90 underline-offset-[3px] hover:text-cyan-200 hover:underline"
          >
            {t("packages.saveBack")}
          </Link>
        </p>
      </Container>
    </main>
  );
}
