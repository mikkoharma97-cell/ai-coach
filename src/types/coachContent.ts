import type { ProgramPackageId } from "@/types/coach";

/** Yksi treeniliike valmennussisällössä (V1) — mappautuu ProExerciseen */
export type CoachWorkoutExercise = {
  id: string;
  name: string;
  coachFocus: string;
  coachTip: string;
  sets: number;
  /** Esim. "8–10" tai "12" */
  reps: string;
  rest?: string;
  loadGuidance?: string;
};

/** Yksi treenipäivä (mock tai oikea) */
export type CoachWorkoutDay = {
  id: string;
  title: string;
  guidance: string;
  focus: string;
  durationLabel: string;
  exercises: CoachWorkoutExercise[];
  dayType?: "training" | "rest" | "light" | "recovery";
};

/** Yksi ateria ruokapäivässä */
export type CoachFoodMeal = {
  id: string;
  name: string;
  timingLabel?: string;
  items: string[];
  emphasis?: string;
};

/** Yksi ruokapäivä */
export type CoachFoodDay = {
  id: string;
  foodPlanLabel: string;
  styleLabel: string;
  guidance: string;
  meals: CoachFoodMeal[];
  dayLabel?: string;
};

/** Paketin valmennussisältö: indeksi 0 = maanantai (getMondayBasedIndex) */
export type CoachProgramContent = {
  packageId: ProgramPackageId;
  weekLabel?: string;
  /** Päiväkohtainen treeni; null = käytä generaattoria */
  workoutDays: (CoachWorkoutDay | null)[];
  /** Päiväkohtainen ruoka; null = käytä mock-resolveria */
  foodDays: (CoachFoodDay | null)[];
  programFocusLabel: string;
  defaultWorkoutLabel: string;
  defaultFoodLabel: string;
};
