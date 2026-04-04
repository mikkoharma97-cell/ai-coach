/**
 * Käyttäjän ohjelmakirjasto — katalogi + suositus; moottori: forcedPresetId.
 * Rivit rikastetaan: splitType, progressionStyle, intensifierPolicyId, blueprint.
 */
import { getProgramBlueprint } from "@/lib/programBlueprints";
import type { WeeklyStructureType } from "@/lib/programPlanTypes";
import {
  getProgramPresetDefinition,
  resolveProgramPresetId,
  type ProgramPresetId,
} from "@/lib/programPresets";
import {
  applyNutritionLibraryEntry,
  recommendNutritionForProfile,
} from "@/lib/nutritionLibrary";
import type { ProgramLibraryEntry } from "@/types/programLibrary";
import type { DaysPerWeek, Goal, OnboardingAnswers, LifeSchedule } from "@/types/coach";
import type { IntensifierPolicyId } from "@/types/intensifierRules";

const SPLIT_FI: Record<WeeklyStructureType, string> = {
  foundation: "Koko keho / kevyt jako",
  rhythm: "Rytmi + koko keho",
  upper_lower: "Ylä / ala",
  split: "Salijako (volyymi)",
  performance: "Suoritusblokki",
  shift: "Vuorolle sopiva jako",
};

function defaultIntensifierPolicy(
  e: ProgramLibraryEntry,
): IntensifierPolicyId {
  if (e.styleTags?.includes("shift_friendly")) return "shift_friendly";
  if (e.level === "beginner") return "conservative";
  if (e.presetId === "performance_block" || e.presetId === "pro_control") {
    return "performance";
  }
  if (e.recommendedFor?.shiftWork) return "shift_friendly";
  return "balanced";
}

function enrichProgramLibraryEntry(e: ProgramLibraryEntry): ProgramLibraryEntry {
  const def = getProgramPresetDefinition(e.presetId as ProgramPresetId);
  const bp = getProgramBlueprint(def.programBlueprintId);
  const splitType = e.splitType ?? SPLIT_FI[def.weeklyStructureType] ?? "Jako";
  return {
    ...e,
    splitType,
    expectedDurationWeeks: e.expectedDurationWeeks ?? { min: 6, max: 10 },
    progressionStyle: e.progressionStyle ?? bp.progressionStyle,
    intensifierPolicyId: e.intensifierPolicyId ?? defaultIntensifierPolicy(e),
    programBlueprintId: e.programBlueprintId ?? def.programBlueprintId,
  };
}

