"use client";

import { ErrorState } from "@/components/common/ErrorState";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";

type Handoff = "packages" | undefined;

/** Kun profiilia ei ole / lataus päättyi tyhjään — ei ikuista spinneriä. */
export function CoachProfileMissingFallback({
  handoff,
}: {
  /** Paketit ilman profiilia: selitä aloitus → paketti -polku. */
  handoff?: Handoff;
} = {}) {
  const { t } = useTranslation();
  const router = useRouter();
  const isPackages = handoff === "packages";
  return (
    <main className="coach-page">
      <Container size="phone" className="px-5 py-12">
        <ErrorState
          title={
            isPackages
              ? t("fallback.packagesHandoffTitle")
              : t("fallback.profileMissingTitle")
          }
          description={
            isPackages
              ? t("fallback.packagesHandoffBody")
              : t("fallback.profileLoadFailed")
          }
          actionLabel={
            isPackages
              ? t("fallback.packagesHandoffCta")
              : t("fallback.openStart")
          }
          onAction={() => router.push("/start")}
        />
      </Container>
    </main>
  );
}
