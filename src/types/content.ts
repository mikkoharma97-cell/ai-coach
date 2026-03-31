/**
 * Training Intelligence — taustakerros: kuratoitu metatieto, ei blogifeediä.
 * Alkuperäistä artikkelitekstiä ei tallenneta sovellukseen.
 */
export type TrainingArticleCategory =
  | "hypertrophy"
  | "strength"
  | "recovery"
  | "nutrition"
  | "conditioning"
  | "technique";

export type EvidenceLevel = "high" | "medium" | "low";

export type ContentSourceTier = 1 | 2 | 3;

/**
 * Yksi kuratoitu / normalisoitu kohde — yhteenvedot ovat sovelluksen omia, ei kopioita.
 */
export type TrainingArticle = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  category: TrainingArticleCategory;
  summaryFi: string;
  summaryEn: string;
  evidenceLevel?: EvidenceLevel;
  tags: string[];
  /** Sisäinen signaali — valmentajan huomion tyyli, ei automaattista ohjelman muutosta */
  signalFi: string;
  signalEn: string;
  /** Miksi relevantti juuri nyt — täydennetään valinnan yhteydessä profiilin mukaan */
  whyItMattersFi: string;
  whyItMattersEn: string;
  /** Lähteen tier allowlistista (audit) */
  sourceTier?: ContentSourceTier;
  sourceId?: string;
};

export type TrainingIntelligenceStore = {
  lastRefreshedAt: string;
  articles: TrainingArticle[];
};