const RAW_PROGRAM_LIBRARY: ProgramLibraryEntry[] = [
  {
    id: "fat_loss_rhythm_light",
    nameFi: "Painonhallinnan kevyt rytmi",
    nameEn: "Light fat-loss rhythm",
    goal: "lose_weight",
    trainingVenue: "any",
    weeklyDays: { min: 2, max: 4 },
    shortDescriptionFi: "Hallittu aloitus, ei äärimakeutuksia.",
    shortDescriptionEn: "Controlled start without extremes.",
    whyItFitsFi: "Kun haluat pudottaa painetta ilman jatkuvaa nälkää.",
    whyItFitsEn: "When you want weight down without constant hunger.",
    styleTag: "rytmi",
    presetId: "fat_loss_rhythm",
    linkedPackageId: "light_cut",
    programTrackId: "light_fat_loss",
  },
  {
    id: "fat_loss_busy",
    nameFi: "Kiireisen kevennys",
    nameEn: "Busy-day fat loss",
    goal: "lose_weight",
    trainingVenue: "any",
    weeklyDays: { min: 2, max: 4 },
    shortDescriptionFi: "Vähän treenipäiviä, selkeä ruokarytmi.",
    shortDescriptionEn: "Fewer training days, clear food rhythm.",
    whyItFitsFi: "Kun aikataulu ei anna periksi.",
    whyItFitsEn: "When your schedule does not give in.",
    styleTag: "kiire",
    presetId: "busy_life_reset",
    linkedPackageId: "light_cut",
    programTrackId: "daily_rhythm",
  },
  {
    id: "fat_loss_gym_4",
    nameFi: "Salilla 4 pv — kevennys",
    nameEn: "Gym 4x — lean phase",
    goal: "lose_weight",
    trainingVenue: "gym",
    weeklyDays: { min: 3, max: 5 },
    shortDescriptionFi: "Enemmän volyymia salilla, ruoka linjassa.",
    shortDescriptionEn: "More gym volume, food aligned.",
    whyItFitsFi: "Kun treenaat salilla useamman kerran viikossa.",
    whyItFitsEn: "When you train at the gym several times a week.",
    styleTag: "sali",
    presetId: "fat_loss_rhythm",
    linkedPackageId: "light_cut",
    programTrackId: "light_fat_loss",
  },
  {
    id: "fat_loss_home",
    nameFi: "Kotona — keveys ja johdonmukaisuus",
    nameEn: "Home — light and consistent",
    goal: "lose_weight",
    trainingVenue: "home",
    weeklyDays: { min: 2, max: 4 },
    shortDescriptionFi: "Liikettä kotona, ruoka yksinkertaisesti.",
    shortDescriptionEn: "Movement at home, food kept simple.",
    whyItFitsFi: "Kun salille ei ole matkaa tai aikaa.",
    whyItFitsEn: "When the gym is not an option.",
    styleTag: "koti",
    presetId: "home_consistency",
    linkedPackageId: "steady_start",
    programTrackId: "daily_rhythm",
  },
  {
    id: "muscle_growth_3day",
    nameFi: "Lihasta 3 treenipäivällä",
    nameEn: "Muscle on 3 days",
    goal: "build_muscle",
    trainingVenue: "any",
    weeklyDays: { min: 3, max: 3 },
    shortDescriptionFi: "Tiivis rakenne, palautuminen mukana.",
    shortDescriptionEn: "Tight package, recovery included.",
    whyItFitsFi: "Kun kolme kovaa päivää riittää.",
    whyItFitsEn: "When three hard days are enough.",
    styleTag: "3 pv",
    presetId: "muscle_growth_structure",
    linkedPackageId: "muscle_rhythm",
    programTrackId: "muscle_growth",
  },
  {
    id: "muscle_growth_4day",
    nameFi: "Lihaskasvu 4 päivää",
    nameEn: "Muscle growth 4 days",
    goal: "build_muscle",
    trainingVenue: "any",
    weeklyDays: { min: 4, max: 5 },
    shortDescriptionFi: "Klassinen salirytmi kasvuun.",
    shortDescriptionEn: "Classic gym rhythm for growth.",
    whyItFitsFi: "Kun nostat neljästi viikossa.",
    whyItFitsEn: "When you lift four times a week.",
    styleTag: "4 pv",
    presetId: "muscle_growth_structure",
    linkedPackageId: "muscle_rhythm",
    programTrackId: "muscle_growth",
  },
  {
    id: "muscle_growth_home",
    nameFi: "Kotona kasvuun",
    nameEn: "Home hypertrophy",
    goal: "build_muscle",
    trainingVenue: "home",
    weeklyDays: { min: 3, max: 4 },
    shortDescriptionFi: "Painot ja kehonpaino, ei monimutkaista.",
    shortDescriptionEn: "Weights and bodyweight, kept simple.",
    whyItFitsFi: "Kun treeni tapahtuu kotona.",
    whyItFitsEn: "When training happens at home.",
    styleTag: "koti",
    presetId: "home_consistency",
    linkedPackageId: "muscle_rhythm",
    programTrackId: "muscle_growth",
  },
  {
    id: "hypertrophy_gym_split",
    nameFi: "Salijako — volyymi",
    nameEn: "Gym split — volume",
    goal: "build_muscle",
    trainingVenue: "gym",
    weeklyDays: { min: 4, max: 6 },
    shortDescriptionFi: "Enemmän päiviä, enemmän tilaa volyymille.",
    shortDescriptionEn: "More days, more room for volume.",
    whyItFitsFi: "Kun olet valmis nostamaan usein.",
    whyItFitsEn: "When you are ready to train often.",
    styleTag: "split",
    presetId: "muscle_growth_structure",
    linkedPackageId: "performance_block",
    programTrackId: "muscle_growth",
  },
  {
    id: "beginner_foundation",
    nameFi: "Aloittelijan perusta",
    nameEn: "Beginner foundation",
    goal: "improve_fitness",
    trainingVenue: "any",
    weeklyDays: { min: 2, max: 4 },
    shortDescriptionFi: "Tekniikka ja rutiini ensin.",
    shortDescriptionEn: "Technique and routine first.",
    whyItFitsFi: "Kun rakennat pohjaa rauhassa.",
    whyItFitsEn: "When you build the base calmly.",
    styleTag: "aloitus",
    presetId: "beginner_foundation",
    linkedPackageId: "steady_start",
    programTrackId: "daily_rhythm",
  },
  {
    id: "comeback_restart",
    nameFi: "Paluu ja uusi alku",
    nameEn: "Comeback restart",
    goal: "improve_fitness",
    trainingVenue: "any",
    weeklyDays: { min: 2, max: 4 },
    shortDescriptionFi: "Kevyt paluu ilman häpeää.",
    shortDescriptionEn: "A light return without shame.",
    whyItFitsFi: "Kun tauko on venynyt.",
    whyItFitsEn: "When the break has been long.",
    styleTag: "paluu",
    presetId: "comeback_restart",
    linkedPackageId: "steady_start",
    programTrackId: "returning",
  },
  {
    id: "busy_life_reset",
    nameFi: "Kiireisen arjen nollaus",
    nameEn: "Busy life reset",
    goal: "improve_fitness",
    trainingVenue: "any",
    weeklyDays: { min: 2, max: 3 },
    shortDescriptionFi: "Vähän mutta säännöllisesti.",
    shortDescriptionEn: "Little but consistent.",
    whyItFitsFi: "Kun kalenteri on täynnä.",
    whyItFitsEn: "When the calendar is full.",
    styleTag: "kiire",
    presetId: "busy_life_reset",
    linkedPackageId: "steady_start",
    programTrackId: "daily_rhythm",
  },
  {
    id: "home_consistency",
    nameFi: "Kotin johdonmukaisuus",
    nameEn: "Home consistency",
    goal: "improve_fitness",
    trainingVenue: "home",
    weeklyDays: { min: 3, max: 5 },
    shortDescriptionFi: "Liikettä kotona, viikko hallittuna.",
    shortDescriptionEn: "Movement at home, week under control.",
    whyItFitsFi: "Kun koti on sun sali.",
    whyItFitsEn: "When home is your gym.",
    styleTag: "koti",
    presetId: "home_consistency",
    linkedPackageId: "steady_start",
    programTrackId: "daily_rhythm",
  },
  {
    id: "performance_block",
    nameFi: "Suoritusblokki",
    nameEn: "Performance block",
    goal: "improve_fitness",
    trainingVenue: "gym",
    weeklyDays: { min: 4, max: 6 },
    shortDescriptionFi: "Kuormaa ja rakennetta kokeneelle.",
    shortDescriptionEn: "Load and structure for the experienced.",
    whyItFitsFi: "Kun haet kovaa viikkorytmiä.",
    whyItFitsEn: "When you want a hard weekly rhythm.",
    styleTag: "suoritus",
    presetId: "performance_block",
    linkedPackageId: "performance_block",
    programTrackId: "performance",
  },
  {
    id: "pro_control",
    nameFi: "Pro-ohjaus",
    nameEn: "Pro control",
    goal: "improve_fitness",
    trainingVenue: "any",
    weeklyDays: { min: 4, max: 6 },
    shortDescriptionFi: "Tiukka linja ja oma runko.",
    shortDescriptionEn: "Tight line and your own framework.",
    whyItFitsFi: "Pro-tilassa: täysi säätö.",
    whyItFitsEn: "In Pro mode: full control.",
    styleTag: "pro",
    presetId: "pro_control",
    linkedPackageId: "performance_block",
    programTrackId: "performance",
    requiresProMode: true,
  },
  {
    id: "fat_loss_busy_3",
    nameFi: "Laihdutus — 3× kiireinen",
    nameEn: "Fat loss — 3× busy",
    goal: "lose_weight",
    trainingVenue: "gym",
    weeklyDays: { min: 2, max: 3 },
    shortDescriptionFi: "Vähän sessioita, selkeä linja.",
    shortDescriptionEn: "Few sessions, a clear line.",
    whyItFitsFi: "Kiireinen arki — korkeintaan kolme salikertaa.",
    whyItFitsEn: "Busy life — at most three gym visits.",
    styleTag: "kiire",
    styleTags: ["busy", "fat_loss", "minimal"],
    level: "beginner",
    venueUi: "gym",
    recommendedFor: { busy: true },
    presetId: "busy_life_reset",
    linkedPackageId: "light_cut",
    programTrackId: "daily_rhythm",
    weeklyRhythmFi: "2–3 salipäivää; muutoin kävely tai kevyt liike.",
    weeklyRhythmEn: "2–3 gym days; otherwise walking or light movement.",
    exampleDayFi:
      "40–50 min koko keho tai kevyt jako. Syke kohtuullinen — ei joka setissä loppuun asti.",
    exampleDayEn:
      "40–50 min full body or light split. Moderate effort — not all-out every set.",
  },
  {
    id: "fat_loss_home_3",
    nameFi: "Kotona 3 päivää — keveys",
    nameEn: "Home 3 days — light",
    goal: "lose_weight",
    trainingVenue: "home",
    weeklyDays: { min: 2, max: 3 },
    shortDescriptionFi: "Liike kotona, ei matkustamista salille.",
    shortDescriptionEn: "Movement at home, no gym commute.",
    whyItFitsFi: "Kun kotona on 2–3 treenipäivää.",
    whyItFitsEn: "When 2–3 home sessions fit your week.",
    styleTag: "koti",
    styleTags: ["home", "fat_loss", "foundation"],
    level: "beginner",
    venueUi: "home",
    presetId: "home_consistency",
    linkedPackageId: "steady_start",
    programTrackId: "daily_rhythm",
  },
  {
    id: "beginner_foundation_2",
    nameFi: "Aloitus — 2× viikko",
    nameEn: "Start — 2× week",
    goal: "improve_fitness",
    trainingVenue: "gym",
    weeklyDays: { min: 2, max: 2 },
    shortDescriptionFi: "Kevyt aloitus kahdella salipäivällä.",
    shortDescriptionEn: "A light start with two gym days.",
    whyItFitsFi: "Uusi salille tai paluu jälkeen pitkän tauon.",
    whyItFitsEn: "New to the gym or returning after a long break.",
    styleTag: "aloitus",
    styleTags: ["foundation", "minimal"],
    level: "beginner",
    venueUi: "gym",
    presetId: "beginner_foundation",
    linkedPackageId: "steady_start",
    programTrackId: "daily_rhythm",
    weeklyRhythmFi: "2 salipäivää (esim. ti + pe). Muut päivät kävelyä tai kevyttä.",
    weeklyRhythmEn: "2 gym days (e.g. Tue + Fri). Other days walking or easy.",
    exampleDayFi:
      "Lämmittely 10 min. Koko keho: 3–4 liikettä, 2–3 sarjaa. Lopuksi venyttely.",
    exampleDayEn:
      "10 min warm-up. Full body: 3–4 moves, 2–3 sets. Light stretch to finish.",
  },
  {
    id: "beginner_foundation_3",
    nameFi: "Perus — 3× viikko",
    nameEn: "Basics — 3× week",
    goal: "improve_fitness",
    trainingVenue: "gym",
    weeklyDays: { min: 3, max: 3 },
    shortDescriptionFi: "Kolme salipäivää — tekniikka ja toisto.",
    shortDescriptionEn: "Three gym days — technique and reps.",
    whyItFitsFi: "Kun kolme päivää sopii viikkoon ja haluat rutiinin.",
    whyItFitsEn: "When three days fit the week and you want a routine.",
    styleTag: "aloitus",
    styleTags: ["foundation"],
    level: "beginner",
    venueUi: "gym",
    presetId: "beginner_foundation",
    linkedPackageId: "steady_start",
    programTrackId: "daily_rhythm",
    weeklyRhythmFi: "Esim. ma–ke–pe tai ma–to–la — väliin lepo.",
    weeklyRhythmEn: "e.g. Mon–Wed–Fri or Mon–Thu–Sat — rest between.",
    exampleDayFi:
      "45–55 min: lämmittely, perusliikkeet (jalka, työntö, veto), loppu coresta kevyesti.",
    exampleDayEn:
      "45–55 min: warm-up, basics (leg, push, pull), light core to finish.",
  },
  {
    id: "performance_block_4",
    nameFi: "Suoritus — 4 salipäivää",
    nameEn: "Performance — 4 gym days",
    goal: "improve_fitness",
    trainingVenue: "gym",
    weeklyDays: { min: 4, max: 4 },
    shortDescriptionFi: "Neljä kovaa päivää, rakenne viikossa.",
    shortDescriptionEn: "Four hard days, structure in the week.",
    whyItFitsFi: "Kun nostat neljästi ja haluat blokkimaisen rytmin.",
    whyItFitsEn: "When you lift four times and want a block rhythm.",
    styleTag: "suoritus",
    styleTags: ["performance", "hypertrophy"],
    level: "intermediate",
    venueUi: "gym",
    presetId: "performance_block",
    linkedPackageId: "performance_block",
    programTrackId: "performance",
  },
  {
    id: "performance_block_5",
    nameFi: "Suoritus — 5–6 päivää",
    nameEn: "Performance — 5–6 days",
    goal: "improve_fitness",
    trainingVenue: "gym",
    weeklyDays: { min: 5, max: 6 },
    shortDescriptionFi: "Korkea viikkotahti kokeneelle.",
    shortDescriptionEn: "High weekly frequency for the experienced.",
    whyItFitsFi: "Kun viikko kestää viisi–kuusi kovaa päivää.",
    whyItFitsEn: "When your week can take five to six hard days.",
    styleTag: "suoritus",
    styleTags: ["performance"],
    level: "advanced",
    venueUi: "gym",
    presetId: "performance_block",
    linkedPackageId: "performance_block",
    programTrackId: "performance",
  },
  {
    id: "athletic_mixed",
    nameFi: "Sekajako — voima + ketterä",
    nameEn: "Athletic mixed — power + agility",
    goal: "improve_fitness",
    trainingVenue: "gym",
    weeklyDays: { min: 3, max: 5 },
    shortDescriptionFi: "Salilla, vaihteleva kuorma ja liike.",
    shortDescriptionEn: "Gym-based, varied loading and movement.",
    whyItFitsFi: "Kun haet yleiskuntoa ilman yksipuolista splitiä.",
    whyItFitsEn: "When you want conditioning without a narrow split.",
    styleTag: "suoritus",
    styleTags: ["performance", "hypertrophy"],
    level: "intermediate",
    venueUi: "gym",
    presetId: "performance_block",
    linkedPackageId: "performance_block",
    programTrackId: "performance",
  },
  {
    id: "shift_friendly_foundation",
    nameFi: "Vuorolle — kevyt perusta",
    nameEn: "Shift-friendly foundation",
    goal: "improve_fitness",
    trainingVenue: "any",
    weeklyDays: { min: 2, max: 4 },
    shortDescriptionFi: "Lyhyet sessiot, selkeä rakenne kun vuoro elää.",
    shortDescriptionEn: "Short sessions, clear structure when shifts move.",
    whyItFitsFi: "Kun vuorotyö sekoittaa vuorokauden rytmiä.",
    whyItFitsEn: "When shift work scrambles your day rhythm.",
    styleTag: "vuoro",
    styleTags: ["shift_friendly", "foundation", "minimal"],
    level: "beginner",
    venueUi: "mixed",
    recommendedFor: { shiftWork: true, lowFlexibility: true },
    suggestShiftLife: true,
    presetId: "beginner_foundation",
    linkedPackageId: "steady_start",
    programTrackId: "daily_rhythm",
    intensifierPolicyId: "shift_friendly",
  },
  {
    id: "shift_friendly_strength",
    nameFi: "Vuorolle — voimapainotus",
    nameEn: "Shift-friendly strength bias",
    goal: "improve_fitness",
    trainingVenue: "gym",
    weeklyDays: { min: 3, max: 4 },
    shortDescriptionFi: "Vähän mutta tarkkaa — perusliikkeet ensin.",
    shortDescriptionEn: "Less but precise — basics first.",
    whyItFitsFi: "Kun haluat voimaa ilman jatkuvaa salipäivää.",
    whyItFitsEn: "When you want strength without daily gym trips.",
    styleTag: "vuoro",
    styleTags: ["shift_friendly", "foundation"],
    level: "intermediate",
    venueUi: "gym",
    recommendedFor: { shiftWork: true },
    suggestShiftLife: true,
    presetId: "performance_block",
    linkedPackageId: "performance_block",
    programTrackId: "performance",
    intensifierPolicyId: "shift_friendly",
  },
  {
    id: "shift_friendly_hypertrophy_light",
    nameFi: "Vuorolle — kevyt hypertrofia",
    nameEn: "Shift-friendly light hypertrophy",
    goal: "build_muscle",
    trainingVenue: "any",
    weeklyDays: { min: 3, max: 4 },
    shortDescriptionFi: "Kohtuullinen volyymi, palautuminen huomioitu.",
    shortDescriptionEn: "Moderate volume with recovery in mind.",
    whyItFitsFi: "Kun kasvutavoite kohtaa epäsäännöllisen viikon.",
    whyItFitsEn: "When growth goals meet an irregular week.",
    styleTag: "vuoro",
    styleTags: ["shift_friendly", "hypertrophy"],
    level: "intermediate",
    venueUi: "mixed",
    recommendedFor: { shiftWork: true },
    suggestShiftLife: true,
    presetId: "muscle_growth_structure",
    linkedPackageId: "muscle_rhythm",
    programTrackId: "muscle_growth",
    intensifierPolicyId: "shift_friendly",
  },
  {
    id: "fat_loss_active_4",
    nameFi: "Laihdutus — 4× aktiivinen (sali)",
    nameEn: "Fat loss — 4× active (gym)",
    goal: "lose_weight",
    trainingVenue: "gym",
    weeklyDays: { min: 4, max: 4 },
    shortDescriptionFi: "Neljä salipäivää, energia ja proteiini linjassa.",
    shortDescriptionEn: "Four gym days with aligned energy and protein.",
    whyItFitsFi: "Kun ehdit salille useasti ja haluat tukea laihtumiselle.",
    whyItFitsEn: "When you can train often and want fat-loss support.",
    styleTag: "aktiivinen",
    styleTags: ["fat_loss", "sali"],
    level: "intermediate",
    venueUi: "gym",
    presetId: "fat_loss_rhythm",
    linkedPackageId: "light_cut",
    programTrackId: "light_fat_loss",
    weeklyRhythmFi:
      "Ma–su: neljä kovaa salipäivää, välipäivät kävelyä tai kevyttä.",
    weeklyRhythmEn: "Mon–Sun: four hard gym days; other days walking or easy work.",
    exampleDayFi:
      "Aamiainen tasainen. Treeni 50–70 min (koko keho tai jako). Illalla proteiini + kasvikset, hiilarit maltillisesti.",
    exampleDayEn:
      "Steady breakfast. Session 50–70 min (full body or split). Evening: protein + veg, moderate carbs.",
  },
  {
    id: "muscle_hypertrophy_3x_gym",
    nameFi: "Massa — 3× hypertrofia (sali)",
    nameEn: "Mass — 3× hypertrophy (gym)",
    goal: "build_muscle",
    trainingVenue: "gym",
    weeklyDays: { min: 3, max: 3 },
    shortDescriptionFi: "Kolme täyttä salipäivää, palautuminen välissä.",
    shortDescriptionEn: "Three full gym days with recovery between.",
    whyItFitsFi: "Kun kolme kovaa päivää viikossa riittää kasvuun.",
    whyItFitsEn: "When three hard days per week are enough for growth.",
    styleTag: "3×",
    styleTags: ["hypertrophy", "sali"],
    level: "intermediate",
    venueUi: "gym",
    presetId: "muscle_growth_structure",
    linkedPackageId: "muscle_rhythm",
    programTrackId: "muscle_growth",
    weeklyRhythmFi: "Esim. ma–ke–pe sali; ti ja to kevyempi arki.",
    weeklyRhythmEn: "e.g. Mon–Wed–Fri gym; Tue and Thu lighter days.",
    exampleDayFi:
      "Treeni: lämmittely, pääliikkeet 4×8–12, yksi apuliike. Päivän proteiini jakautuu 3–4 ateriaan.",
    exampleDayEn:
      "Session: warm-up, main lifts 4×8–12, one accessory. Protein across 3–4 meals.",
  },
  {
    id: "mass_upper_lower_4",
    nameFi: "Massa — 4× ylä / ala",
    nameEn: "Mass — 4× upper / lower",
    goal: "build_muscle",
    trainingVenue: "gym",
    weeklyDays: { min: 4, max: 4 },
    shortDescriptionFi: "Kaksi ylä- ja kaksi alapäivää viikossa.",
    shortDescriptionEn: "Two upper and two lower days per week.",
    whyItFitsFi: "Kun haluat jakaa treenin selkeästi ylä- ja alavartaloon.",
    whyItFitsEn: "When you want a clear upper / lower split.",
    styleTag: "ylä/ala",
    styleTags: ["hypertrophy", "split"],
    level: "intermediate",
    venueUi: "gym",
    presetId: "muscle_growth_structure",
    linkedPackageId: "muscle_rhythm",
    programTrackId: "muscle_growth",
    weeklyRhythmFi: "Esim. ma ylä, ti ala, to ylä, pe ala.",
    weeklyRhythmEn: "e.g. Mon upper, Tue lower, Thu upper, Fri lower.",
    exampleDayFi:
      "Yläpäivä: työntö/veto + olkapäät. Alapäivä: kyykky + pakarat/kinkut. Päätä rauhassa.",
    exampleDayEn:
      "Upper: push/pull + shoulders. Lower: squat + glutes/hams. Finish calmly.",
  },
  {
    id: "mass_push_pull_legs_5",
    nameFi: "Massa — 5× veto / työntö / jalat",
    nameEn: "Mass — 5× pull / push / legs",
    goal: "build_muscle",
    trainingVenue: "gym",
    weeklyDays: { min: 5, max: 5 },
    shortDescriptionFi: "Viisi salipäivää: veto, työntö ja jalat kiertäen.",
    shortDescriptionEn: "Five gym days rotating pull, push, and legs.",
    whyItFitsFi: "Kun viikko kestää viisi sessiota ja haluat volyymia.",
    whyItFitsEn: "When your week can take five sessions and you want volume.",
    styleTag: "PPL",
    styleTags: ["hypertrophy", "split"],
    level: "advanced",
    venueUi: "gym",
    presetId: "muscle_growth_structure",
    linkedPackageId: "performance_block",
    programTrackId: "muscle_growth",
    weeklyRhythmFi: "5 päivää / 7: veto–työntö–jalat -kierto + toisto.",
    weeklyRhythmEn: "5 of 7: rotating pull–push–legs pattern.",
    exampleDayFi:
      "Yksi pääliike raskaana, 2–3 täydennystä. Pidä uni ja proteiini kunnossa.",
    exampleDayEn:
      "One heavy main lift, 2–3 accessories. Protect sleep and protein.",
  },
  {
    id: "performance_strength_3x",
    nameFi: "Suoritus — voima 3× (sali)",
    nameEn: "Performance — strength 3× (gym)",
    goal: "improve_fitness",
    trainingVenue: "gym",
    weeklyDays: { min: 3, max: 3 },
    shortDescriptionFi: "Kolme päivää: perusliikkeet, sarjat ja progressio.",
    shortDescriptionEn: "Three days: basics, sets, and progression.",
    whyItFitsFi: "Kun haluat nostaa voimaa ilman joka päivän salia.",
    whyItFitsEn: "When you want strength without living at the gym.",
    styleTag: "voima",
    styleTags: ["performance", "sali"],
    level: "intermediate",
    venueUi: "gym",
    presetId: "performance_block",
    linkedPackageId: "performance_block",
    programTrackId: "performance",
    weeklyRhythmFi: "Esim. ma–ke–pe: akseli + apuliikkeet, välipäivät kevyesti.",
    weeklyRhythmEn: "e.g. Mon–Wed–Fri: main lifts + accessories; off days easy.",
    exampleDayFi:
      "Lämmittely, 3–5 sarjaa pääliikkeessä, sitten tarkkaa tekniikkaa. Ei tankkausta loppuun asti joka setissä.",
    exampleDayEn:
      "Warm-up, 3–5 sets on mains, crisp technique — not grinding every rep.",
  },
];

