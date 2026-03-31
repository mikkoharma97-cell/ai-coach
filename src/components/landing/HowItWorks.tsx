import { Container } from "@/components/ui/Container";

/** Outcome-focused — not a repeat of the story section above. */
const outcomes = [
  {
    title: "A week that fits your schedule",
    body: "Training days are placed where you said you can show up — not copied from a template week.",
  },
  {
    title: "Today is always obvious",
    body: "Open the app: one list — workout, food, activity — in order. No tabs to hunt through.",
  },
  {
    title: "Built around what usually breaks you",
    body: "Your biggest challenge shapes how we phrase your day — so it feels doable, not preachy.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-card py-24 sm:py-32">
      <Container size="narrow">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-2">
          What you actually get
        </p>
        <h2 className="mt-4 text-[1.5rem] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground sm:text-[1.75rem]">
          Less to read. More to do.
        </h2>
        <ul className="mt-12 space-y-10">
          {outcomes.map((item, i) => (
            <li key={item.title} className="max-w-xl">
              <p className="text-[10px] font-semibold tabular-nums tracking-[0.12em] text-muted-2">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-[17px] font-semibold tracking-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-[15px] leading-[1.65] text-muted">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
