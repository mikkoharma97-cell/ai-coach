/**
 * Ohjelmalinjojen esikatselu (/program). Informatiivista; aktivointi /packages-kautta.
 */
import { PROGRAM_BLOCK_WEEKS, type Localized } from "./coachOffer";

const W = PROGRAM_BLOCK_WEEKS;

export type ProgramLineCard = {
  id: "mass" | "diet" | "kickstart" | "maintain";
  headline: Localized;
  goal: Localized;
  benefit: Localized;
  weeks: number;
  gradient: string;
  ring: string;
};

export const PROGRAM_LINE_CARDS: ProgramLineCard[] = [
  {
    id: "mass",
    headline: { fi: "KASVU", en: "GROWTH" },
    goal: {
      fi: "Lihasta ja nostovoimaa — nousujohteinen rakenne, joka kestää toistoa.",
      en: "Muscle and strength — progressive structure built for repeats.",
    },
    benefit: {
      fi: "Sama linja kiireviikollakin: volyymi ja lepo pysyvät järjessä.",
      en: "Same line on busy weeks: volume and recovery stay sane.",
    },
    weeks: PROGRAM_BLOCK_WEEKS,
    gradient: "from-amber-950/85 via-[#141008] to-black",
    ring: "ring-amber-500/20",
  },
  {
    id: "diet",
    headline: { fi: "MUOTO", en: "LEAN" },
    goal: {
      fi: "Kehonkoostumus haltuun — hallittu energia, ei jatkuvaa nälkäkiertoa.",
      en: "Body composition — controlled energy, not a hunger loop.",
    },
    benefit: {
      fi: "Ruoka ja treeni vetävät samaan suuntaan — ei kahta erillistä projektia.",
      en: "Food and training pull one way — not two separate projects.",
    },
    weeks: PROGRAM_BLOCK_WEEKS,
    gradient: "from-emerald-950/90 via-[#0a1620] to-black",
    ring: "ring-emerald-500/25",
  },
  {
    id: "kickstart",
    headline: { fi: "KÄYNNISTYS", en: "KICKSTART" },
    goal: {
      fi: `${W} viikkoa uuteen rytmiin — selkeä aloitus ilman ylilyöntejä.`,
      en: `${W} weeks into a new rhythm — a clear start without overshooting.`,
    },
    benefit: {
      fi: "Päivittäinen ohjaus kantaa kun motivaatio vaihtelee.",
      en: "Daily guidance carries you when motivation swings.",
    },
    weeks: PROGRAM_BLOCK_WEEKS,
    gradient: "from-violet-950/90 via-[#120818] to-black",
    ring: "ring-violet-400/25",
  },
  {
    id: "maintain",
    headline: { fi: "PIDÄ LINJA", en: "HOLD" },
    goal: {
      fi: "Pidä tulokset ja rutiini — kun elämä ei ole jatkuva dieetti.",
      en: "Keep results and routine — when life isn’t a permanent diet.",
    },
    benefit: {
      fi: "Viikko tasapainottuu arjen mukaan — ei jojoilua.",
      en: "The week balances with life — no yo-yo.",
    },
    weeks: PROGRAM_BLOCK_WEEKS,
    gradient: "from-slate-800/90 via-[#101820] to-black",
    ring: "ring-slate-400/20",
  },
];

export const PROGRAM_PAGE_COPY = {
  title: { fi: "Ohjelmalinjat", en: "Program lines" },
  lead: {
    fi: `Esikatselu: suunta ja ${W} vk blokki. Aktivointi vain paketissa.`,
    en: `Preview: direction and a ${W}-week block. Activation only via package.`,
  },
  activationHonest: {
    fi: "Et osta ohjelmaa tästä — linja valitaan paketeissa, kun profiili on tehty.",
    en: "You don’t buy a program here — you pick the line under Packages once your profile exists.",
  },
  weeksLabel: { fi: "viikkoa", en: "weeks" },
  previewBadge: { fi: "Esikatselu", en: "Preview" },
  ctaPackages: {
    fi: "Siirry paketteihin",
    en: "Go to packages",
  },
  ctaPackagesHint: {
    fi: "Aloitus → paketti → päivän ohjaus.",
    en: "Intake → package → daily guidance.",
  },
} as const;
