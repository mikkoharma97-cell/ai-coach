/**
 * Coach Voice — yksi ääni koko sovelluksessa (FI/EN viestit toteuttavat tämän).
 * Ei suoraa runtime-importtia joka riville; kielitiedostot = toteutus.
 */

export const coachVoice = {
  style: "direct_human_premium",
  rules: [
    "Lyhyet lauseet.",
    "Yksi ohje kerrallaan.",
    "Ei geneeristä app-kieltä.",
    "Ei liikaa selitystä.",
    "Ei tekoälyn small talkia.",
    "Ei corporate wellness -sävyä.",
    "Suora, rauhallinen, varma — ei gym-bro -karikatyyriä.",
    "Myynti: kipu → ratkaisu, kiire ilman huutoa, luottamus ilman hypeä (HÄRMÄ15).",
    "Demo-myynti: avaus → polku (Today→Workout→Food→Progress) → arvo → kenelle → close alle ~2 min (HÄRMÄ18).",
    "Päätös: yksi moottori yhdistää tavoitteen, edistymisen, ruoan ja treenin → tänään + seuraava säätö (HÄRMÄ19).",
  ],
  bannedPhrasesFi: [
    "optimoi",
    "analysoi suoritustasi",
    "hyvin tehty",
    "jatka samaan malliin",
    "personoitu ratkaisu",
    "tekoäly auttaa sinua",
    "suosittelemme",
    "optimaalinen",
  ],
  bannedPhrasesEn: [
    "optimize",
    "analyze your performance",
    "great job",
    "keep going",
    "personalized solution",
    "AI-generated",
    "you are doing amazing",
    "keep pushing",
  ],
  preferredStyle: [
    "Tänään mennään tämä.",
    "Tämä riittää.",
    "Pidä tämä linja.",
    "Ei haittaa. Korjataan tästä.",
    "Hyvä. Jatka näin.",
    "Yksi liike kerrallaan.",
    "Riittää.",
  ],
  /** Lyhyet palikat — sama sävy, copy voi viitata näihin */
  fragments: {
    fi: {
      enoughToday: "Tämä riittää tänään.",
      keepLine: "Pidä linja.",
      oneStep: "Yksi askel kerrallaan.",
      fixFromHere: "Korjataan tästä.",
      shiftNoted: "Vuoro huomioitu.",
      lightDay: "Kevyt päivä.",
      dayClosed: "Hyvä. Päivä on kasassa.",
    },
    en: {
      enoughToday: "Enough for today.",
      keepLine: "Hold the line.",
      oneStep: "One step at a time.",
      fixFromHere: "Fix it from here.",
      shiftNoted: "Shift noted.",
      lightDay: "Light day.",
      dayClosed: "Good. Day is in the bag.",
    },
  },
} as const;