/** Kuraattu salikirjasto — valinta ei riipu profiilin päivistä. */
export const GYM_COACHING_PROGRAM_IDS: readonly string[] = [
  "beginner_foundation_2",
  "beginner_foundation_3",
  "fat_loss_busy_3",
  "fat_loss_active_4",
  "muscle_hypertrophy_3x_gym",
  "mass_upper_lower_4",
  "mass_push_pull_legs_5",
  "performance_strength_3x",
];

export const PROGRAM_LIBRARY: ProgramLibraryEntry[] =
  RAW_PROGRAM_LIBRARY.map(enrichProgramLibraryEntry);

export function getProgramLibraryEntry(id: string): ProgramLibraryEntry | undefined {
  return PROGRAM_LIBRARY.find((e) => e.id === id);
}

/** Salikirjasto — tavoitteen mukaan; ei suodata päivien/salin mukaan (käyttäjä valitsee). */
export function listGymCoachingPrograms(goal: Goal | "all"): ProgramLibraryEntry[] {
  const byId = new Map(PROGRAM_LIBRARY.map((e) => [e.id, e]));
  const list: ProgramLibraryEntry[] = [];
  for (const id of GYM_COACHING_PROGRAM_IDS) {
    const e = byId.get(id);
    if (e && (goal === "all" || e.goal === goal)) list.push(e);
  }
  return list;
}

