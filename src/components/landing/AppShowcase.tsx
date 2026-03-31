import { AppPreview } from "@/components/AppPreview";
import { CTAButton } from "@/components/CTAButton";
import { Container } from "@/components/ui/Container";

export function AppShowcase() {
  return (
    <section className="border-t border-border/60 py-24 sm:py-32">
      <Container>
        <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 xl:gap-16">
          <div className="max-w-md lg:pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-2">
              What you open daily
            </p>
            <h2 className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-[2rem]">
              One card. The whole day.
            </h2>
            <p className="mt-6 text-[17px] leading-[1.65] text-muted">
              No feed, no scores, no tabs.{" "}
              <span className="font-medium text-foreground">Today</span> is the
              product — the rest is support.
            </p>
            <div className="mt-10">
              <CTAButton href="/start">Start now</CTAButton>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <AppPreview />
          </div>
        </div>
      </Container>
    </section>
  );
}
