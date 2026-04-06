/**
 * V1 valmennussisältö — paketti + ma–su -taulukot (indeksi = getMondayBasedIndex).
 * null = generaattori / mock-resolveri.
 */
import type { CoachProgramContent } from "@/types/coachContent";
import type { ProgramPackageId } from "@/types/coach";

const null7 = <T>(): (T | null)[] => [null, null, null, null, null, null, null];

function steadyStart(): CoachProgramContent {
  const workoutDays = null7<CoachProgramContent["workoutDays"][number]>();
  workoutDays[0] = {
    id: "ss-mon-a",
    title: "Koko kroppa — kevyt käynnistys",
    guidance:
      "Pidä tempo rauhallisena, hengitä liikkeiden välissä. Tavoite on herätellä koko ketju, ei maksimikuormaa.",
    focus: "Tänään: tekniikka ja hallittu tempo",
    durationLabel: "45–50 min",
    dayType: "training",
    exercises: [
      {
        id: "ss-goblet",
        name: "Goblet-kyykky",
        coachFocus: "Polvet linjassa varpaiden kanssa.",
        coachTip: "Pidä rinta ylhäällä — paino keskittyy kantapäähän.",
        sets: 3,
        reps: "10–12",
        rest: "90 s",
        loadGuidance: "Kohtalainen paino, viimeinen sarja tuntuu mutta ei kaadu.",
      },
      {
        id: "ss-row-band",
        name: "Käsipaino-rivi penkillä",
        coachFocus: "Vedä kyynärpäät viistosti taakse.",
        coachTip: "Ala selkä pysyy neutraalina — ei notkoa.",
        sets: 3,
        reps: "10",
        rest: "90 s",
      },
      {
        id: "ss-plank",
        name: "Etunojapenkki / lankku",
        coachFocus: "Keskivartalo tiukkana koko setin.",
        coachTip: "Lyhennä liikettä jos lantio valahtaa.",
        sets: 3,
        reps: "30–40 s",
        rest: "60 s",
      },
    ],
  };
  workoutDays[2] = {
    id: "ss-wed-b",
    title: "Koko kroppa — vetävä painotus",
    guidance:
      "Tänään rintakehä pysyy auki ja olkapäät pysyvät hallinnassa. Lisää kuormaa vain jos viimeinen toisto pysyy siistinä.",
    focus: "Selkä aktiivisena, ei revitä tempoa",
    durationLabel: "45–55 min",
    dayType: "training",
    exercises: [
      {
        id: "ss-rdl",
        name: "Romanialainen maastaveto käsipainolla",
        coachFocus: "Koukista polvia hieman — reisien takaosa tekee työn.",
        coachTip: "Tanko/paino pysyy lähellä reisiä.",
        sets: 3,
        reps: "8–10",
        rest: "2 min",
      },
      {
        id: "ss-pushup",
        name: "Punnerrus (tai kalteva)",
        coachFocus: "Koko vartalo yhtenä linjana.",
        coachTip: "Leveämpi ote keventää, kapea lisää intensiteettiä.",
        sets: 3,
        reps: "8–12",
        rest: "90 s",
      },
      {
        id: "ss-facepull",
        name: "Kasvoveto köydellä tai kuminauhalla",
        coachFocus: "Kyynärpäät korkealle, ulkokiertäjät töihin.",
        coachTip: "Älä kierrä ranteilla — liike tulee olkapäästä.",
        sets: 2,
        reps: "15",
        rest: "60 s",
      },
    ],
  };
  workoutDays[4] = {
    id: "ss-fri-c",
    title: "Koko kroppa — kevyt finisher",
    guidance:
      "Viikon kolmas veto: pidä volyymi maltillisena. Jos olo on väsynyt, jätä viimeinen sarja pois.",
    focus: "Viimeinen veto — jätä hyvä maku",
    durationLabel: "40–50 min",
    dayType: "training",
    exercises: [
      {
        id: "ss-leg-press",
        name: "Jalkaprässi tai askelkyykky",
        coachFocus: "Polvi ei mene sisäänpäin.",
        coachTip: "Koko jalkapohja lattiassa / astinlautaa vasten.",
        sets: 3,
        reps: "12",
        rest: "2 min",
      },
      {
        id: "ss-db-press",
        name: "Käsipainopenkki",
        coachFocus: "Hartiat alas, kyynärpäät noin 45°.",
        coachTip: "Alakosketus ilman pomppua.",
        sets: 3,
        reps: "8–10",
        rest: "2 min",
      },
      {
        id: "ss-carry",
        name: "Farmer’s walk / kantaminen",
        coachFocus: "Kävely suorassa, lapaluut kevyesti alas.",
        coachTip: "Lyhyet askeleet, hengitä rauhassa.",
        sets: 3,
        reps: "20–30 m",
        rest: "90 s",
      },
    ],
  };

  const foodDays = null7<CoachProgramContent["foodDays"][number]>();
  foodDays[0] = {
    id: "ss-food-mon",
    foodPlanLabel: "3 ateriaa — tasainen energia",
    styleLabel: "helppo rytmi",
    guidance:
      "Pidä välit kohtuullisina ja juo vettä treenin ympärillä. Ei tarvitse laskea grammaa — rytmi ratkaisee.",
    meals: [
      {
        id: "ss-m0",
        name: "Aamiainen",
        timingLabel: "Aamu",
        items: ["Kaurapuuro", "marjat", "hyvä proteiinin lähde"],
      },
      {
        id: "ss-m1",
        name: "Lounas",
        timingLabel: "Keskipäivä",
        items: ["Lautasen puolikas kasviksia", "proteiini", "täysjyvä"],
      },
      {
        id: "ss-m2",
        name: "Päivällinen",
        timingLabel: "Ilta",
        items: ["Kala tai kana", "peruna tai riisi", "öljytön kastike"],
      },
    ],
  };
  foodDays[3] = {
    id: "ss-food-thu",
    foodPlanLabel: "3 ateriaa — sama rytmi, kevyempi ilta",
    styleLabel: "helppo rytmi",
    guidance:
      "Torstai on hyvä päivä pitää ilta hieman kevyempänä, jos viikonloppu venyy sosiaalisesti.",
    meals: [
      {
        id: "ss-t0",
        name: "Aamiainen",
        timingLabel: "Aamu",
        items: ["Munakokkeli tai rahka", "hedelmä", "leipä"],
      },
      {
        id: "ss-t1",
        name: "Lounas",
        timingLabel: "Keskipäivä",
        items: ["Keitto tai salaatti", "proteiini päälle"],
      },
      {
        id: "ss-t2",
        name: "Päivällinen",
        timingLabel: "Ilta",
        items: ["Kala", "kasvikset", "pieni annos hiilaria"],
      },
    ],
  };

  return {
    packageId: "steady_start",
    programFocusLabel: "Rakennetaan rutiini, joka kestää arjen vaihtelut.",
    defaultWorkoutLabel: "Koko kroppa — ohjatusti",
    defaultFoodLabel: "Tasainen jakautuminen kolmelle aterialle",
    workoutDays: workoutDays as CoachProgramContent["workoutDays"],
    foodDays: foodDays as CoachProgramContent["foodDays"],
  };
}