function clampDaysForProgram(
  base: DaysPerWeek,
  w: { min: number; max: number },
): DaysPerWeek {
  const n = Math.min(w.max, Math.max(w.min, base));
  return n as DaysPerWeek;
}

function entryVisible(e: ProgramLibraryEntry, profile: OnboardingAnswers): boolean {
  if (e.requiresProMode && profile.mode !== "pro") return false;
  if (e.goal !== profile.goal) return false;
  const d = profile.daysPerWeek;
  if (d < e.weeklyDays.min || d > e.weeklyDays.max) return false;
  const v = profile.trainingVenue ?? "mixed";
  if (e.trainingVenue !== "any") {
    if (e.trainingVenue === "gym" && v !== "gym" && v !== "mixed") return false;
    if (e.trainingVenue === "home" && v !== "home" && v !== "mixed") return false;
  }
  return true;
}

export function listProgramsForProfile(profile: OnboardingAnswers): ProgramLibraryEntry[] {
  return PROGRAM_LIBRARY.filter((e) => entryVisible(e, profile));
}

export function recommendProgramForProfile(
  profile: OnboardingAnswers,
): ProgramLibraryEntry {
  const auto = resolveProgramPresetId({ ...profile, forcedPresetId: undefined });
  const pool = listProgramsForProfile(profile);
  const hit = pool.find((e) => e.presetId === auto);
  if (hit) return hit;
  return pool[0] ?? PROGRAM_LIBRARY[0];
}

