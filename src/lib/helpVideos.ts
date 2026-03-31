import { hasEverMarkedDayDone } from "@/lib/storage";
import type { HelpVideoItem, HelpVideoPageId } from "@/types/help";

/**
 * Sivukohtainen ohje.
 * Kun tuot oikeat videot: lisää `public/videos/...` ja `public/posters/...`,
 * sitten täyttö: `videoUrl: "/videos/today.mp4"`, `posterUrl: "/posters/today.jpg"`.
 */
export const HELP_VIDEOS: Record<HelpVideoPageId, HelpVideoItem> = {
  today: {
    pageId: "today",
    titleFi: "Tänään-näkymä 45 sekunnissa",
    titleEn: "The Today screen in 45 seconds",
    descriptionFi:
      "Ota tästä vain yksi asia: tee päivän päätehtävä ja merkitse päivä valmiiksi. Muu järjestyy sen ympärille.",
    descriptionEn:
      "Take one thing from this: do today’s main task and mark the day complete. Everything else organizes around that.",
    durationLabelFi: "45 s",
    durationLabelEn: "45 s",
    bulletsFi: [
      "Tänään kertoo järjestyksen: treeni → ruoka → rytmi.",
      "Merkitse päivä valmiiksi, kun olet tehnyt oleellisen.",
    ],
    bulletsEn: [
      "Today gives the order: workout → food → rhythm.",
      "Mark the day done when you’ve done what matters.",
    ],
  },
  food: {
    pageId: "food",
    titleFi: "Ruoka ilman täydellisyyspakkoa",
    titleEn: "Food without the perfection trap",
    descriptionFi:
      "Et tarvitse täydellistä päivää. Jos rytmi muuttuu, lisää nopea korvaava syöminen — loppu tasapainotetaan tästä.",
    descriptionEn:
      "You don’t need a perfect day. If rhythm shifts, add a quick off-plan meal — we balance the rest from there.",
    durationLabelFi: "50 s",
    durationLabelEn: "50 s",
    bulletsFi: [
      "Suositukset ovat ohjausta — ei tuomiota.",
      "Poikkeamat kirjataan, jotta viikko pysyy lukukelpoisena.",
    ],
    bulletsEn: [
      "Suggestions guide you — they don’t judge.",
      "Log slips so the week stays readable.",
    ],
  },
  plan: {
    pageId: "plan",
    titleFi: "Viikkokartan lukeminen",
    titleEn: "How to read the week map",
    descriptionFi:
      "Kartta näyttää rytmin — ei jokaista liikettä. Et säätä tätä jatkuvasti käsin: kokonaisuus pysyy kasassa.",
    descriptionEn:
      "The map shows rhythm — not every rep. You don’t tweak this all day: the week stays coherent.",
    durationLabelFi: "55 s",
    durationLabelEn: "55 s",
    bulletsFi: [
      "Lepo- ja treenipäivät näkyvät viikkona.",
      "Muutokset tulevat Tänään- ja Säädöt-näkymistä.",
    ],
    bulletsEn: [
      "Rest and training days show as a week.",
      "Changes flow from Today and Adjustments.",
    ],
  },
  adjustments: {
    pageId: "adjustments",
    titleFi: "Mitä “aktiivinen nyt” tarkoittaa",
    titleEn: "What “active now” means",
    descriptionFi:
      "Tämä näyttää eilisen ja tämän päivän lukeman. Kun arki muuttuu, merkitse tapahtuma — viikko tasapainottuu.",
    descriptionEn:
      "This shows yesterday and today’s read. When life shifts, add an event — the week rebalances.",
    durationLabelFi: "45 s",
    durationLabelEn: "45 s",
    bulletsFi: [
      "Ei uutta ohjelmaa joka tunteen mukaan — vaan säätö.",
      "Tapahtuma kalenterissa auttaa viikkoa etukäteen.",
    ],
    bulletsEn: [
      "Not a new program every mood — an adjustment.",
      "Calendar events help the week plan ahead.",
    ],
  },
  review: {
    pageId: "review",
    titleFi: "Viikkopalaute ilman numeroähkyä",
    titleEn: "Weekly review without metric overload",
    descriptionFi:
      "Etsi yksi kuvio: mikä piti ja mikä söi virtaa. Et tarvitse täydellistä dataa — rehelliset merkinnät riittävät.",
    descriptionEn:
      "Find one pattern: what held and what drained you. You don’t need perfect data — honest closes are enough.",
    durationLabelFi: "50 s",
    durationLabelEn: "50 s",
    bulletsFi: [
      "Palaute tiivistää viikon — ei rankaisua.",
      "Seuraava askel on pieni ja konkreettinen.",
    ],
    bulletsEn: [
      "The review compresses the week — no shaming.",
      "The next step stays small and concrete.",
    ],
  },
  preferences: {
    pageId: "preferences",
    titleFi: "Asetukset nopeasti",
    titleEn: "Preferences in one pass",
    descriptionFi:
      "Muutokset tallentuvat profiiliin. Voit säätää myöhemmin — ohjaus päivittyy heti.",
    descriptionEn:
      "Changes save to your profile. You can tune later — guidance updates right away.",
    durationLabelFi: "35 s",
    durationLabelEn: "35 s",
  },
  progress: {
    pageId: "progress",
    titleFi: "Kehitys ilman dashboard-sotkua",
    titleEn: "Progress without dashboard clutter",
    descriptionFi:
      "Putki, voima, paino, makrot ja rytmi — yksi näkymä kerrallaan. Ei kaaviota joka vaatii täyttä dataa alusta.",
    descriptionEn:
      "Streaks, strength, weight, macros, rhythm — one layer at a time. No chart that demands perfect logging on day one.",
    durationLabelFi: "45 s",
    durationLabelEn: "45 s",
    bulletsFi: [
      "Viikkopalaute syntyy merkinnöistä — ei käsin täytettävää raporttia.",
      "Tasapainotus näkyy, jos viikko kaipaa maltillista korjausta.",
    ],
    bulletsEn: [
      "Weekly review builds from your closes — no manual report forms.",
      "Rebalancing shows when the week needs a gentle correction.",
    ],
  },
  workout: {
    pageId: "workout",
    titleFi: "Treenin merkitseminen",
    titleEn: "Logging your workout",
    descriptionFi:
      "Kirjaa vain sarjat jotka oikeasti teit. Jos liike ei sovi, vaihda vaihtoehtoon — ohjelma ei kaadu siihen.",
    descriptionEn:
      "Log only sets you actually did. If a move doesn’t fit, swap it — the program doesn’t break.",
    durationLabelFi: "55 s",
    durationLabelEn: "55 s",
    bulletsFi: [
      "RPE ja toistot riittävät — ei täydellistä muistikirjaa.",
      "Valmis treeni ruokkii seuraavaa päivää.",
    ],
    bulletsEn: [
      "RPE and reps are enough — not a perfect journal.",
      "A finished session feeds the next day.",
    ],
  },
  paywall: {
    pageId: "paywall",
    titleFi: "Kokeilu ja tilaus",
    titleEn: "Trial and subscription",
    descriptionFi:
      "Kokeile rauhassa. Jos tämä vähentää arvailua, vuosi on tehty pysyvään käyttöön.",
    descriptionEn:
      "Try calmly. If this cuts guesswork, the yearly plan is built for ongoing use.",
    durationLabelFi: "40 s",
    durationLabelEn: "40 s",
  },
  start: {
    pageId: "start",
    titleFi: "Aloitus — mitä tästä seuraa",
    titleEn: "Setup — what happens next",
    descriptionFi:
      "Vastaukset kartoittavat lähtötilanteen. Ei testiä — vain konteksti, jolla ensimmäinen viikko rakentuu.",
    descriptionEn:
      "Answers map your context. Not a test — just enough to build your first week.",
    durationLabelFi: "40 s",
    durationLabelEn: "40 s",
  },
};

export function getHelpVideo(pageId: HelpVideoPageId): HelpVideoItem {
  return HELP_VIDEOS[pageId];
}

/**
 * Kevyt trial-suoja: näytä ohje korostetummin, jos käyttäjä ei ole vielä sulkenut päivää.
 * Laajennettavissa: treenilogit, off-plan jne.
 */
export function isHelpNoviceUser(): boolean {
  if (typeof window === "undefined") return true;
  return !hasEverMarkedDayDone();
}
