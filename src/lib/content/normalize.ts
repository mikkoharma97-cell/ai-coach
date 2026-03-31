/**
 * RSS-kohteet → TrainingArticle — omat yhteenvedot ja signaalit, ei artikkelitekstin kopiointia.
 */
import type {
  EvidenceLevel,
  TrainingArticle,
  TrainingArticleCategory,
} from "@/types/content";
import type { CuratedContentSource } from "@/lib/content/sources";
import type { RssItem } from "@/lib/content/rss";

const CLICKBAIT_RE =
  /\b(hack|shocking|won't believe|one weird|click here|miracle)\b/i;

const TOPIC_KEYWORDS: Array<{
  re: RegExp;
  category: TrainingArticleCategory;
  tag: string;
}> = [
  { re: /\b(hypertrophy|muscle growth|muscle gain|hypertrophic)\b/i, category: "hypertrophy", tag: "hypertrophy" },
  { re: /\b(strength|1rm|one rep max|squat|deadlift|bench)\b/i, category: "strength", tag: "strength" },
  { re: /\b(recovery|deload|sleep|fatigue|overreach)\b/i, category: "recovery", tag: "recovery" },
  { re: /\b(protein|nutrition|calorie|diet|meal)\b/i, category: "nutrition", tag: "nutrition" },
  { re: /\b(steps|cardio|conditioning|aerobic|walking)\b/i, category: "conditioning", tag: "conditioning" },
  { re: /\b(technique|form|range of motion|rom|cue)\b/i, category: "technique", tag: "technique" },
  { re: /\b(volume|intensity|progression|rpe|set)\b/i, category: "hypertrophy", tag: "volume" },
];

function inferCategory(title: string): TrainingArticleCategory {
  const t = title.toLowerCase();
  for (const { re, category } of TOPIC_KEYWORDS) {
    if (re.test(t)) return category;
  }
  return "hypertrophy";
}

function collectTags(title: string): string[] {
  const tags = new Set<string>();
  for (const { re, tag } of TOPIC_KEYWORDS) {
    if (re.test(title)) tags.add(tag);
  }
  if (tags.size === 0) tags.add("training");
  return [...tags];
}

function stableId(url: string): string {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
  }
  return `rss-${Math.abs(h).toString(36)}`;
}

function signalForCategory(
  c: TrainingArticleCategory,
): { fi: string; en: string } {
  const m: Record<
    TrainingArticleCategory,
    { fi: string; en: string }
  > = {
    hypertrophy: {
      fi: "Viimeaikainen näyttö korostaa viikkovolyymin ja seurannan merkitystä lihaskasvussa.",
      en: "Recent evidence highlights tracking weekly volume for hypertrophy.",
    },
    strength: {
      fi: "Voima kehittyy parhaiten, kun intensiteetti ja tekniikka pysyvät hallittuina.",
      en: "Strength responds best when intensity and technique stay controlled.",
    },
    recovery: {
      fi: "Palautuminen ja kuormanhallinta ovat keskeisiä kovissa jaksoissa.",
      en: "Recovery and load management matter most in hard training blocks.",
    },
    nutrition: {
      fi: "Ravinto tukee treeniä parhaiten, kun proteiini ja kokonaisenergia pysyvät linjassa tavoitteen kanssa.",
      en: "Nutrition supports training when protein and energy align with your goal.",
    },
    conditioning: {
      fi: "Kevyt aktiivisuus ja aerobinen tuki voivat täydentää voimaharjoittelua ilman että ne varastaavat recoverya.",
      en: "Light activity and aerobic support can complement lifting without stealing recovery.",
    },
    technique: {
      fi: "Liiketekniikka ja vaihtoehdot vaikuttavat pitkään kehityskäyrään — pienet säädöt, isot vaikutukset.",
      en: "Technique and exercise swaps shape long-term progress — small changes, large effects.",
    },
  };
  return m[c];
}

function whyTemplate(
  c: TrainingArticleCategory,
): { fi: string; en: string } {
  const m: Record<TrainingArticleCategory, { fi: string; en: string }> = {
    hypertrophy: {
      fi: "Tämä tukee nykyistä harjoitusjaksoasi, kun tavoitteena on lihaskasvu tai volyymin hallinta.",
      en: "This supports your current block when the goal is muscle gain or volume management.",
    },
    strength: {
      fi: "Hyödyllinen näkökulma, kun nostat intensiteettiä tai hiot pääliikkeitä.",
      en: "Useful context when you’re pushing intensity or refining main lifts.",
    },
    recovery: {
      fi: "Tämä tukee nykyistä jaksoasi, jossa kuorma tai määrä on noussut.",
      en: "This fits phases where load or volume has climbed.",
    },
    nutrition: {
      fi: "Ravitsemus on treenin tukikerros — linjassa tämän viikon suunnitelman kanssa.",
      en: "Nutrition backs your training — aligned with this week’s plan style.",
    },
    conditioning: {
      fi: "Täydentää kokonaiskuormaa ja aktiivisuutta ilman että se korvaa päätyötä salilla.",
      en: "Complements overall load and activity without replacing your main sessions.",
    },
    technique: {
      fi: "Auttaa valitsemaan turvallisia vaihtoehtoja ja säätämään tekniikkaa pitkällä tähtäimellä.",
      en: "Helps choose safe alternatives and adjust technique for the long run.",
    },
  };
  return m[c];
}

export function isAllowedTrainingTopicTitle(title: string): boolean {
  if (CLICKBAIT_RE.test(title)) return false;
  const t = title.toLowerCase();
  return TOPIC_KEYWORDS.some(({ re }) => re.test(t));
}

export function rssItemToArticle(
  item: RssItem,
  source: CuratedContentSource,
): TrainingArticle | null {
  if (!isAllowedTrainingTopicTitle(item.title)) return null;

  const category = inferCategory(item.title);
  const sig = signalForCategory(category);
  const why = whyTemplate(category);
  const evidence: EvidenceLevel = source.tier === 1 ? "high" : "medium";
  const pub =
    Date.parse(item.pubDate) && !Number.isNaN(Date.parse(item.pubDate))
      ? new Date(item.pubDate).toISOString()
      : new Date().toISOString();

  const summaryFi = `Tiivis näkökulma aiheeseen (lähde: ${source.displayName}). Emme kopioi artikkelitekstiä — avaa alkuperäinen linkki lukeaksesi kokonaan.`;
  const summaryEn = `A concise angle on this topic (source: ${source.displayName}). We don’t copy article text — open the original link to read in full.`;

  return {
    id: stableId(item.link),
    title: item.title,
    source: source.displayName,
    url: item.link,
    publishedAt: pub,
    category,
    summaryFi,
    summaryEn,
    evidenceLevel: evidence,
    tags: collectTags(item.title),
    signalFi: sig.fi,
    signalEn: sig.en,
    whyItMattersFi: why.fi,
    whyItMattersEn: why.en,
    sourceTier: source.tier,
    sourceId: source.id,
  };
}