function muscleRhythm(): CoachProgramContent {
  const workoutDays = null7<CoachProgramContent["workoutDays"][number]>();
  workoutDays[0] = {
    id: "mr-mon-push",
    title: "Työntävä — rinta ja olkapää",
    guidance:
      "Lämmittelyssä olkapäiden liikkuvuus ennen isoja painoja. Sarjat ovat tiiviitä mutta ei sekavia.",
    focus: "Työntöpolku hallittuna",
    durationLabel: "55–65 min",
    dayType: "training",
    exercises: [
      {
        id: "mr-incline",
        name: "Vinopenkki käsipainolla",
        coachFocus: "Hartiat kiinni penkkiin.",
        coachTip: "Alhaalla rauhallinen, ylös napakka mutta ei pamauta.",
        sets: 4,
        reps: "8–10",
        rest: "2 min",
      },
      {
        id: "mr-ohp",
        name: "Pystypunnerrus",
        coachFocus: "Lantio neutraali, keskivartalo lukossa.",
        coachTip: "Jos lantio karkaa, kevennä painoa.",
        sets: 3,
        reps: "8",
        rest: "2 min",
      },
      {
        id: "mr-lateral",
        name: "Sivunosto",
        coachFocus: "Kyynärpäät hieman koukussa.",
        coachTip: "Ei heilautusta — korkeus maltillisesti.",
        sets: 3,
        reps: "12–15",
        rest: "60 s",
      },
    ],
  };
  workoutDays[2] = {
    id: "mr-wed-pull",
    title: "Vetävä — selkä ja takaketju",
    guidance:
      "Vedä kyynärpäillä, älä revi käsivarret tyhjään. Viimeinen liike on kevyt pumpissa.",
    focus: "Vetoketju auki",
    durationLabel: "55–65 min",
    dayType: "training",
    exercises: [
      {
        id: "mr-pulldown",
        name: "Alatalja tai leuanveto",
        coachFocus: "Rintakehä ylös tankoon/roikkoon.",
        coachTip: "Ala-asennossa venytys, yläasennossa puristus.",
        sets: 4,
        reps: "8–10",
        rest: "2 min",
      },
      {
        id: "mr-row-cable",
        name: "Taljasoutu",
        coachFocus: "Vedä lapaluuta kohti selkärankaa.",
        coachTip: "Ei hyperkkykymistä — pitkä liikerata.",
        sets: 3,
        reps: "10",
        rest: "90 s",
      },
      {
        id: "mr-curl",
        name: "Hauiskääntö",
        coachFocus: "Kyynärpäät paikallaan.",
        coachTip: "Viimeiset toistot saavat tuntua, mutta tekniikka säilyy.",
        sets: 3,
        reps: "10–12",
        rest: "60 s",
      },
    ],
  };
  workoutDays[4] = {
    id: "mr-fri-legs",
    title: "Jalat — painetta ilman hötkyilyä",
    guidance:
      "Polvi- ja lonkkanivel pysyvät linjassa. Jos alaselkä ottaa osumaa, lyhennä liikettä tai kevennä.",
    focus: "Jalkapohjat ja reidet töihin",
    durationLabel: "60–70 min",
    dayType: "training",
    exercises: [
      {
        id: "mr-squat",
        name: "Kyykky tankolla tai hack",
        coachFocus: "Polvi seuraa varpaiden linjaa.",
        coachTip: "Syvyys niin pitkälle kuin hallitusti.",
        sets: 4,
        reps: "6–8",
        rest: "3 min",
      },
      {
        id: "mr-rdl2",
        name: "Romanialainen maastaveto",
        coachFocus: "Lonkkanivel taittuu — polvi ei lukitu.",
        coachTip: "Tanko lähellä reisiä koko matkan.",
        sets: 3,
        reps: "8",
        rest: "2 min",
      },
      {
        id: "mr-legcurl",
        name: "Polven koukistus",
        coachFocus: "Ala-asennossa täysi venytys.",
        coachTip: "Älä anna lantion nousta penkistä.",
        sets: 3,
        reps: "12–15",
        rest: "90 s",
      },
    ],
  };

  const foodDays = null7<CoachProgramContent["foodDays"][number]>();
  foodDays[0] = {
    id: "mr-food-mon",
    foodPlanLabel: "4 ateriaa — lämpimät pääateriat",
    styleLabel: "aamupainotteinen",
    guidance:
      "Jaa proteiini tasaisesti. Jos treeni on illalla, älä jätä välipalaa liian kevyeksi.",
    meals: [
      {
        id: "mr-f0",
        name: "Aamiainen",
        timingLabel: "Aamu",
        items: ["Munat", "leipä", "hedelmä"],
      },
      {
        id: "mr-f1",
        name: "Lounas",
        timingLabel: "Keskipäivä",
        items: ["Kana tai tofu", "riisi", "kasvikset"],
      },
      {
        id: "mr-f2",
        name: "Välipala",
        timingLabel: "Iltapäivä",
        items: ["Rahka tai smoothie", "pähkinä"],
      },
      {
        id: "mr-f3",
        name: "Päivällinen",
        timingLabel: "Ilta",
        items: ["Kala", "peruna", "iso kasvislautanen"],
      },
    ],
  };
  foodDays[4] = {
    id: "mr-food-fri",
    foodPlanLabel: "4 ateriaa — tankkaus ennen viikonloppua",
    styleLabel: "aamupainotteinen",
    guidance:
      "Perjantai: pidä neste ja suola maltillisina, jos viikonloppuun tulee ravintolailtoja.",
    meals: [
      {
        id: "mr-g0",
        name: "Aamiainen",
        timingLabel: "Aamu",
        items: ["Kauraleipä", "juusto", "mehu tai marjat"],
      },
      {
        id: "mr-g1",
        name: "Lounas",
        timingLabel: "Keskipäivä",
        items: ["Pasta tai riisi", "kasvis", "proteiini"],
      },
      {
        id: "mr-g2",
        name: "Välipala",
        timingLabel: "Iltapäivä",
        items: ["Proteiinipatukka tai banaani", "kahvi"],
      },
      {
        id: "mr-g3",
        name: "Päivällinen",
        timingLabel: "Ilta",
        items: ["Naudan jauheliha", "perunamuusi", "salaatti"],
      },
    ],
  };

  return {
    packageId: "muscle_rhythm",
    programFocusLabel: "Lihaskasvu syntyy toistuvasta, hallitusta työstä.",
    defaultWorkoutLabel: "Jako: työntö / veto / jalat",
    defaultFoodLabel: "Neljä syömiskertaa — energia jakautuu päivään",
    workoutDays: workoutDays as CoachProgramContent["workoutDays"],
    foodDays: foodDays as CoachProgramContent["foodDays"],
  };
}

