/**
 * Treenijakosuositus — profiili + päivät + arki (konservatiivinen V1).
 */
import { getProgramLibraryEntry } from "@/lib/coachProgramCatalog";
import type { OnboardingAnswers } from "@/types/coach";
import { effectiveTrainingLevel } from "@/lib/profileTraining";

export type SplitRecommendation = {
  splitLabelFi: string;
  splitLabelEn: string;
  rationaleFi: string;
  rationaleEn: string;
  /** Viikkorakenne-tyylinen vihje */
  structureHintFi: string;
  structureHintEn: string;
};

export function recommendSplitForProfile(
  profile: OnboardingAnswers,
): SplitRecommendation {
  const d = profile.daysPerWeek ?? 3;
  const v = profile.trainingVenue ?? "mixed";
  const goal = profile.goal;
  const level = effectiveTrainingLevel(profile);
  const life = profile.lifeSchedule ?? "regular";
  const busy =
    life === "busy_day" ||
    life === "late_schedule" ||
    profile.biggestChallenge === "lack_of_time";
  const shift = life === "shift_work" || profile.shiftMode;
  const comeback = profile.lastBestShape === "long_ago";

  const lib = profile.selectedProgramLibraryId
    ? getProgramLibraryEntry(profile.selectedProgramLibraryId)
    : undefined;
  if (lib?.splitType) {
    return {
      splitLabelFi: lib.splitType,
      splitLabelEn: lib.splitType,
      rationaleFi:
        "Valittu ohjelma sanelee jakorungon — pidä tämä viikkorytmin ankkurina.",
      rationaleEn:
        "Your chosen program sets the split — keep it as your weekly anchor.",
      structureHintFi: `Noin ${lib.weeklyDays.min}–${lib.weeklyDays.max} treenipäivää / vko.`,
      structureHintEn: `About ${lib.weeklyDays.min}–${lib.weeklyDays.max} training days / week.`,
    };
  }

  if (shift || busy) {
    return {
      splitLabelFi: "Yksinkertainen jako",
      splitLabelEn: "Simple split",
      rationaleFi:
        "Vuoro tai kiire: vähemmän logistista kitkaa — toista sama rakenne.",
      rationaleEn:
        "Shift or busy life: less friction — repeat the same structure.",
      structureHintFi: "Koko keho tai ylä/ala kevyesti, 2–4 pv.",
      structureHintEn: "Full body or light upper/lower, 2–4 days.",
    };
  }

  if (comeback && level === "beginner") {
    return {
      splitLabelFi: "Paluu — koko keho",
      splitLabelEn: "Comeback — full body",
      rationaleFi: "Paluuhetkellä yksi tuttu rakenne kerrallaan.",
      rationaleEn: "On a comeback, one familiar pattern at a time.",
      structureHintFi: "2–3 päivää, sama runko.",
      structureHintEn: "2–3 days, same structure.",
    };
  }

  if (d <= 2) {
    return {
      splitLabelFi: "Koko keho / kevyt jako",
      splitLabelEn: "Full body / light split",
      rationaleFi: "Kahdella päivällä koko kehon rytmi toistuu.",
      rationaleEn: "With two days, full-body rhythm repeats.",
      structureHintFi: "2 pv / vko.",
      structureHintEn: "2 d/wk.",
    };
  }

  if (d === 3) {
    return {
      splitLabelFi:
        goal === "build_muscle" ? "Push / pull / legs (kevyt)" : "Koko keho tai ylä/ala",
      splitLabelEn:
        goal === "build_muscle" ? "Push / pull / legs (lite)" : "Full body or upper/lower",
      rationaleFi: "Kolme päivää: joko koko keho tai kevyt jako.",
      rationaleEn: "Three days: full body or a light split.",
      structureHintFi: v === "home" ? "Koti: koko keho usein paras." : "Sali: PPL tai upper/lower.",
      structureHintEn:
        v === "home" ? "Home: full body often wins." : "Gym: PPL or upper/lower.",
    };
  }

  if (d === 4) {
    return {
      splitLabelFi: "Ylä / ala",
      splitLabelEn: "Upper / lower",
      rationaleFi: "Neljä päivää: klassinen jako volyymille ja palautumiselle.",
      rationaleEn: "Four days: classic split for volume and recovery.",
      structureHintFi: "2 ylä + 2 ala.",
      structureHintEn: "2 upper + 2 lower.",
    };
  }

  return {
    splitLabelFi: goal === "build_muscle" ? "PPL tai suoritusjako" : "Suoritus / jako",
    splitLabelEn: goal === "build_muscle" ? "PPL or performance split" : "Performance / split",
    rationaleFi:
      level === "advanced"
        ? "Viisi+ päivää: joko PPL tai suorituspainotteinen jako."
        : "Useampi päivä: pidä yksi pääjakomalli kerrallaan.",
    rationaleEn:
      level === "advanced"
        ? "Five+ days: PPL or a performance-biased split."
        : "More days: keep one main split pattern at a time.",
    structureHintFi: "5–6 pv / vko.",
    structureHintEn: "5–6 d/wk.",
  };
}
