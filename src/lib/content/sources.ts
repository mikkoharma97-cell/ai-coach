/**
 * Kuratoidut lähteet — vain allowlist. Tier 3 vaatii manuaalisen hyväksynnän (sourceId).
 */
import type { ContentSourceTier } from "@/types/content";

export type CuratedContentSource = {
  id: string;
  /** Näyttönimi UI:ssa / metassa */
  displayName: string;
  tier: ContentSourceTier;
  /** Pääsivun tai feedin juuri — käytetään attribuutioon */
  baseUrl: string;
  /** RSS/Atom jos saatavilla; ilman tätä vain manuaalinen / seed-sisältö */
  rssUrl?: string;
  /** Kuvaus sisäiseen käyttöön */
  notes?: string;
  /** Tier 3: vaadi eksplisiittinen hyväksyntä ennen ingestöintiä */
  requiresManualApproval?: boolean;
};

/**
 * Tier 1: tutkimus- / evidence-painotteiset tai vakiintuneet S&C -lähteet.
 * Tier 2: hyvät käytännön valmennusblogit.
 */
export const CURATED_CONTENT_SOURCES: CuratedContentSource[] = [
  {
    id: "stronger_by_science",
    displayName: "Stronger by Science",
    tier: 1,
    baseUrl: "https://www.strongerbyscience.com",
    rssUrl: "https://www.strongerbyscience.com/feed/",
    notes: "Evidence-oriented lifting & hypertrophy writing.",
  },
  {
    id: "examine_com",
    displayName: "Examine.com",
    tier: 1,
    baseUrl: "https://examine.com",
    notes: "Nutrition & supplement evidence — seed / manual entries; RSS optional later.",
  },
  {
    id: "jts_strength",
    displayName: "Juggernaut Training Systems",
    tier: 2,
    baseUrl: "https://www.jtsstrength.com",
    rssUrl: "https://www.jtsstrength.com/feed/",
    notes: "S&C coaching — titles filtered in ingest.",
  },
];

export function sourceById(id: string): CuratedContentSource | undefined {
  return CURATED_CONTENT_SOURCES.find((s) => s.id === id);
}

export function tierForSourceId(id: string | undefined): ContentSourceTier | undefined {
  if (!id) return undefined;
  return sourceById(id)?.tier;
}
