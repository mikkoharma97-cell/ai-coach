/**
 * Today display layer — V1 fake copy with stable shapes for later real-data swap.
 * Replace `resolveTodayDisplayMock` internals when backend / user content plugs in.
 */
import { resolveFoodDayMock } from "@/data/foodContent.mock";
import type { ProgramPackage } from "@/lib/programPackages";
import type { Goal, ProgramPackageId } from "@/types/coach";
import type { Locale } from "@/lib/i18n";

export type TodayDisplayKind = "training" | "rest" | "food_only";

export type TodayDisplaySnapshot = {
  heroTitle: string;
  heroGuidance: string;
  /** Lyhyt rivi plan-blokin “Treeni”-solulle */
  planWorkoutLabel: string;
  /** Lyhyt rivi plan-blokin “Ruoka”-solulle (päivän rakenne, ei lokitilasto) */
  planFoodLabel: string;
  /** Tilanne-osion ohjelma/fokus: täydentää hero-päivän tehtävää, ei kopioi sitä */
  programSituationFocus: string;
  /** Tilanne-osion ruoka-rivi kun merkintöjä ei ole vielä */
  situationFoodWhenNoLogs: string;
};

type Bias = ProgramPackage["planBias"];

function programFocusByBias(locale: Locale, bias: Bias): string {
  const fi = locale === "fi";
  const m: Record<Bias, { fi: string; en: string }> = {
    steady: {
      fi: "Rytmi ja toisto — rakennetaan pohja viikolle.",
      en: "Rhythm and reps — building the week’s base.",
    },
    muscle: {
      fi: "Lihaskasvu — nousujohteinen jako ja selkeät sarjat.",
      en: "Hypertrophy — progressive split with clear sets.",
    },
    cut: {
      fi: "Energian hallinta — nälkä pysyy kurissa, treeni pysyy.",
      en: "Energy control — hunger in check, training stays.",
    },
    performance: {
      fi: "Suorituskyky — kuorma ja palautuminen samassa tahdissa.",
      en: "Performance — load and recovery in sync.",
    },
  };
  return fi ? m[bias].fi : m[bias].en;
}

