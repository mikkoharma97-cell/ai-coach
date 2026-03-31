/**
 * Sisäinen artikkelitallennus — JSON tiedostossa (server), ei client-localStorage.
 */
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { TrainingArticle, TrainingIntelligenceStore } from "@/types/content";

const DATA_REL = ["data", "training-intelligence.json"];

export function storePath(): string {
  return path.join(process.cwd(), ...DATA_REL);
}

const EMPTY: TrainingIntelligenceStore = {
  lastRefreshedAt: new Date(0).toISOString(),
  articles: [],
};

export async function readTrainingStore(): Promise<TrainingIntelligenceStore> {
  try {
    const raw = await readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as TrainingIntelligenceStore;
    if (!parsed || !Array.isArray(parsed.articles)) return EMPTY;
    return {
      lastRefreshedAt:
        parsed.lastRefreshedAt ?? EMPTY.lastRefreshedAt,
      articles: parsed.articles,
    };
  } catch {
    return EMPTY;
  }
}

export async function writeTrainingStore(
  store: TrainingIntelligenceStore,
): Promise<void> {
  const p = storePath();
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, JSON.stringify(store, null, 2), "utf8");
}

export function mergeArticles(
  existing: TrainingArticle[],
  incoming: TrainingArticle[],
  maxItems = 40,
): TrainingArticle[] {
  const byUrl = new Map<string, TrainingArticle>();
  for (const a of existing) {
    byUrl.set(a.url, a);
  }
  for (const a of incoming) {
    if (!byUrl.has(a.url)) byUrl.set(a.url, a);
  }
  const merged = [...byUrl.values()].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return merged.slice(0, maxItems);
}
