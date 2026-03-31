/**
 * Käynnistyksen varmistus — jos tallennusta ei ole, näytetään kuratoitu seed (ei RSS-kopiota).
 */
import type { TrainingArticle } from "@/types/content";

export const SEED_TRAINING_ARTICLES: TrainingArticle[] = [
  {
    id: "seed-recovery-deload",
    title: "Deloads and recovery phases in strength training",
    source: "Stronger by Science",
    url: "https://www.strongerbyscience.com/deloads/",
    publishedAt: "2025-06-01T12:00:00.000Z",
    category: "recovery",
    summaryFi:
      "Tiivis katsaus siihen, milloin keventäminen voi tukea pitkän ajan kehitystä — oma tiivistelmä, ei lainattua artikkelitekstiä.",
    summaryEn:
      "A short framing of when backing off can support long-term progress — our own summary, not copied article text.",
    evidenceLevel: "high",
    tags: ["recovery", "deload", "volume"],
    signalFi:
      "Viimeaikainen näyttö korostaa palautumisen merkitystä kovissa jaksoissa.",
    signalEn:
      "Recent writing continues to emphasize recovery during hard blocks.",
    whyItMattersFi:
      "Tämä tukee nykyistä jaksoasi, jossa kuorma tai määrä voi olla noussut.",
    whyItMattersEn:
      "This fits phases where load or volume has climbed.",
    sourceTier: 1,
    sourceId: "stronger_by_science",
  },
  {
    id: "seed-hypertrophy-volume",
    title: "Training volume for hypertrophy",
    source: "Stronger by Science",
    url: "https://www.strongerbyscience.com/training-volume-for-muscle-growth-strength-gains/",
    publishedAt: "2025-05-15T12:00:00.000Z",
    category: "hypertrophy",
    summaryFi:
      "Volyymin ja edistymisen suhde — tiivistetty näkökulma, joka auttaa lukemaan omaa viikkokuormaa ilman että kopioidaan koko tekstiä.",
    summaryEn:
      "How weekly volume relates to progress — a condensed angle to interpret your week without copying the full article.",
    evidenceLevel: "high",
    tags: ["hypertrophy", "volume"],
    signalFi:
      "Lihaskasvu hyötyy johdonmukaisesta viikkovolyymin seurannasta.",
    signalEn:
      "Muscle growth benefits from consistent weekly volume tracking.",
    whyItMattersFi:
      "Tämä tukee nykyistä harjoitusjaksoasi, kun tavoitteena on lihaskasvu tai volyymin hallinta.",
    whyItMattersEn:
      "This supports your current block when the goal is muscle gain or volume management.",
    sourceTier: 1,
    sourceId: "stronger_by_science",
  },
  {
    id: "seed-nutrition-protein",
    title: "Protein intake & muscle",
    source: "Examine.com",
    url: "https://examine.com/guides/protein-intake/",
    publishedAt: "2025-04-20T12:00:00.000Z",
    category: "nutrition",
    summaryFi:
      "Proteiinin rooli palautumisessa ja treenin tukena — tiivis kehys, joka täydentää sovelluksen ruokalinjaa (ei täyttä artikkelikopiota).",
    summaryEn:
      "Protein’s role in recovery and training support — a short frame that complements your in-app food guidance (not a full article copy).",
    evidenceLevel: "high",
    tags: ["nutrition", "protein"],
    signalFi:
      "Ravinto tukee treeniä parhaiten, kun proteiini pysyy linjassa tavoitteen kanssa.",
    signalEn:
      "Nutrition backs training best when protein stays aligned with your goal.",
    whyItMattersFi:
      "Ravitsemus on treenin tukikerros — linjassa tämän viikon suunnitelman kanssa.",
    whyItMattersEn:
      "Nutrition backs your training — aligned with this week’s plan style.",
    sourceTier: 1,
    sourceId: "examine_com",
  },
];