/** Päivän treeniotsikot rotaatiolla (ei moottorin geneeristä “päivä N”) */
function trainingVariant(
  locale: Locale,
  bias: Bias,
  packageId: ProgramPackageId,
  todayIdx: number,
): { title: string; guidance: string; planLine: string } {
  const fi = locale === "fi";
  const salt = (todayIdx + packageId.length) % 4;

  const steady: { fi: { title: string; guidance: string; plan: string }[] } = {
    fi: [
      {
        title: "Koko keho — perusliikkeet",
        guidance:
          "Aloita kevyesti: tekniikka ensin, hengitys mukana. Rakennetaan pohja viikolle.",
        plan: "Koko keho — perus",
      },
      {
        title: "Ylävartalo — työntävät liikkeet",
        guidance:
          "Hallittu nousu, ei kiirettä. Tänään rakennetaan voimaa työntävillä kuvioilla.",
        plan: "Ylävartalo — työntävät",
      },
      {
        title: "Alavartalo — jalkatyö",
        guidance:
          "Polvi ja kantapää linjassa. Pidä sarjat selkeinä ja rytmi tasaisena.",
        plan: "Alavartalo — jalkatyö",
      },
      {
        title: "Palauttava kevyt veto",
        guidance:
          "Kevyt koko keho — verryttely ja muutama sarja, että viikko pysyy kasassa.",
        plan: "Kevyt koko keho",
      },
    ],
  };

  const muscle: { fi: { title: string; guidance: string; plan: string }[] } = {
    fi: [
      {
        title: "Ylävartalo — työntävät liikkeet",
        guidance:
          "Aloita päivän päätreeni. Tänään rakennetaan voimaa hallitulla nousulla.",
        plan: "Ylävartalo — työntävät",
      },
      {
        title: "Alavartalo — voimatuotanto",
        guidance:
          "Raskaat sarjat, selkeä lepo. Jokainen toisto maksaa — pidä tekniikka.",
        plan: "Alavartalo — voima",
      },
      {
        title: "Selkä ja olkapää — vetävät",
        guidance:
          "Veto hallittuna, lapaluut mukana. Älä kiristä kaulaa — hengitä rintaan.",
        plan: "Vetävät — selkä",
      },
      {
        title: "Kädet ja core — tukivaihe",
        guidance:
          "Loppuviikon tukipäivä: kädet ja keskivartalo, jotta jako pysyy tasapainossa.",
        plan: "Kädet · core",
      },
    ],
  };

  const cut: { fi: { title: string; guidance: string; plan: string }[] } = {
    fi: [
      {
        title: "Koko keho — kireä tempo",
        guidance:
          "Lyhyet lepot, tasainen syke. Tänään ei haeta maksimia — vaan hallittua työtä.",
        plan: "Koko keho — tempo",
      },
      {
        title: "Treeni ja kävely — energian tasapaino",
        guidance:
          "Salitreeni + kevyt kävely. Pidä päivän energia tasaisena aterioiden mukaan.",
        plan: "Sali + kävely",
      },
      {
        title: "Ylävartalo — tiivis sarja",
        guidance:
          "Keskity jännitteeseen, ei määrään. Pidä proteiinit kohdillaan päivän aikana.",
        plan: "Ylävartalo — tiivis",
      },
      {
        title: "Alavartalo — virtaa ilman dumpausta",
        guidance:
          "Polven linja, askel hallittu. Seuraava ateria tukee palautumista.",
        plan: "Alavartalo — virta",
      },
    ],
  };

  const perf: { fi: { title: string; guidance: string; plan: string }[] } = {
    fi: [
      {
        title: "Voima — pääliikkeet",
        guidance:
          "Isojen liikkeiden päivä: rytmi sama, lasti nousuun vain jos tekniikka pysyy.",
        plan: "Voima — pääliikkeet",
      },
      {
        title: "Tilavuus — apuvedot",
        guidance:
          "Sivuvedot ja apulihakset. Tarkoitus: lisää työtä ilman että hermosto kyykkää.",
        plan: "Tilavuus — vedot",
      },
      {
        title: "Alavartalo — raskaat sarjat",
        guidance:
          "Syvä kyykky / painotettu jalkatyö. Lepo täyteen ennen seuraavaa sarjaa.",
        plan: "Alavartalo — raskaat",
      },
      {
        title: "Tekniikka — nopeusvoima",
        guidance:
          "Kevyet nopeat sarjat, laatu ensin. Ei uuvuta — terävöittää.",
        plan: "Nopeusvoima",
      },
    ],
  };

  const enSteady = [
    {
      title: "Full body — basics",
      guidance:
        "Start light: technique first, breathe with each rep. Build the week’s base.",
      plan: "Full body — basics",
    },
    {
      title: "Upper — push focus",
      guidance:
        "Controlled ascent, no rush. Today we build strength on pushing patterns.",
      plan: "Upper — push",
    },
    {
      title: "Lower — leg work",
      guidance:
        "Knee and heel aligned. Keep sets clear and rhythm even.",
      plan: "Lower — legs",
    },
    {
      title: "Light recovery full body",
      guidance:
        "Easy full body — warm-up and a few sets so the week stays on track.",
      plan: "Light full body",
    },
  ];

  const enMuscle = [
    {
      title: "Upper — pushing",
      guidance:
        "Start today’s main session. Build strength with controlled upward work.",
      plan: "Upper — push",
    },
    {
      title: "Lower — strength output",
      guidance:
        "Heavy sets, clear rest. Every rep counts — keep form tight.",
      plan: "Lower — strength",
    },
    {
      title: "Back & shoulders — pulls",
      guidance:
        "Pull with control, scapulae engaged. Don’t brace the neck — breathe wide.",
      plan: "Pull — back",
    },
    {
      title: "Arms & core — support",
      guidance:
        "Support day for arms and midline so the split stays balanced.",
      plan: "Arms · core",
    },
  ];

  const enCut = [
    {
      title: "Full body — tight tempo",
      guidance:
        "Short rests, steady heart rate. Not max effort — controlled work today.",
      plan: "Full body — tempo",
    },
    {
      title: "Session + walk — balance",
      guidance:
        "Gym work plus an easy walk. Keep daily energy even with your meals.",
      plan: "Gym + walk",
    },
    {
      title: "Upper — compact sets",
      guidance:
        "Focus on tension, not volume. Keep protein on track through the day.",
      plan: "Upper — compact",
    },
    {
      title: "Lower — smooth power",
      guidance:
        "Knee line, controlled steps. Next meal supports recovery.",
      plan: "Lower — smooth",
    },
  ];

  const enPerf = [
    {
      title: "Strength — main lifts",
      guidance:
        "Big lifts day: same rhythm, add load only if form holds.",
      plan: "Strength — mains",
    },
    {
      title: "Volume — accessories",
      guidance:
        "Side and accessory work — more training without frying the nervous system.",
      plan: "Volume — accessories",
    },
    {
      title: "Lower — heavy sets",
      guidance:
        "Deep leg work. Rest fully before the next set.",
      plan: "Lower — heavy",
    },
    {
      title: "Skill — speed-strength",
      guidance:
        "Light fast sets, quality first. Sharpens without draining.",
      plan: "Speed-strength",
    },
  ];

  const idx = salt;
  let row: { title: string; guidance: string; plan: string };

  if (bias === "steady") {
    row = fi ? steady.fi[idx]! : enSteady[idx]!;
  } else if (bias === "muscle") {
    row = fi ? muscle.fi[idx]! : enMuscle[idx]!;
  } else if (bias === "cut") {
    row = fi ? cut.fi[idx]! : enCut[idx]!;
  } else {
    row = fi ? perf.fi[idx]! : enPerf[idx]!;
  }

  return { title: row.title, guidance: row.guidance, planLine: row.plan };
}

