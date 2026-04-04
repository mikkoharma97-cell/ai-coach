import type { LandingDemoSettings } from "./landingDemoSettings";

export type DayMark = "rest" | "done" | "miss";

export type HumanGlitch = { kind: "miss" | "light"; dayLabel: string };

export type LandingFakeWeekModel = {
  headline: string;
  sub: string;
  volumeTrendLabel: string;
  recoveryLabel: string;
  rhythmLabel: string;
  nutritionLabel: string;
  weekDays: { label: string; mark: DayMark }[];
  completedSessions: number;
  plannedSessions: number;
  highlightMetric: string;
  secondaryMetric: string;
  /** Yksi inhimmillinen rivi: miss → jäi väliin, muuten lepopäivä → kevyt päivä */
  humanGlitch: HumanGlitch | null;
};

function seedFromSettings(s: LandingDemoSettings): number {
  const str = `${s.goal}-${s.sessionsPerWeek}-${s.mealStyle}`;
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function rnd(seed: number, i: number): number {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const templates: Record<number, number[]> = {
  3: [0, 2, 4],
  4: [0, 2, 4, 5],
  5: [0, 1, 3, 4, 6],
  6: [0, 1, 2, 4, 5, 6],
};

/** Ensimmäinen viikko — fake, mutta ei koskaan ylitä valittua tiheyttä. */
export function buildLandingFakeWeek(
  settings: LandingDemoSettings,
): LandingFakeWeekModel {
  const seed = seedFromSettings(settings);
  const n = settings.sessionsPerWeek;
  const plannedSessions = n;

  /** Ei täydellinen viikko — yksi–kaksi lipsahdusta useammin kuin satunnaisesti. */
  const slip =
    rnd(seed, 2) > 0.72 ? 1 : rnd(seed, 3) > 0.88 ? 2 : 0;
  const completedSessions = Math.max(1, plannedSessions - slip);

  const labels = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];
  const pattern: DayMark[] = labels.map(() => "rest");

  const pick = (templates[n] ?? [0, 2, 4]).slice(0, n);

  let doneCount = 0;
  pick.forEach((d) => {
    if (doneCount < completedSessions) {
      pattern[d] = "done";
      doneCount += 1;
    } else {
      pattern[d] = "miss";
    }
  });

  const weekDays = labels.map((label, i) => ({
    label,
    mark: pattern[i],
  }));

  const missDay = weekDays.find((d) => d.mark === "miss");
  const rests = weekDays.filter((d) => d.mark === "rest");
  /** Yksi logiikka: ensin miss (jäi väliin), muuten lepo (kevyt päivä) */
  const humanGlitch: HumanGlitch | null = missDay
    ? { kind: "miss", dayLabel: missDay.label }
    : rests.length > 0
      ? {
          kind: "light",
          dayLabel: rests[Math.floor(rnd(seed, 11) * rests.length)]!.label,
        }
      : null;

  if (settings.goal === "muscle") {
    const vol =
      rnd(seed, 6) > 0.45
        ? "Volyymi hieman edellisestä viikosta"
        : "Volyymi tasainen — seuraava nousu seuraavalla syklillä";
    const rec =
      rnd(seed, 7) > 0.4
        ? "Palautuminen hyvä"
        : "Uni vaihteli — yksi ilta lyhyempi";
    return {
      headline: "Ensimmäinen viikko: rytmi päällä",
      sub: "Ei täydellistä — mutta suunta ja toistuvuus kohdillaan.",
      volumeTrendLabel: vol,
      recoveryLabel: rec,
      rhythmLabel: `${completedSessions}/${plannedSessions} treeniä toteutui`,
      nutritionLabel:
        settings.mealStyle === "light"
          ? "Proteiini ja määrä hallussa"
          : "Joustava linja — pidät tahdin",
      weekDays,
      completedSessions,
      plannedSessions,
      highlightMetric: "Kuormitus",
      secondaryMetric: "Palautuminen",
      humanGlitch,
    };
  }

  const rhythmBase =
    rnd(seed, 8) > 0.35
      ? "Ateriarytmi pysyi useimpina päivinä"
      : "Viikonloppu jousti — ei kaadu";

  const nutritionLabel =
    settings.mealStyle === "light"
      ? `${rhythmBase} — kevyempi linja näkyi`
      : `${rhythmBase} — joustava linja piti`;

  return {
    headline: "Ensimmäinen viikko: rytmi ja toistuvuus",
    sub: "Trendi enemmän kuin päivittäinen vaihtelu.",
    volumeTrendLabel:
      rnd(seed, 9) > 0.5
        ? "Liike määrä pysyi tavoitteessa"
        : "Kävelyä hieman enemmän — hyvä lisä",
    recoveryLabel:
      rnd(seed, 10) > 0.42
        ? "Uni ja stressi: ok"
        : "Uni vaihteli — yksi ilta korosti palautumista",
    rhythmLabel: `${completedSessions}/${plannedSessions} treeniä — linjassa tavoitteeseen`,
    nutritionLabel,
    weekDays,
    completedSessions,
    plannedSessions,
    highlightMetric: "Rytmi",
    secondaryMetric: "Energia",
    humanGlitch,
  };
}