function lightCut(): CoachProgramContent {
  const workoutDays = null7<CoachProgramContent["workoutDays"][number]>();
  workoutDays[1] = {
    id: "lc-tue-met",
    title: "Koko kroppa — maltillinen metcon",
    guidance:
      "Tavoite on hengästyä hallitusti, ei pyörtyä. Pidä tekniikka ensin, tempo toisena.",
    focus: "Syke ylös, nivelet turvassa",
    durationLabel: "35–45 min",
    dayType: "training",
    exercises: [
      {
        id: "lc-bike",
        name: "Pyöräergometri intervalleina",
        coachFocus: "Kevyt vastus, selkeä rytmi.",
        coachTip: "Poljin koko jalan läpi — ei vain varpaita.",
        sets: 6,
        reps: "45 s työ / 60 s kevyt",
        rest: "—",
      },
      {
        id: "lc-goblet2",
        name: "Goblet-kyykky",
        coachFocus: "Syvä mutta kontrolloitu.",
        coachTip: "Pidä hengitys rauhallisena sykkeen keskellä.",
        sets: 3,
        reps: "12",
        rest: "90 s",
      },
      {
        id: "lc-plank2",
        name: "Lankku",
        coachFocus: "Pidä kyljet kiinni — ei notkoa.",
        coachTip: "Lyhennä aikaa ennen kuin lantio pettää.",
        sets: 3,
        reps: "30 s",
        rest: "45 s",
      },
    ],
  };
  workoutDays[3] = {
    id: "lc-thu-strength",
    title: "Voimaa — perusliikkeet kevyellä kuormalla",
    guidance:
      "Kevennetyt perusliikkeet pitävät lihaksen hermotuksen hereillä ilman että nälkä kärjistyy.",
    focus: "Perusliikkeet, ei uupumusta",
    durationLabel: "40–50 min",
    dayType: "training",
    exercises: [
      {
        id: "lc-press",
        name: "Penkkipunnerrus kevyesti",
        coachFocus: "Olkapäät alas ja takaisin.",
        coachTip: "Pysähdy ennen kuin tekniikka hajoaa.",
        sets: 3,
        reps: "10",
        rest: "2 min",
      },
      {
        id: "lc-lat",
        name: "Alatalja",
        coachFocus: "Vedä kyynärpäät alas.",
        coachTip: "Koko liikerata ilman keinuntaa.",
        sets: 3,
        reps: "12",
        rest: "90 s",
      },
      {
        id: "lc-walk",
        name: "Kävely mäkeä tai kalteva juoksumatto",
        coachFocus: "Askel pitkä, hengitys tasainen.",
        coachTip: "Pidä kädet kevyesti mukana — ei puikkoa kaiteesta.",
        sets: 1,
        reps: "10 min",
        rest: "—",
      },
    ],
  };

  const foodDays = null7<CoachProgramContent["foodDays"][number]>();
  foodDays[2] = {
    id: "lc-food-wed",
    foodPlanLabel: "4 ateriaa — proteiini edellä",
    styleLabel: "korkea proteiini",
    guidance:
      "Keskiviikko: pidä välipala proteiinipainotteisena, jotta ilta ei kaadu nälkäkierteessä.",
    meals: [
      {
        id: "lc-w0",
        name: "Aamiainen",
        timingLabel: "Aamu",
        items: ["Munakokkeli", "hyytelöity kana tai kalkkuna", "kasvikset"],
      },
      {
        id: "lc-w1",
        name: "Lounas",
        timingLabel: "Keskipäivä",
        items: ["Salaatti", "öljytön kastike", "kala"],
      },
      {
        id: "lc-w2",
        name: "Välipala",
        timingLabel: "Iltapäivä",
        items: ["Rahka", "marjat", "pähkinä"],
      },
      {
        id: "lc-w3",
        name: "Päivällinen",
        timingLabel: "Ilta",
        items: ["Paistettu tofu tai kana", "täysjyvä", "iso kasvislautanen"],
      },
    ],
  };

  return {
    packageId: "light_cut",
    programFocusLabel: "Kevennys ilman että päivästä tulee nälkäinen sotku.",
    defaultWorkoutLabel: "Kevyt voima + maltillinen kestävyys",
    defaultFoodLabel: "Proteiini jakautuu neljälle aterialle",
    workoutDays: workoutDays as CoachProgramContent["workoutDays"],
    foodDays: foodDays as CoachProgramContent["foodDays"],
  };
}

