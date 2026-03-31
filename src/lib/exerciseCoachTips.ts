/**
 * Liikekohtaiset vihjeet — appin oma copy (vihje + virhe + fokus).
 */
import type { Exercise } from "@/types/exercise";

export type CoachExerciseTips = {
  tipFi: string;
  tipEn: string;
  mistakeFi: string;
  mistakeEn: string;
  focusFi: string;
  focusEn: string;
};

const BY_ID: Record<string, CoachExerciseTips> = {
  bench_press: {
    tipFi: "Kiristä lapaluut alas ja pidä rintakehä hieman koholla — alusta kantaa.",
    tipEn: "Pull the shoulder blades down and keep the chest tall — the base carries.",
    mistakeFi: "Liian leveä ote tai kyynärpäät 90° — olkapää kuormittuu turhaan.",
    mistakeEn: "Grip too wide or elbows at 90° — unnecessary shoulder stress.",
    focusFi: "Vakaa olkapääkulma ja hallittu kosketus rintaan.",
    focusEn: "Stable shoulder line and a controlled touch on the chest.",
  },
  dumbbell_flat_press: {
    tipFi: "Kädet hieman sisäänpäin kääntyvät luontevasti — älä pakota täyttä 90° kulmaa.",
    tipEn: "Hands turn slightly inward naturally — don’t force a rigid 90° angle.",
    mistakeFi: "Tanko tai käsipainot valahtavat eteen — rintakehä katoaa.",
    mistakeEn: "Bar or DBs drift forward — you lose chest engagement.",
    focusFi: "Työntöviiva pysyy pään yläpuolella.",
    focusEn: "Keep the press path above your face line.",
  },
  incline_db_press: {
    tipFi: "Penkki 25–35° — liian jyrkkä muuttuu olkapäädominoivaksi.",
    tipEn: "Bench ~25–35° — too steep shifts load to the shoulders.",
    mistakeFi: "Kaula koukussa ja leuka rintaan — hengitys kärsii.",
    mistakeEn: "Neck crammed and chin to chest — breathing suffers.",
    focusFi: "Ylärinta ja etuolkapää yhdessä linjassa.",
    focusEn: "Upper chest and front shoulder in one line.",
  },
  ohp: {
    tipFi: "Vatsa ja pakarat kiinni — seisova punnerrus on koko kehon tuki.",
    tipEn: "Brace abs and glutes — the standing press is full-body support.",
    mistakeFi: "Selkä notkolle tai polvet lukkoon — voima katoaa.",
    mistakeEn: "Low back arches or knees locked — you leak force.",
    focusFi: "Palkki linjassa korvien kanssa, ei edessä.",
    focusEn: "Bar stacks over ears, not in front.",
  },
  lat_pulldown: {
    tipFi: "Aloita lapaluun alas-vetämisellä — kyynärpäät seuraavat viivaa.",
    tipEn: "Start by pulling the shoulder blades down — elbows track in line.",
    mistakeFi: "Vedät käsillä ilman selän aktivointia — vain hauis tekee töitä.",
    mistakeEn: "Pulling with arms only — biceps do all the work.",
    focusFi: "Rintakehä hieman koholla, kapea liikerata.",
    focusEn: "Chest tall, narrow arc.",
  },
  pull_up: {
    tipFi: "Katse hieman eteen — kaula pitkänä, ei nykäyksiä.",
    tipEn: "Gaze slightly ahead — long neck, no jerking.",
    mistakeFi: "Puoli toistoa tai kaulasta vetämällä — lat ei aktivoidu.",
    mistakeEn: "Half reps or yanking from the neck — lats stay off.",
    focusFi: "Selän leveys ja alhaalla täysi ojenne.",
    focusEn: "Back width and full extension at the bottom.",
  },
  barbell_row: {
    tipFi: "Keskivartalo lukossa — tanko seuraa jalkoja, ei kaarta eteen.",
    tipEn: "Trunk braced — the bar tracks the legs, doesn’t arc away.",
    mistakeFi: "Selkä pyöreänä ja heilautuksella — alaselkä ottaa iskun.",
    mistakeEn: "Rounded back with momentum — low back takes the hit.",
    focusFi: "Veto lapaluista, kyynärpäät viereen.",
    focusEn: "Pull from the shoulder blades, elbows to ribs.",
  },
  back_squat: {
    tipFi: "Polvet seuraavat varpaiden linjaa — paino keskellä jalkaa.",
    tipEn: "Knees track over toes — weight stays mid-foot.",
    mistakeFi: "Kantapää nousee tai polvet sisään — ketju katkeaa.",
    mistakeEn: "Heels lift or knees cave — the chain breaks.",
    focusFi: "Sama syvyys joka toisto, hallittu nousu.",
    focusEn: "Same depth every rep, controlled ascent.",
  },
  leg_press: {
    tipFi: "Jalat sopivan leveällä — polvet eivät lukkoon asti.",
    tipEn: "Feet wide enough — don’t lock knees hard at the top.",
    mistakeFi: "Alaselkä irtoaa penkistä — kuorma siirtyy selkään.",
    mistakeEn: "Low back peels off the pad — load shifts to the spine.",
    focusFi: "Täysi jalkapohja alustaa vasten.",
    focusEn: "Full foot pressure into the platform.",
  },
  lunge: {
    tipFi: "Askel riittävän pitkä — etupolvi pysyy nilkan päällä.",
    tipEn: "Step long enough — front knee stays over the ankle.",
    mistakeFi: "Polvi yli varpaan tai kapea askel — epävakaa.",
    mistakeEn: "Knee past toes or short step — unstable.",
    focusFi: "Pystysuora torso, takareisi venyy.",
    focusEn: "Upright torso, rear thigh stretches.",
  },
  rdl: {
    tipFi: "Tanko lähellä reisiä — lonkasta taivutus, ei selästä pyöristys.",
    tipEn: "Bar stays close to thighs — hinge at hips, don’t round to lift.",
    mistakeFi: "Selkä pyöreänä alas — iskias-riski kasvaa.",
    mistakeEn: "Rounding down — raises injury risk.",
    focusFi: "Takaolkapäät takana, polvet pehmeät.",
    focusEn: "Rear shoulders back, soft knees.",
  },
  hip_thrust: {
    tipFi: "Leuka hieman sisään — ei hyperlordoosi lannerangan kustannuksella.",
    tipEn: "Chin slightly tucked — avoid extreme low-back arch.",
    mistakeFi: "Potku ylös lannerangasta — pakarat eivät tee töitä.",
    mistakeEn: "Thrusting from the low back — glutes don’t drive.",
    focusFi: "Ylhäällä polvi–lantio–hartia linja.",
    focusEn: "Top position: knee–hip–shoulder line.",
  },
  leg_curl: {
    tipFi: "Lonkka neutraalina — älä nosta lantion edestä.",
    tipEn: "Keep hips neutral — don’t lift the hips off the pad.",
    mistakeFi: "Liian nopea alasvaihe — takareisi ei ehdi hallita.",
    mistakeEn: "Lowering too fast — hamstrings never control.",
    focusFi: "Täysi ojenne ja 2 sekuntia alas.",
    focusEn: "Full extension and 2s on the way down.",
  },
  plank: {
    tipFi: "Kyynärpäät hartioiden alla — lantio ei roiku.",
    tipEn: "Elbows under shoulders — hips don’t sag.",
    mistakeFi: "Takapuoli ylös tai lanneranka notkolla.",
    mistakeEn: "Butt up or low back sagging.",
    focusFi: "Yksi pitkä linja kantapäästä päälakeen.",
    focusEn: "One long line from heels to crown.",
  },
  cable_crunch: {
    tipFi: "Vedä kyynärpäitä kohti reisiä — ei lantiosta nykäisyä.",
    tipEn: "Drive elbows toward thighs — don’t yank from the hips.",
    mistakeFi: "Koko selkä liikkuu — vatsa ei kierrä.",
    mistakeEn: "Whole spine moves — abs don’t curl.",
    focusFi: "Hengitä ulos ja supista kylkiä.",
    focusEn: "Exhale and squeeze the obliques.",
  },
  lateral_raise: {
    tipFi: "Kevyt käden ulkokierre — ei korkeammalle kuin olkapäät kestävät.",
    tipEn: "Slight external rotation — don’t go higher than shoulders tolerate.",
    mistakeFi: "Heilautus tai trap-dominaatio — olkapää väsytys.",
    mistakeEn: "Swinging or shrugging — shoulder burnout.",
    focusFi: "Hidas 2 sekuntia alas.",
    focusEn: "Slow 2 seconds on the way down.",
  },
  tricep_pushdown: {
    tipFi: "Kyynärpäät kiinni kylkiin — vain kyynärvarsiosa liikkuu.",
    tipEn: "Elbows pinned — only the forearm moves.",
    mistakeFi: "Koko keho mukana heilautuksella.",
    mistakeEn: "Whole body swings into it.",
    focusFi: "Alhaalla täysi ojenne, pysäytys.",
    focusEn: "Full extension and a pause.",
  },
  face_pull: {
    tipFi: "Vedä kohti kasvoja, kyynärpäät korkealla — ulkokierto lopussa.",
    tipEn: "Pull toward the face, elbows high — finish with external rotation.",
    mistakeFi: "Liian raskas paino — kaula ja trap tekevät työn.",
    mistakeEn: "Too heavy — neck and traps take over.",
    focusFi: "Takimmainen olkapää ja lapaluu.",
    focusEn: "Rear delt and scapular control.",
  },
  walk: {
    tipFi: "Rauhallinen askel ja hengitys — pitkäkestoinen rytmi.",
    tipEn: "Calm steps and breathing — sustainable rhythm.",
    mistakeFi: "Etnoja kumartuneena — hengitys pinnallinen.",
    mistakeEn: "Leaning forward — shallow breathing.",
    focusFi: "Jalkaterän rulla ja keskivartalon keveys.",
    focusEn: "Foot roll and light trunk.",
  },
  bike: {
    tipFi: "Satula niin että polvi on hieman koukussa alhaalla.",
    tipEn: "Saddle height so the knee stays slightly bent at the bottom.",
    mistakeFi: "Polvi lukossa tai liian matala satula.",
    mistakeEn: "Knee locked or saddle too low.",
    focusFi: "Tasainen tempo, ei vastuksen hakkausta.",
    focusEn: "Even cadence, don’t grind the resistance.",
  },
  smith_squat: {
    tipFi: "Jalkojen asento hieman kapeampi kuin vapaa kyykky — liuku radalla.",
    tipEn: "Stance slightly narrower than free squat — track the rails.",
    mistakeFi: "Polvet sisäänpäin tai kantapäät irtoavat.",
    mistakeEn: "Knees cave or heels lift.",
    focusFi: "Sama syvyys, ei kimmaa pohjasta.",
    focusEn: "Same depth, no bounce off the bottom.",
  },
  hack_squat: {
    tipFi: "Jalat keskellä alustaa — polvi pysyy nilkan linjassa.",
    tipEn: "Feet centered — knee tracks with the ankle.",
    mistakeFi: "Alaselkä irtoaa selkänojasta.",
    mistakeEn: "Low back peels off the pad.",
    focusFi: "Kontrolloitu alas, rauhallinen ylös.",
    focusEn: "Controlled down, smooth up.",
  },
  dip: {
    tipFi: "Hieman kallista eteen — rintakehä pysyy aktiivisena.",
    tipEn: "Lean slightly forward — keep the chest engaged.",
    mistakeFi: "Olkapäät valahtavat tai liian syvä ilman voimaa.",
    mistakeEn: "Shoulder dump or too deep without strength.",
    focusFi: "Kyynärpäät viistoon taakse, ei suoraan sivuille.",
    focusEn: "Elbows angle back, not straight out.",
  },
  skullcrusher: {
    tipFi: "Kyynärpäät osoittavat hieman päälaelle — ei sivuille leveästi.",
    tipEn: "Elbows angle slightly toward the crown — not flared wide.",
    mistakeFi: "Tanko putoaa kasvoille tai olkapäät eteen.",
    mistakeEn: "Bar drifts to the face or shoulders roll forward.",
    focusFi: "Vain kyynärvarsiliike, hartiat paikallaan.",
    focusEn: "Forearms move, shoulders stay set.",
  },
  dumbbell_row: {
    tipFi: "Tuki kädellä penkillä — selkä suorana, ei kierto.",
    tipEn: "Hand on the bench — flat back, no twist.",
    mistakeFi: "Heilautus lantiosta tai kaula kierrossa.",
    mistakeEn: "Swinging from the hips or neck cranked.",
    focusFi: "Veto lapaluusta, käsipaino viistoon kohti lonkkaa.",
    focusEn: "Pull the shoulder blade; DB angles toward the hip.",
  },
};

