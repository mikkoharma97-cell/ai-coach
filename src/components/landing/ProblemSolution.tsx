import { Container } from "@/components/ui/Container";

const points = [
  "One clear task per day",
  "No thinking required",
  "No overwhelming plans",
  "Just execution",
] as const;

export function ProblemSolution() {
  return (
    <section className="border-b border-border/60 bg-card py-20 sm:py-24">
      <Container size="default" className="max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-2">
          What you get
        </p>
        <h2 className="mt-4 text-[1.65rem] font-semibold leading-[1.12] tracking-[-0.03em] text-foreground sm:text-[1.875rem]">
          Not another app that adds noise.
        </h2>
        <ul className="mt-8 space-y-4">
          {points.map((line) => (
            <li
              key={line}
              className="flex gap-4 text-[17px] font-medium leading-snug tracking-tight text-foreground"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
