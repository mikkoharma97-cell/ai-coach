/**
 * Display-only fallbackit kun `ProExercise`-kentät ovat tyhjiä.
 * Korvataan myöhemmin rikkaammalla ohjelmadatalla — UI ei saa riippua tästä pysyvästi.
 */
export const WORKOUT_DISPLAY_FALLBACK = {
  coachingLineFi:
    "Pidä rinta ylhäällä, hallittu tempo. Jätä viimeiseen sarjaan varaa.",
  coachingLineEn:
    "Keep posture tall, controlled tempo. Leave a rep in the tank on the last set.",
  lastWeightHintFi: "Viimeksi",
  lastWeightHintEn: "Last time",
} as const;