const BY_CATEGORY = {
  push: [
    {
      tipFi: "Pidä kyynärpäät 45° ja rintaa hieman kohti tankoa.",
      tipEn: "Keep elbows ~45° and chest slightly toward the bar.",
      mistakeFi: "Olkapäät valahtavat eteen — menetät voimaa.",
      mistakeEn: "Shoulders roll forward — you lose power.",
      focusFi: "Vakaa lapaluupaketti.",
      focusEn: "Stable shoulder blades.",
    },
  ],
  pull: [
    {
      tipFi: "Aloita lapaluun vetämisellä — ei pelkkää käsivarsikurlausta.",
      tipEn: "Initiate with the shoulder blades — not just curling.",
      mistakeFi: "Liike tulee ranteesta eikä selästä.",
      mistakeEn: "Motion comes from the wrists, not the back.",
      focusFi: "Veto lapaluista alas ja taakse.",
      focusEn: "Pull shoulder blades down and back.",
    },
  ],
  legs: [
    {
      tipFi: "Polvet seuraavat varpaiden linjaa — ei sisään kiertyviä polvia.",
      tipEn: "Knees track over toes — no collapsing inward.",
      mistakeFi: "Kantapää nousee tai varpaat ulospäin liikaa.",
      mistakeEn: "Heel lifts or toes flare too wide.",
      focusFi: "Keskijalka painon alla.",
      focusEn: "Mid-foot under the load.",
    },
  ],
  core: [
    {
      tipFi: "Hengitä ulos ja kiristä korsettia kevyesti.",
      tipEn: "Exhale and brace the trunk lightly.",
      mistakeFi: "Kaula jännittyy — katse liian ylös tai alas.",
      mistakeEn: "Neck strains — gaze too high or low.",
      focusFi: "Pieni liike, iso kontrolli.",
      focusEn: "Small motion, big control.",
    },
  ],
  conditioning: [
    {
      tipFi: "Pidä hengitys rauhallisena — tekniikka ennen sykettä.",
      tipEn: "Keep breathing steady — technique before heart rate.",
      mistakeFi: "Liian kova tempo heti alussa.",
      mistakeEn: "Too hard a pace from the start.",
      focusFi: "Sujuvuus ensin, sitten tempo.",
      focusEn: "Smooth first, then pace.",
    },
  ],
} as const;

function pickFromCategory(
  ex: Exercise,
): CoachExerciseTips {
  const list = BY_CATEGORY[ex.category];
  const idx =
    Math.abs(
      ex.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
    ) % list.length;
  const row = list[idx]!;
  return {
    tipFi: row.tipFi,
    tipEn: row.tipEn,
    mistakeFi: row.mistakeFi,
    mistakeEn: row.mistakeEn,
    focusFi: row.focusFi,
    focusEn: row.focusEn,
  };
}

export function coachTipsForExercise(ex: Exercise): CoachExerciseTips {
  return BY_ID[ex.id] ?? pickFromCategory(ex);
}
