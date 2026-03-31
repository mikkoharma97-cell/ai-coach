/**
 * Taustapäivitys — kutsutaan API-reitistä tai cronista, ei clientistä jatkuvasti.
 */
import { SEED_TRAINING_ARTICLES } from "@/lib/content/seed";
import { CURATED_CONTENT_SOURCES } from "@/lib/content/sources";
import { fetchRssText, parseRssItems } from "@/lib/content/rss";
import { rssItemToArticle } from "@/lib/content/normalize";
import {
  mergeArticles,
  readTrainingStore,
  writeTrainingStore,
} from "@/lib/content/store";
import type { TrainingArticle } from "@/types/content";

const MAX_PER_FEED = 8;

export async function refreshTrainingIntelligence(): Promise<{
  added: number;
  lastRefreshedAt: string;
}> {
  const store = await readTrainingStore();
  const existing =
    store.articles.length === 0 ? SEED_TRAINING_ARTICLES : store.articles;
  const existingUrls = new Set(existing.map((a) => a.url));

  const incoming: TrainingArticle[] = [];

  for (const src of CURATED_CONTENT_SOURCES) {
    if (src.requiresManualApproval) continue;
    if (!src.rssUrl) continue;

    const xml = await fetchRssText(src.rssUrl);
    if (!xml) continue;

    const items = parseRssItems(xml).slice(0, MAX_PER_FEED);
    for (const item of items) {
      const art = rssItemToArticle(item, src);
      if (art) incoming.push(art);
    }
  }

  let added = 0;
  for (const a of incoming) {
    if (!existingUrls.has(a.url)) added++;
  }

  const merged = mergeArticles(existing, incoming);
  const next = {
    lastRefreshedAt: new Date().toISOString(),
    articles: merged,
  };
  await writeTrainingStore(next);
  return { added, lastRefreshedAt: next.lastRefreshedAt };
}
