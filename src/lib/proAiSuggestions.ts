import type { ProAiSuggestion, ProTrainingProgram } from "@/types/pro";

let suggestionId = 0;
function id() {
  suggestionId += 1;
  return `sug-${Date.now()}-${suggestionId}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Kevyt sääntöpohjainen ehdotuskerros — ei korvaa guided-moottoria.
 */
export function buildProAiSuggestions(
  program: ProTrainingProgram | null,
): ProAiSuggestion[] {
  if (!program || program.days.length === 0) return [];

  const push = program.days.find((d) => d.name.toLowerCase().includes("push"));
  const firstBench = push?.exercises.find(
    (e) => e.id === "bench_press" || e.id === "bench",
  );

  const out: ProAiSuggestion[] = [
    {
      id: id(),
      kind: "add_exercise",
      titleFi: "Lisää kevyt takaolkapää",
      titleEn: "Add a light rear-delt move",
      detailFi:
        "Lisää tähän yksi kevyempi takaolkapääliike — tasapainottaa työntöpäivää.",
      detailEn:
        "Add one light rear-delt exercise — balances your push day volume.",
      dayId: push?.id,
      exerciseId: firstBench?.id,
    },
    {
      id: id(),
      kind: "volume",
      titleFi: "Yksi alempi volyymipäivä",
      titleEn: "One lower-volume day",
      detailFi:
        "Pidä tässä viikossa yksi alempi volyymipäivä — anna hermolle tilaa.",
      detailEn:
        "Keep one lower-volume day this week — give the nervous system room.",
    },
    {
      id: id(),
      kind: "rep_range",
      titleFi: "Penkki: 8–10 → 10–12",
      titleEn: "Bench: 8–10 → 10–12",
      detailFi:
        "Nosta tämän liikkeen tavoitealue 8–10 → 10–12 ennen kuormaa.",
      detailEn:
        "Widen this lift’s target range to 10–12 before bumping load.",
      exerciseId: firstBench?.id ?? "bench_press",
    },
  ];

  return out;
}
