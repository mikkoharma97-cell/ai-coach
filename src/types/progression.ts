/** RPE / tuntuma-asteikko 1–10 */
export type Intensity1To10 = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type Progression = {
  week: number;
  sets: number;
  reps: number;
  /** 1–10 */
  intensity: Intensity1To10;
};
