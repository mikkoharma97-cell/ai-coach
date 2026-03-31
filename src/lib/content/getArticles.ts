/**
 * Julkinen lukukerros API:lle ja UI:lle.
 */
import { readTrainingStore } from "@/lib/content/store";
import { SEED_TRAINING_ARTICLES } from "@/lib/content/seed";
import type { TrainingIntelligenceStore } from "@/types/content";

export async function getTrainingIntelligenceStore(): Promise<TrainingIntelligenceStore> {
  const s = await readTrainingStore();
  if (s.articles.length === 0) {
    return {
      lastRefreshedAt: new Date().toISOString(),
      articles: SEED_TRAINING_ARTICLES,
    };
  }
  return s;
}