function restSnapshot(
  locale: Locale,
  mealCount: number,
  mealStyle: ProgramPackage["mealStyle"],
  bias: Bias,
  goal: Goal,
): TodayDisplaySnapshot {
  const fi = locale === "fi";
  const food = resolveFoodDayMock({
    mealCount,
    style: mealStyle,
    goal,
    locale,
    planBias: bias,
  }).foodPlanLabel;
  return {
    heroTitle: fi ? "Palautuminen ja rytmi" : "Recovery & rhythm",
    heroGuidance: fi
      ? "Tänään ei haeta kovaa kuormaa. Pidetään rytmi kasassa ja annetaan kehon palautua."
      : "No hard load today. Keep rhythm and let the body recover.",
    planWorkoutLabel: fi ? "Lepo — kevyt liike" : "Rest — light movement",
    planFoodLabel: food,
    programSituationFocus: programFocusByBias(locale, bias),
    situationFoodWhenNoLogs: fi
      ? `${food} — päivän rakenne`
      : `${food} — today’s structure`,
  };
}

function foodOnlySnapshot(
  locale: Locale,
  mealCount: number,
  mealStyle: ProgramPackage["mealStyle"],
  bias: Bias,
  goal: Goal,
): TodayDisplaySnapshot {
  const fi = locale === "fi";
  const food = resolveFoodDayMock({
    mealCount,
    style: mealStyle,
    goal,
    locale,
    planBias: bias,
  }).foodPlanLabel;
  return {
    heroTitle: fi ? "Ruokarytmi — päivän linja" : "Meal rhythm — today’s line",
    heroGuidance: fi
      ? "Pidä energiansaanti tasaisena ja varmista päivän proteiinit. Tämä kantaa, vaikka sali odottaa."
      : "Keep energy steady and hit today’s protein. This carries you even when the gym waits.",
    planWorkoutLabel: fi ? "Ei salipainotusta" : "No gym focus",
    planFoodLabel: food,
    programSituationFocus: programFocusByBias(locale, bias),
    situationFoodWhenNoLogs: fi
      ? `Tavoite: ${food}`
      : `Target: ${food}`,
  };
}

export function resolveTodayDisplayMock(args: {
  locale: Locale;
  packageId: ProgramPackageId;
  planBias: Bias;
  mealCount: number;
  mealStyle: ProgramPackage["mealStyle"];
  todayIdx: number;
  kind: TodayDisplayKind;
  goal: Goal;
}): TodayDisplaySnapshot {
  const {
    locale,
    packageId,
    planBias,
    mealCount,
    mealStyle,
    todayIdx,
    kind,
    goal,
  } = args;

  if (kind === "rest") {
    return restSnapshot(locale, mealCount, mealStyle, planBias, goal);
  }
  if (kind === "food_only") {
    return foodOnlySnapshot(locale, mealCount, mealStyle, planBias, goal);
  }

  const v = trainingVariant(locale, planBias, packageId, todayIdx);
  const food = resolveFoodDayMock({
    mealCount,
    style: mealStyle,
    goal,
    locale,
    packageId,
    planBias,
  }).foodPlanLabel;
  const fi = locale === "fi";

  return {
    heroTitle: v.title,
    heroGuidance: v.guidance,
    planWorkoutLabel: v.planLine,
    planFoodLabel: food,
    programSituationFocus: programFocusByBias(locale, planBias),
    situationFoodWhenNoLogs: fi
      ? `${food} — kirjaa päivän ateriat, kun ehdit`
      : `${food} — log meals when you can`,
  };
}
