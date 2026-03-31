export type DailyActivity = {
  id: string;
  type: "walk" | "dog_walk" | "cycling" | "active_work" | "other";
  durationMin: number;
  intensity: "light" | "moderate" | "hard";
  date: string;
};