function performanceBlock(): CoachProgramContent {
  const workoutDays = null7<CoachProgramContent["workoutDays"][number]>();
  workoutDays[0] = {
    id: "pb-mon-squat",
    title: "Kyykky — voima + tekniikka",
    guidance:
      "Lämmittelyssä tyhjällä tangolla rytmi ja asento. Työsarjoissa jokainen toisto näyttää samalta.",
    focus: "Syvyys ja hallittu nousu",
    durationLabel: "70–80 min",
    dayType: "training",
    exercises: [
      {
        id: "pb-squat",
        name: "Takakyykky",
        coachFocus: "Tanko keskellä selkää, katse hieman alaviistoon.",
        coachTip: "Hengitä sisään ennen alas — uloshengitys ylös.",
        sets: 5,
        reps: "3–5",
        rest: "3–4 min",
      },
      {
        id: "pb-split",
        name: "Askelkyykky käsipainolla",
        coachFocus: "Polvi ei törmää maahan rajusti.",
        coachTip: "Pieni eteen-/taakse tasapaino ok — älä kiirehdi.",
        sets: 3,
        reps: "8 / puoli",
        rest: "2 min",
      },
      {
        id: "pb-core",
        name: "Käänteinen hyper / selkäextensio",
        coachFocus: "Lonkka liikkuu, ei vain niska.",
        coachTip: "Pieni amplitude riittää alkuun.",
        sets: 3,
        reps: "12–15",
        rest: "90 s",
      },
    ],
  };
  workoutDays[2] = {
    id: "pb-wed-bench",
    title: "Penkki — rytmi ja tiiviit sarjat",
    guidance:
      "Käytä tarvittaessa kaveria tai turvakahta viimeisiin sarjoihin. Pidä hartiat turvallisessa asennossa.",
    focus: "Kontakti penkkiin — ei pomppua",
    durationLabel: "65–75 min",
    dayType: "training",
    exercises: [
      {
        id: "pb-bench",
        name: "Penkkipunnerrus",
        coachFocus: "Jalat painavat lattiaan.",
        coachTip: "Alakosketus hallittu — ei kimpoa rinnasta.",
        sets: 5,
        reps: "3–5",
        rest: "3 min",
      },
      {
        id: "pb-cgb",
        name: "Kapea penkki tai dippikone",
        coachFocus: "Kyynärpäät pysyvät hieman kropan edessä.",
        coachTip: "Jos olkapää väsyy, vaihda korkeampaan toistomäärään.",
        sets: 3,
        reps: "8",
        rest: "2 min",
      },
      {
        id: "pb-row-bb",
        name: "Käsipaino-rivi",
        coachFocus: "Kylki penkillä — ei kiertoa.",
        coachTip: "Vedä kyynärpäät viistosti taakse.",
        sets: 4,
        reps: "8–10",
        rest: "90 s",
      },
    ],
  };
  workoutDays[5] = {
    id: "pb-sat-pull",
    title: "Veto — selkä ja takareisi",
    guidance:
      "Lauantai-veto: pidä kädet rentoina — veto lähtee lapaluista ja lonkasta.",
    focus: "Veto puhtaasti, ei revitä",
    durationLabel: "70 min",
    dayType: "training",
    exercises: [
      {
        id: "pb-dead",
        name: "Maastaveto",
        coachFocus: "Tanko lähellä sääriä.",
        coachTip: "Lantio ja polvi liikkuvat yhdessä — ei pelkkää selkää.",
        sets: 4,
        reps: "4–6",
        rest: "3 min",
      },
      {
        id: "pb-pullup",
        name: "Leuanveto / apulaitteella",
        coachFocus: "Rintakehä ylös tankoon.",
        coachTip: "Negatiiviset toistot jos täysiä ei irtoa.",
        sets: 4,
        reps: "AMRAP",
        rest: "2 min",
      },
      {
        id: "pb-curl-ham",
        name: "Polven koukistus seisten",
        coachFocus: "Polvi linjassa, ei käännä sisään.",
        coachTip: "Pidä lonkka hieman koukussa koko sarjan.",
        sets: 3,
        reps: "12",
        rest: "90 s",
      },
    ],
  };

  const foodDays = null7<CoachProgramContent["foodDays"][number]>();
  foodDays[1] = {
    id: "pb-food-tue",
    foodPlanLabel: "5 ateriaa — tarkka rytmi",
    styleLabel: "tarkka rytmi",
    guidance:
      "Tiistai: ajoita hiilarit treenin lähelle; aamu pysyy kevyemmin proteiinipainotteisena.",
    meals: [
      {
        id: "pb-e0",
        name: "Aamiainen",
        timingLabel: "Aamu",
        items: ["Kaurahiutale", "marjat", "proteiinilisä"],
      },
      {
        id: "pb-e1",
        name: "Välipala",
        timingLabel: "Myöhäisaamu",
        items: ["Riisikakku", "kalkkuna", "kasvis"],
      },
      {
        id: "pb-e2",
        name: "Lounas",
        timingLabel: "Keskipäivä",
        items: ["Riisi", "kana", "kasvis"],
      },
      {
        id: "pb-e3",
        name: "Toinen välipala",
        timingLabel: "Iltapäivä",
        items: ["Smoothie", "banaani", "rahka"],
      },
      {
        id: "pb-e4",
        name: "Päivällinen",
        timingLabel: "Ilta",
        items: ["Kala", "peruna", "salaatti", "öljy"],
      },
    ],
  };
  foodDays[4] = {
    id: "pb-food-fri",
    foodPlanLabel: "5 ateriaa — palautuminen viikon päätteeksi",
    styleLabel: "tarkka rytmi",
    guidance:
      "Perjantaina: lisää kasviksia ja nestettä — uni ja palautuminen kantavat seuraavaan viikkoon.",
    meals: [
      {
        id: "pb-r0",
        name: "Aamiainen",
        timingLabel: "Aamu",
        items: ["Munakas", "leipä", "mehu"],
      },
      {
        id: "pb-r1",
        name: "Välipala",
        timingLabel: "Myöhäisaamu",
        items: ["Proteiinijuoma", "hedelmä"],
      },
      {
        id: "pb-r2",
        name: "Lounas",
        timingLabel: "Keskipäivä",
        items: ["Pasta", "jauheliha", "kasviskastike"],
      },
      {
        id: "pb-r3",
        name: "Toinen välipala",
        timingLabel: "Iltapäivä",
        items: ["Rahka", "granola pieni"],
      },
      {
        id: "pb-r4",
        name: "Päivällinen",
        timingLabel: "Ilta",
        items: ["Kala", "bataatti", "iso salaatti"],
      },
    ],
  };

  return {
    packageId: "performance_block",
    programFocusLabel: "Kuorma ja ruoka etenevät samaan tahtiin — ei arvailla.",
    defaultWorkoutLabel: "Blokki: kyykky / penkki / veto",
    defaultFoodLabel: "Viisi syömiskertaa — tankkaus ja ajoitus linjassa",
    workoutDays: workoutDays as CoachProgramContent["workoutDays"],
    foodDays: foodDays as CoachProgramContent["foodDays"],
  };
}

export const COACH_CONTENT_BY_PACKAGE: Partial<
  Record<ProgramPackageId, CoachProgramContent>
> = {
  steady_start: steadyStart(),
  muscle_rhythm: muscleRhythm(),
  light_cut: lightCut(),
  performance_block: performanceBlock(),
};