export function alternativeProgramsForProfile(
  profile: OnboardingAnswers,
  recommended: ProgramLibraryEntry,
  limit = 8,
): ProgramLibraryEntry[] {
  const pool = listProgramsForProfile(profile).filter((e) => e.id !== recommended.id);
  return pool.slice(0, limit);
}

export function applyProgramLibraryEntry(
  entryId: string,
  base: OnboardingAnswers,
): Partial<OnboardingAnswers> {
  const entry = getProgramLibraryEntry(entryId);
  if (!entry) return {};
  const life: Partial<{ lifeSchedule: LifeSchedule }> = entry.suggestShiftLife
    ? { lifeSchedule: "shift_work" }
    : {};
  const nextDays = clampDaysForProgram(base.daysPerWeek, entry.weeklyDays);
  const venuePatch: Partial<OnboardingAnswers> =
    entry.trainingVenue === "gym"
      ? { trainingVenue: "gym" }
      : entry.trainingVenue === "home"
        ? { trainingVenue: "home" }
        : {};
  const programPatch: Partial<OnboardingAnswers> = {
    forcedPresetId: entry.presetId,
    selectedProgramLibraryId: entry.id,
    selectedPackageId: entry.linkedPackageId,
    programTrackId: entry.programTrackId,
    daysPerWeek: nextDays,
    ...venuePatch,
    ...life,
  };
  const merged = { ...base, ...programPatch } as OnboardingAnswers;
  const nut = recommendNutritionForProfile(merged);
  const nutritionPatch = applyNutritionLibraryEntry(nut.id);
  return { ...programPatch, ...nutritionPatch };
}
