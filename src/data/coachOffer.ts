/**
 * Valmennustarjooma: paketit, “mitä saat”, ekosysteemi, /packages-sivun copy.
 * Korvaa myöhemmin oikealla sisältölähteellä; enginePackageId pysyy vakiona.
 */
import type { ProgramPackageId } from "@/types/coach";

export type Localized = { fi: string; en: string };

export function text(loc: "fi" | "en", L: Localized): string {
  return loc === "en" ? L.en : L.fi;
}

/** Yksi esimerkkihinta kaikille tasoille — ei oikeaa maksua tässä buildissa. */
export const SAMPLE_PRICE_LABEL: Localized = {
  fi: "Alk. 149 € / kk · esimerkki",
  en: "From €149 / mo · sample",
};

/** Ohjelmalinjojen esikatselun kesto (viikkoa). */
export const PROGRAM_BLOCK_WEEKS = 12;

export type CoachingTier = {
  tierCode: "START" | "BUILD" | "CUT" | "PERFORMANCE";
  enginePackageId: ProgramPackageId;
  headline: Localized;
  forWho: Localized;
  youGet: Localized[];
  priceLabel: Localized;
  cta: Localized;
  gradient: string;
  ring: string;
};

export const COACHING_TIERS: CoachingTier[] = [
  {
    tierCode: "START",
    enginePackageId: "steady_start",
    headline: { fi: "START", en: "START" },
    forWho: {
      fi: "Kun haluat käynnistyksen: kevyempi kuorma, selkeä rytmi, vähemmän säätöä.",
      en: "When you want a clean start: lighter load, clear rhythm, less fiddling.",
    },
    youGet: [
      {
        fi: "Viikkorunko: treeni + ruoka samaan kalenteriin",
        en: "Weekly frame: training + food in one calendar",
      },
      {
        fi: "Päivän tehtävä — yksi askel kerrallaan",
        en: "One daily task — one step at a time",
      },
      {
        fi: "Perusrutiinit kuntoon ennen kuin kiristät",
        en: "Basics locked in before you tighten the screw",
      },
    ],
    priceLabel: SAMPLE_PRICE_LABEL,
    cta: {
      fi: "Valitse START",
      en: "Choose START",
    },
    gradient: "from-slate-900 via-[#0c1220] to-black",
    ring: "ring-cyan-500/20",
  },
  {
    tierCode: "BUILD",
    enginePackageId: "muscle_rhythm",
    headline: { fi: "BUILD", en: "BUILD" },
    forWho: {
      fi: "Kun tavoite on lihasta ja nostovoimaa — nousujohteinen, toistettava viikko.",
      en: "When the goal is muscle and strength — progressive, repeatable weeks.",
    },
    youGet: [
      {
        fi: "Voima- ja volumilinja joka etenee viikosta toiseen",
        en: "Strength and volume line that progresses week to week",
      },
      {
        fi: "Ruokarakenne joka kantaa treenikuorman",
        en: "Meal structure that supports training load",
      },
      {
        fi: "Seuranta viikkotasolla — ei satunnaisia piikkejä",
        en: "Week-level tracking — not random spikes",
      },
    ],
    priceLabel: SAMPLE_PRICE_LABEL,
    cta: {
      fi: "Valitse BUILD",
      en: "Choose BUILD",
    },
    gradient: "from-amber-950/80 via-[#141008] to-black",
    ring: "ring-amber-400/25",
  },
  {
    tierCode: "CUT",
    enginePackageId: "light_cut",
    headline: { fi: "CUT", en: "CUT" },
    forWho: {
      fi: "Kun kevennät kehonkoostumusta — hallittu rytmi, ei jatkuvaa kiristelyä.",
      en: "When you lean out — controlled rhythm, not endless tightening.",
    },
    youGet: [
      {
        fi: "Energia ja proteiini samassa järjestelmässä kuin treeni",
        en: "Energy and protein in the same system as training",
      },
      {
        fi: "Päivät pysyvät ennustettavina — vähemmän impulsiivisia repsahduksia",
        en: "Days stay predictable — fewer impulse swings",
      },
      {
        fi: "Korjaukset arjen mukaan ilman että linja katoaa",
        en: "Adjustments for real life without losing the line",
      },
    ],
    priceLabel: SAMPLE_PRICE_LABEL,
    cta: {
      fi: "Valitse CUT",
      en: "Choose CUT",
    },
    gradient: "from-emerald-950/85 via-[#081a14] to-black",
    ring: "ring-emerald-400/22",
  },
  {
    tierCode: "PERFORMANCE",
    enginePackageId: "performance_block",
    headline: { fi: "PERFORMANCE", en: "PERFORMANCE" },
    forWho: {
      fi: "Kun viikossa on useampi kova päivä — kuorma, lepo ja ruoka pidetään linjassa.",
      en: "When the week holds more hard days — load, recovery, and food stay aligned.",
    },
    youGet: [
      {
        fi: "Tiiviimpi blokki: enemmän treenipainotteisia päiviä",
        en: "Tighter block: more training-heavy days",
      },
      {
        fi: "Rytmi joka kestää kiireen ja matkat",
        en: "Rhythm that survives busy weeks and travel",
      },
      {
        fi: "Liikeopastus videolla (sisältö täydentyy)",
        en: "Movement cues on video (content fills in over time)",
      },
    ],
    priceLabel: SAMPLE_PRICE_LABEL,
    cta: {
      fi: "Valitse PERFORMANCE",
      en: "Choose PERFORMANCE",
    },
    gradient: "from-violet-950/90 via-[#100818] to-black",
    ring: "ring-violet-400/28",
  },
];

export const COACHING_OFFER_DETAIL: {
  title: Localized;
  lead: Localized;
  bullets: Localized[];
} = {
  title: {
    fi: "Mitä valmennus käytännössä sisältää",
    en: "What coaching actually includes",
  },
  lead: {
    fi: "Sama lähde kuin pakettien hinnassa: esimerkki, ei kassaa. Alla: mitä valmennus lupaa tehdä.",
    en: "Same source as package pricing: an example, not a checkout. Below: what coaching commits to do.",
  },
  bullets: [
    {
      fi: "Kartoitus ja tavoite — mistä lähdetään",
      en: "Intake and goal — where you start",
    },
    {
      fi: "Viikkotason treeni ja ruokarakenne",
      en: "Week-level training and meal structure",
    },
    {
      fi: "Päivän seuraava tehtävä — jatkuva ohjaus",
      en: "The next task for today — ongoing guidance",
    },
    {
      fi: "Viikkoseuranta: suunta ja säätö",
      en: "Weekly check: direction and adjustments",
    },
    {
      fi: "Erityisruokavaliot profiilissa — sisältö täydentyy",
      en: "Special diets in profile — content fills in",
    },
  ],
};

export const COACHING_ECOSYSTEM: {
  title: Localized;
  intro: Localized;
  pillars: { id: string; title: Localized; line: Localized }[];
} = {
  title: {
    fi: "Mitä appissa tehdään päivittäin",
    en: "What you use in the app day to day",
  },
  intro: {
    fi: "Ei erillisiä välilehtiä mielessä — sama valmennuslinja kantaa läpi päivän.",
    en: "No mental tab chaos — one coaching line carries the whole day.",
  },
  pillars: [
    {
      id: "daily",
      title: { fi: "Päivän ohjaus", en: "Daily guidance" },
      line: {
        fi: "Seuraava tehtävä valmiina — tuki täydentyy, ei erillistä säätöfeediä.",
        en: "Next task ready — support fills in, not a separate settings feed.",
      },
    },
    {
      id: "programs",
      title: { fi: "Treeni ja liike", en: "Training & moves" },
      line: {
        fi: "Viikkorunko + järjestys salilla — vähemmän arvailua välisarjoissa.",
        en: "Week frame + order in the gym — less guessing between sets.",
      },
    },
    {
      id: "food",
      title: { fi: "Ruokarytmi", en: "Meal rhythm" },
      line: {
        fi: "Rakenne ja mallit samaan tavoitteeseen — ei irrallista listaruokaa.",
        en: "Structure and templates for the goal — not a loose meal list.",
      },
    },
    {
      id: "progress",
      title: { fi: "Seuranta", en: "Tracking" },
      line: {
        fi: "Viikko kerrallaan: suunta, ei pelkkä numeroseinä.",
        en: "Week by week: direction, not a metric wall.",
      },
    },
  ],
};

export const COACHING_PACKAGES_PAGE = {
  eyebrow: {
    fi: "Valmennuspaketti",
    en: "Coaching package",
  },
  title: {
    fi: "Valitse valmennuslinja",
    en: "Choose your coaching line",
  },
  subtitle: {
    fi: "Paketti kytkee päivittäisen valmennuksen: treeni, ruoka ja viikko samassa järjestelmässä.",
    en: "The package switches on daily coaching: training, food, and the week in one system.",
  },
  flowHint: {
    fi: "Sama esimerkkihinta joka tasossa. Ohjelmalinjat = esikatselu; paketti = aktivointi.",
    en: "Same sample price on every tier. Program lines = preview; package = activation.",
  },
  whatNext: {
    fi: "Valitse paketti → tallennus → päivänäkymä (Tänään).",
    en: "Pick a package → save → Today view.",
  },
  linkPrograms: {
    fi: "Katso ohjelmalinjat (esikatselu)",
    en: "See program lines (preview)",
  },
  selectedBadge: { fi: "Valittu", en: "Selected" },
  footerNote: {
    fi: "Sama esimerkkihinta jokaisessa tasossa. Valinta päivittää linjan sovelluksessa — ei kassaa.",
    en: "Same sample price on every tier. Your choice updates the line in the app — no checkout.",
  },
} as const;
