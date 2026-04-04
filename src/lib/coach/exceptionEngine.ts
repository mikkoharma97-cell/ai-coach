/**
 * Poikkeustilojen ohjaus — ei diagnooseja; turvallisuus ja lepo ensin.
 */
import type { CoachDailyPlan } from "@/types/coach";
import type { Locale } from "@/lib/i18n";
import type {
  ActiveExceptionState,
  ExceptionGroupId,
  ExceptionId,
  ExceptionSeverity,
  ExceptionGuidanceStrings,
} from "@/types/exceptions";

export const EXCEPTION_GROUP_ORDER: ExceptionGroupId[] = [
  "health_feeling",
  "load_recovery",
  "life_schedule",
  "progress_results",
];

export const EXCEPTION_IDS_BY_GROUP: Record<ExceptionGroupId, ExceptionId[]> = {
  health_feeling: ["sick", "poor_sleep", "high_stress", "no_appetite"],
  load_recovery: [
    "skipped_session",
    "multi_skip",
    "poor_recovery",
    "strain_upper",
    "strain_lower",
  ],
  life_schedule: ["travel", "no_gym", "food_chaos"],
  progress_results: [
    "shoulder",
    "knee",
    "back",
    "weight_stuck",
    "weight_fast",
    "strength_down",
  ],
};

const FI: Record<ExceptionId, Record<ExceptionSeverity, ExceptionGuidanceStrings>> = {
  sick: {
    light: {
      training:
        "Pidä liikkeen kevyenä: kävely, hengitys tai lyhyt liikkuvuus — ei kovaa sykettä.",
      food: "Neste ja pienet ateriat; lämmin juoma voi rauhoittaa. Ei tarvitse pakottaa täyttä lautasta.",
      recovery: "Lepo ja uni etusijalla. Kalenteri odottaa — keho ei.",
      durationCheck: "Tarkista olo illalla. Jos oireet jatkuvat, lepo voittaa treenin.",
      coachNote:
        "Kevyt päivä on järkevä veto — ei laiskuutta. Ei tarvitse todistaa mitään.",
    },
    clear: {
      training: "Ei kovaa treeniä. Kevyt kävely ok vain jos olo sallii — muuten täyslepo.",
      food: "Helppo sulava ruoka pienissä erissä. Vältä rankkoja kokeiluja ja alkoholia.",
      recovery: "Priorisoi unta ja nestettä. Pidä päivän kuorma minimissä.",
      durationCheck: "Seuraava tarkistus huomenna aamulla. Jos kuume tai voimakas heikkous, lepo jatkuu.",
      coachNote:
        "Tällä ololla ei vaadita täyttä suoritusta — takaisin pienin askelin.",
    },
    bad: {
      training: "Ei salitreeniä. Lepo; tarvittaessa vain hyvin kevyt kävely sisällä.",
      food: "Yksinkertainen ruoka kun ruokahalu sallii — neste ensin.",
      recovery: "Täyslepo. Jos oireet ovat voimakkaita tai pahenevat, ota yhteys terveydenhuoltoon.",
      durationCheck: "Arvioi olo uudelleen 12–24 h välein. Älä palkitse itseäsi treenillä ennen kuin olo selvästi kohenee.",
      coachNote:
        "Tämä ei ole heikkous — vaan rajojen kuuntelemista. Paluu salille vasta kun olo on selvästi parempi.",
    },
  },
  poor_sleep: {
    light: {
      training: "Lyhyt, maltillinen treeni tai kevyt liike — ei PR-päivää.",
      food: "Tasainen proteiini; vältä isoja sokeripiikkejä jotka sekoittavat unirytmiä.",
      recovery: "Päiväunet tai 10 min rauhoittumista. Pidä ilta matalalla stimulaatiolla.",
      durationCheck: "Tarkista illalla: jos väsymys jatkuu, kevennetään huomista.",
      coachNote: "Yksi huono yö ei riko viikkoa — tänään ei tarvitse todistaa mitään.",
    },
    clear: {
      training: "Kevyt liike tai lyhyt sessio. Vältä maksimikuormaa ja pitkiä settejä.",
      food: "Rauhalliset ateriat; kahvi kohtuullisesti. Neste kunnossa.",
      recovery: "Priorisoi unta tänä iltana. Pieni kävely voi auttaa, mutta ei pakota.",
      durationCheck: "Seuraava tarkistus huomenna aamulla — unen laatu ratkaisee kuorman.",
      coachNote: "Univelka näkyy suorituksessa — säädämme kuormaa, emme syyllistä.",
    },
    bad: {
      training: "Lepo tai hyvin kevyt liike. Ei raskasta treeniä ennen kuin nukut paremmin.",
      food: "Kevyt, tuttu ruoka — ei isoja määriä tai rankkoja kokeiluja.",
      recovery: "Tavoite: nukkua ensi yönä pidempi pätkä. Rauhallinen iltarutiini.",
      durationCheck: "Jos unettomuus jatkuu useita öitä, kannattaa keskustella ammattilaisen kanssa.",
      coachNote: "Krooninen univelka on turvallisuusriski salilla — kuorma alas, kunnes uni palaa.",
    },
  },
  high_stress: {
    light: {
      training: "Kohtuullinen treeni ok — pidä sessio lyhyenä ja hallittuna.",
      food: "Säännölliset ateriat; vältä pitkiä paastoja stressipäivänä.",
      recovery: "5 min hengitystä tai kävelyä — pieni reset auttaa palautumista.",
      durationCheck: "Illalla lyhyt arvio: jos stressi jatkuu, kevennetään huomista.",
      coachNote: "Stressi on kuormaa samalla tavalla kuin treeni — laskemme kokonaiskuormaa.",
    },
    clear: {
      training: "Kevyt tai keskitaso — ei maksimivetoja. Tekniikka ennen määrää.",
      food: "Tutut ruoat, ei äärimmäistä säännöstellisyyttä tänään.",
      recovery: "Aktivoi palautuminen: kävely, venyttely, näyttötauot.",
      durationCheck: "Seuraava tarkistus 1–2 päivän päästä tai kun tilanne helpottaa.",
      coachNote: "Kun stressi on korkea, täydellinen suoritus ei ole tavoite — jatkuvuus on.",
    },
    bad: {
      training: "Lepo tai hyvin kevyt liike. Vältä kovaa hermostokuormaa salilla.",
      food: "Yksinkertainen rytmi — pienet ateriat säännöllisesti.",
      recovery: "Priorisoi unta ja rajaa uutisia. Tarvittaessa keskustele tuen kanssa.",
      durationCheck: "Jos oireet ovat voimakkaita (esim. rintakipu, pyörrytys), hakeudu hoitoon.",
      coachNote: "Kova stressi + kova treeni on riskiyhdistelmä — valitaan turvallinen linja.",
    },
  },
  travel: {
    light: {
      training: "Hotelli-/kotitreeni tai kävely — pidä liike tuttuna.",
      food: "Valitse proteiini + kasvikset kun mahdollista; vältä pelkkää snackki-päivää.",
      recovery: "Venyttele lyhyesti ja juo vettä — matkustus kuivattaa.",
      durationCheck: "Seuraava tarkistus kun pääset takaisin tuttuun rytmiin.",
      coachNote: "Matka ei ole häpeä — rakennamme viikon uudelleen ympärillesi.",
    },
    clear: {
      training: "Kevyt kesto + kehonpaino tai vastukset. Ei tarvitse täyttä saliohjelmaa.",
      food: "Käytännölliset ateriat: supermarketit ja yksinkertaiset yhdistelmät.",
      recovery: "Kävely ja uni ensisijaisia — aikavyöhyke ja istuminen verottavat.",
      durationCheck: "Paluu normaaliin 2–3 päivää — säädämme kuormaa sen mukaan.",
      coachNote: "Kun rutiinit hajoavat, pienet ankkurit (proteiini, kävely) riittävät.",
    },
    bad: {
      training: "Minimikuorma: kävely ja liikkuvuus. Lepo ok jos aikataulu on kaoottinen.",
      food: "Riittävästi energiaa — älä jää nälkäiseksi pitkiin päiviin.",
      recovery: "Uni ja neste. Jos jaksaminen romahtaa, vähennä muita vaatimuksia.",
      durationCheck: "Kun kotiudut, nollaa viikko rauhassa — ei kiirettä takaisin maksimeihin.",
      coachNote: "Pitkä tai raskas reissu syö palautumista — kevennä ilman selittelyä.",
    },
  },
  no_gym: {
    light: {
      training: "Kotitreeni tai ulkona: kehonpaino, käsipainot, juoksukierros kevyesti.",
      food: "Pidä rytmi — sama ateriamalli kuin normaalisti mahdollisimman hyvin.",
      recovery: "Kevyt venyttely ja kävely auttavat palautumista ilman salia.",
      durationCheck: "Kun pääset salille, aloita kevyesti ensimmäinen kerta.",
      coachNote: "Sali ei ole ainoa paikka kehittyä — tänään tehdään järkevä vaihtoehto.",
    },
    clear: {
      training: "Korvaa päivän ohjelma kestävyydellä + voimalla ilman laitteita.",
      food: "Proteiini säilyy: kananmuna, rahka, tölkkikala, pavuista.",
      recovery: "Pidä yö rauhallisena — matala treeni ei tarkoita laiskuutta.",
      durationCheck: "Seuraava tarkistus kun tilanne muuttuu — emme pinoa syyllisyyttä.",
      coachNote: "Esteet kuuluvat elämään — ohjelma taipuu, kun ympäristö ei taivu.",
    },
    bad: {
      training: "Kevyt liike kotona; vältä tempomaksuja jos välineitä ei ole.",
      food: "Helppo kaupasta: leipä + proteiini + kasvikset — ei täydellisyyttä.",
      recovery: "Kävely ja uni. Jos motivaatio laskee, pieni askel riittää.",
      durationCheck: "Kun pääset takaisin salille, tee kevyt totuttelu ennen isoja painoja.",
      coachNote: "Ilman salia ei tarvitse keksiä täydellistä korvaajaa — riittää, että liikut järkevästi.",
    },
  },
  skipped_session: {
    light: {
      training: "Seuraava treeni hieman kevyempi tai lyhyempi — ei paniikkia.",
      food: "Pidä ruokarytmi normaalina; älä rankaise itseä nälkäpäivällä.",
      recovery: "Ylimääräinen kävely tai venyttely voi tuntua hyvältä.",
      durationCheck: "Seuraava treeni: tarkista lämmittely huolellisesti.",
      coachNote: "Yksi väliin jäänyt ei kaada koko viikkoa — jatkamme suunnitelmallisesti.",
    },
    clear: {
      training: "Seuraavaksi volyymia alas hieman — rakenna varmasti takaisin.",
      food: "Vältä kompensointia ylisöllä — tasainen syöminen pitää mielenkin tasaisena.",
      recovery: "Uni ensin. Jos olo on väsynyt, älä tuplaa kuormaa heti.",
      durationCheck: "Viikon lopussa katso, tarvitaanko yksi kevyempi päivä.",
      coachNote: "Väliin jääminen on dataa — säädämme eteenpäin, emme jää märehtimään.",
    },
    bad: {
      training: "Kevyt paluu: tekniikka ja verryttely, ei maksimeja heti ensimmäisellä kerralla.",
      food: "Älä tee 'korjauspaastoa' — syö normaalisti ja luotettavasti.",
      recovery: "Anna itsellesi yksi rauhallinen ilta ennen seuraavaa kovaa päivää.",
      durationCheck: "Jos väliin jääminen toistuu, katsotaan viikon rakennetta uudelleen.",
      coachNote: "Kun väliä tulee usein, ongelma on usein aikataulu, ei motivaatio — säädetään kuormaa.",
    },
  },
  multi_skip: {
    light: {
      training: "Paluu: 2–3 kevyttä päivää ennen vanhaa volyymia.",
      food: "Tasainen syöminen — ei radikaalia leikkausta.",
      recovery: "Kävelyä ja unta — palautuminen ennen kuin kiristät ruuvia.",
      durationCheck: "Arvio viikon lopussa: montako treeniä sait tehtyä?",
      coachNote: "Useampi väliin jäänyt päivä vaatii selkeän nollauksen — ei rangaistustreeniä.",
    },
    clear: {
      training: "Uudelleenkalibroi: kesto ensin, intensiteetti myöhemmin.",
      food: "Pidä proteiini kohdillaan — lihas ei katoa muutamassa päivässä.",
      recovery: "Stressitasoa alas: vähemmän uusia kokeiluja, enemmän unta.",
      durationCheck: "Seuraava tarkistus 7 päivän päästä — rakennetaan kestävämpi rytmi.",
      coachNote: "Kun ketju katkeaa, tärkein on aloittaa uudelleen ilman häpeää.",
    },
    bad: {
      training: "Aloita lyhyistä sessioista; vältä 'kauhistelutreeniä' joka vie taas kipeäksi.",
      food: "Ei äärimmäistä dieettiä samaan aikaan — yksi muutos kerrallaan.",
      recovery: "Palautuminen ensin. Jos elämä on kuormittavaa, kuorma alas.",
      durationCheck: "Harkitse viikon treenimäärän pysyvää laskua — kestävyys ennen määrää.",
      coachNote: "Pitkä tauko on signaali, ei epäonnistuminen — rakennetaan uusi pohja.",
    },
  },
  food_chaos: {
    light: {
      training: "Tavallinen tai kevyt treeni — ei tarvitse kompensoida rankalla.",
      food: "Seuraavat 24 h: yksinkertainen rytmi — sama aamu, lounas, ilta.",
      recovery: "Vettä ja kävelyä; vältä uutta sotkua samana iltana.",
      durationCheck: "Huomenna takaisin tuttuun listaan — yksi päivä ei määritä viikkoa.",
      coachNote: "Ruokasotku kuuluu elämään — otamme takaisin hallintaa pienin askelin.",
    },
    clear: {
      training: "Kevyt liike auttaa verensokerin tasaantumisessa — ei maksimia.",
      food: "Seuraavat ateriat: proteiini + kasvikset + järkevä hiilihydraatti.",
      recovery: "Uni korjaa paljon — älä jää valvomaan ruutuun.",
      durationCheck: "Kolmen päivän sääntö: jos rytmi palaa, jatketaan normaalisti.",
      coachNote: "Kun ruoka hajoaa, älä lisää siihen syyllisyyttä — lisää rakennetta.",
    },
    bad: {
      training: "Kevyt päivä; vältä rankkaa treeniä jos vatsa on sekaisin.",
      food: "Yksinkertainen ja tuttu ruoka; vältä rankkoja kokeiluja ja ylensyöntiä.",
      recovery: "Nesteytys ja lepo. Jos oireet jatkuvat, harkitse neuvoa.",
      durationCheck: "Jos ruoansulatusoireet ovat voimakkaita tai pitkittyvät, käännu puoleen.",
      coachNote: "Ei häpeää — haetaan rutiini takaisin, ei täydellisyyttä.",
    },
  },
  no_appetite: {
    light: {
      training: "Kevyt liike ok; vältä pitkiä tyhjinä vatsoin tehtyjä treenejä.",
      food: "Pienet annokset usein; neste ja lämmin juoma voi avata ruokahalua.",
      recovery: "Rauhallinen ympäristö syödessä; ei pakottamista.",
      durationCheck: "Jos ruokahalu puuttuu useita päiviä, varaa aika ammattilaiselle.",
      coachNote: "Ruokahalu voi kadota stressistä tai väsymyksestä — kuuntele kehoa.",
    },
    clear: {
      training: "Älä tee pitkiä kovia treenejä ilman polttoainetta.",
      food: "Neste + helposti sulava proteiini (smoothie, rahka, keitto).",
      recovery: "Uni ja pienet askelmat — ei isoja muutoksia samaan aikaan.",
      durationCheck: "Seuraa painetta ja jaksamista — jos heikkenee, hoida asiaa.",
      coachNote: "Ilman nälkää ei tarvitse syöttää kaloreita väkisin — etsitään toimiva tapa.",
    },
    bad: {
      training: "Lepo tai hyvin kevyt liike. Ei rasittavaa treeniä ilman riittävää energiaa.",
      food: "Jos et pysty syömään lainkaan tai olo on sairasmainen, ota yhteys hoitoon.",
      recovery: "Täyslepo ja neste. Älä yritä paastota entisestään.",
      durationCheck: "Jatkuva ruokahaluttomuus vaatii usein ammattilaisen arviota.",
      coachNote: "Tämä voi liittyä terveyteen laajemmin — emme tee diagnoosia, mutta ohjaamme hoitoon tarvittaessa.",
    },
  },
  shoulder: {
    light: {
      training: "Vältä kipeää liikerataa; tee olkapää-ystävällisiä variaatioita.",
      food: "Tulehdusta tukeva perusruoka — ei tarvitse ihmeitä.",
      recovery: "Lepo kipeästä ärsytyksestä; lämpö voi auttaa ennen liikettä.",
      durationCheck: "Jos kipu ei väisty 48–72 h, varaa arvio fysioterapeutille tai lääkärille.",
      coachNote: "Olkapää vaatii malttia — korvaamme liikkeet, emme paikkaa kipua treenillä.",
    },
    clear: {
      training: "Ei yläkropan painonnostoa kipeälle puolelle — korvausliikkeet kevyesti.",
      food: "Proteiini ylläpitoon; kalorit riittävästi, mutta ei pakkomättömyyttä.",
      recovery: "Unen laatu vaikuttaa kipukierrokseen — priorisoi lepoa.",
      durationCheck: "Älä testaa maksimeja ennen kuin liike tuntuu neutraalilta.",
      coachNote: "Kipu ei ole heikkous — se on signaali muuttaa tekniikkaa ja kuormaa.",
    },
    bad: {
      training: "Jätä raskaat veto/työntöliikkeet pois — vain kivuton liike tai lepo.",
      food: "Perusruoka; vältä tulehdusriskiä pahentavia äärimmäisyyksiä.",
      recovery: "Jää ja lepo kipeään olkaan; ei venyttelyä kipukohtaan.",
      durationCheck: "Voimakas kipu, puutuminen tai iskun jälkeinen kipu → hakeudu hoitoon.",
      coachNote: "Vakava olkapääkipu kuuluu ammattilaiselle — emme arvioi vammoja sovelluksessa.",
    },
  },
  knee: {
    light: {
      training: "Korvaa syvä kyykky esim. korokkeella tai polviystävällisellä variaatiolla.",
      food: "Normaali syöminen — painonhallinta maltillisesti jos polvi kuormittuu.",
      recovery: "Kevyt pyöräily tai kävely voi tuntua paremmalta kuin juoksu.",
      durationCheck: "Jos turvotus tai kipu pahenee treenin jälkeen, kevennä heti.",
      coachNote: "Polvi kestää kuormaa, kun kulma ja volyymi ovat oikein — säädetään molempia.",
    },
    clear: {
      training: "Vältä hyppyjä ja syviä askelia; keskity kontrolloituun liikkeeseen.",
      food: "Proteiini ja riittävä energia — älä leikkaa kaloreita jyrkästi samaan aikaan.",
      recovery: "Jäädytystä/polvi ylös -asentoa iltaisin tarvittaessa.",
      durationCheck: "Jos kipu häiritsee kävelyä, keskeytä kova treeni ja hae arvio.",
      coachNote:
        "Polvivaivat ovat yleisiä — rakennamme treenin niin, että jatkat pitkään.",
    },
    bad: {
      training: "Ei kyykkyä, ei hyppyjä, ei pitkiä juoksulenkkejä ennen arviota.",
      food: "Pidä paino maltillisena — ylimääräinen paino kuormittaa polvia.",
      recovery: "Lepo ja tarvittaessa tuki side. Turvotus → kylmä 10 min.",
      durationCheck: "Jos polvi lukkiutuu, turpoaa voimakkaasti tai pettää alla, hakeudu hoitoon.",
      coachNote: "Vakava polvikipu vaatii usein tutkimusta — tämä ei ole itsehoito-ohjelma.",
    },
  },
  back: {
    light: {
      training: "Vältä raskaita nostoja ja kierrota selkää varovasti — keskivartalotuki päälle.",
      food: "Normaali ruoka; vältä ylensyöntiä joka vetää makuulle väärään asentoon.",
      recovery: "Kävely ja kevyt liikkuvuus; vältä pitkää istumista ilman taukoja.",
      durationCheck: "Jos kipu säteilee jalkaan tai tuntuu terävänä, varaa aika.",
      coachNote: "Selkä vaatii usein rauhallista progressiota — ei kiirettä isoon deadliftiin.",
    },
    clear: {
      training: "Kevyt keskivartalo + jalkatyö ilman selän roundingia.",
      food: "Kuitu ja neste — suolisto voi heijastua selkäjumiin.",
      recovery: "Uni kyljellä tai polvet koukussa voi helpottaa.",
      durationCheck: "Älä tee aksiaalista kuormaa jos kipu on voimakas.",
      coachNote: "Selkäkipu on monisyinen — säädämme treeniä, mutta emme diagnoosoi.",
    },
    bad: {
      training: "Ei raskaita nostoja. Kevyt kävely ok jos kipu sallii — muuten lepo.",
      food: "Kevyt ruoka; vältä rankkoja kokeiluja.",
      recovery: "Lepoasento, tarvittaessa tuki. Älä venytä kivulla väkisin.",
      durationCheck: "Puutuminen, virtsaamisvaikeus tai kipu hengittäessä → hätä hoitoon.",
      coachNote: "Vakavat selkäoireet kuuluvat ammattilaiselle — tämä on turvaraja.",
    },
  },
  strain_upper: {
    light: {
      training: "Vältä kipeää liikettä 48 h; tee vastakkaista kehoa tai kevyttä aerobia.",
      food: "Proteiini ylläpitoon; neste kunnossa.",
      recovery: "Kevyt verenkierto ilman kipua — ei venytä repäisyä.",
      durationCheck: "Jos kipu ei väisty 3–5 päivässä, harkitse arviota.",
      coachNote: "Venähdys paranee malttilla — ei kiirettä takaisin maksimeihin.",
    },
    clear: {
      training: "Ei kipeää liikettä; korvausliikkeet ilman venytystä kudosalueelle.",
      food: "Tulehdusta tukeva perusruoka; vältä alkoholia palautumisen tukoksi.",
      recovery: "Uni ensin. Kylmä 10 min tulehduksen alussa voi auttaa.",
      durationCheck: "Paluu progressiivisesti: kivuton liike ensin.",
      coachNote: "Yläkropan venähdys vaatii usein viikon tai kaksi maltillista linjaa.",
    },
    bad: {
      training: "Lepo kipeälle alueelle. Ei vetoja/työntöjä ennen kivutonta liikettä.",
      food: "Riittävästi energiaa paranemiseen — ei agressiivista dieettiä.",
      recovery: "Jos mustelma, turvotus tai epävakaus, hae arvio.",
      durationCheck: "Voimakas kipu, epänormaali muoto → hakeudu hoitoon.",
      coachNote: "Vakava vamma ei kuulu netti-coachiin — ohjaamme tarvittaessa tutkimuksiin.",
    },
  },
  strain_lower: {
    light: {
      training: "Vältä kipeää liikettä; pyöräily kevyesti voi käydä kävelyn sijaan.",
      food: "Perusruoka; proteiini kudoksen ylläpitoon.",
      recovery: "Kevyt liikkuvuus ilman kipua — ei pakota venyttämään.",
      durationCheck: "Jos ontuminen jatkuu, vähennä kuormaa edelleen.",
      coachNote: "Alakroppa kantaa paljon — anna sen parantua ennen isoja volyymejä.",
    },
    clear: {
      training: "Ei syviä kyykkyjä tai sprinttejä — korvausliikkeet hallitusti.",
      food: "Ei rankkaa paastoa — paraneminen vaatii polttoainetta.",
      recovery: "Uni ja kevyt kävely verenkiertoon.",
      durationCheck: "3–7 päivän maltillinen jakso ennen normaalia treeniä.",
      coachNote: "Venähdys alhaalla voi vaikuttaa koko ketjuun — säädetään koko viikkoa.",
    },
    bad: {
      training: "Lepo tai erittäin kevyt liike. Ei hyppyjä tai raskaita vetoja.",
      food: "Riittävästi ruokaa — ei jätä kehoa ilman resursseja.",
      recovery: "Jos kipu on voimakas tai kävely vaikeutuu, hakeudu hoitoon.",
      durationCheck: "Turvotus, epävakaus nivelissä → ammattilaisen arvio.",
      coachNote: "Alaraajakipu voi olla monenlaista — emme tee diagnoosia, mutta turva ohjaa hoitoon.",
    },
  },
  weight_stuck: {
    light: {
      training: "Pidä treeni säännöllisenä — pieni volyymin tai tempon säätö.",
      food: "Tarkista yksi asia viikossa (esim. öljyt tai juomat) — ei kaikkea kerralla.",
      recovery: "Uni ja stressi vaikuttavat vaakaan — ei vain kaloreita.",
      durationCheck: "2 viikon mittausjakso ennen johtopäätöksiä.",
      coachNote: "Paino voi junata — mittaamme trendiä, emme yhden päivän lukemia.",
    },
    clear: {
      training: "Vaihda yksi muuttuja: askelia, treenityyppiä tai toistoja.",
      food: "Tarkista proteiinin taso ja öljyjen määrä — usein löytyy piilokaloria.",
      recovery: "Vältä ylipitkää kiristämistä — se nostaa stressiä.",
      durationCheck: "Kuukauden välein iso kuva: mittanauha ja kuvat, ei vain vaaka.",
      coachNote: "Juminen paino ei tarkoita epäonnistumista — tarkistetaan dataa rauhassa.",
    },
    bad: {
      training: "Älä lisää treenimäärää rajusti — se voi nostaa nälkää ja stressiä.",
      food: "Jos olet leikannut pitkään, harkitse maltillista ylläpitojaksoa ammattilaisen kanssa.",
      recovery: "Tarkista uni ja hormonaaliset tekijät tarvittaessa lääkärillä.",
      durationCheck: "Jos terveys oireilee tai syömishäiriökaltainen käyttäytyminen, hae tukea.",
      coachNote: "Painonhallinta on terveysasia — ohjaamme tarvittaessa ammattilaisen piiriin.",
    },
  },
  weight_fast: {
    light: {
      training: "Pidä voimat yllä — ei lisää cardioa kiireellä.",
      food: "Lisää hieman energiaa maltillisesti (esim. yksi välipala).",
      recovery: "Uni ja stressi kuntoon — nopea pudotus voi johtua niistä.",
      durationCheck: "Seuraa viikon trendiä; jos jatkuu, säädä tavoitetta.",
      coachNote: "Liian nopea pudotus voi syödä lihasta — korjaamme suuntaa varovasti.",
    },
    clear: {
      training: "Vähennä kardiovolyymia hieman; pidä voimatreeni pääosassa.",
      food: "Lisää hiilihydraattia yhteen ateriaan tai öljyä maltillisesti.",
      recovery: "Tarkista neste ja suola — ne vaikuttavat myös vaakaan.",
      durationCheck: "Jos paino putoaa viikkotasolla liian nopeasti useita viikkoja, keskustele ammattilaisen kanssa.",
      coachNote: "Tavoite on terveys — emme kiirehdi hintaan millä hyvänsä.",
    },
    bad: {
      training: "Ei lisäcardioa. Lepo ja riittävä energia ensin.",
      food: "Lisää energiaa selkeästi — jos et uskalla syödä, hae tukea.",
      recovery: "Huimaus, väsymys tai sydämen tykytys → hakeudu hoitoon.",
      durationCheck: "Nopea laihtuminen ilman tarkoituksenmukaista syytä vaatii lääkärin arviota.",
      coachNote: "Raju painonpudotus voi olla merkki sairaudesta — emme tee diagnoosia, mutta ohjaamme hoitoon.",
    },
  },
  strength_down: {
    light: {
      training: "Kevyt viikko: sama liike, vähemmän sarjoja tai painoja.",
      food: "Varmista proteiini ja kokonaisenergia — ei nälkäkierteitä.",
      recovery: "Uni ensin; väsymys näkyy tankissa aikaisin.",
      durationCheck: "1–2 viikon jakso ennen kuin teet isoja johtopäätöksiä.",
      coachNote: "Voimat heilahtelevat — katsomme koko kuvaa, emme yhtä huonoa päivää.",
    },
    clear: {
      training: "Deload-viikko: tekniikka ja liikeradat, ei maksimeja.",
      food: "Jos olet dieetillä, harkitse maltillista refeediä tai ylläpitokaloreita.",
      recovery: "Stressi ja uni — kaksi suurinta voiman syöjää.",
      durationCheck: "Jos pudotus jatkuu useita viikkoja, tarkista terveys ja elämäntilanne.",
      coachNote:
        "Voiman lasku voi olla väsymystä, sairautta tai liian kovaa kuormaa — säädetään linjaa.",
    },
    bad: {
      training: "Lepo tai erittäin kevyt liike. Älä aja maksimeja uupuneena.",
      food: "Riittävästi ruokaa — ei jatkuvaa kiristämistä.",
      recovery: "Jos uupumus on jatkuvaa, harkitse terveydenhuoltoa ja verikokeita.",
      durationCheck: "Heikkous, laihtuminen tai infektio-oireet → arvio ammattilaiselta.",
      coachNote: "Jatkuva voiman romahdus voi olla merkki terveysongelmasta — emme arvioi tautia tässä.",
    },
  },
  poor_recovery: {
    light: {
      training: "Kevyt treeni; vältä sarjoja vikaan asti.",
      food: "Hiilarit riittävästi treenipäivänä — ei pelkkää proteiinia.",
      recovery: "Kävely, venyttely, sauna kevyesti — ei uutta kovaa ärsykettä.",
      durationCheck: "Seuraava tarkistus 3–4 päivän päästä.",
      coachNote: "Palautuminen ei ole laiskuutta — se on osa suorituskykyä.",
    },
    clear: {
      training: "Vähennä volyymia 20–40 % muutamaksi päiväksi.",
      food: "Tarkista että syöt tarpeeksi suhteessa kuormaan.",
      recovery: "Uni #1. Rajaa lisästressiä ja myöhäisiä valvomisia.",
      durationCheck: "Viikon lopussa: jos olo ei parane, kevennetään uudelleen.",
      coachNote: "Huono palautuminen kertoo usein liian isasta kokonaiskuormasta — leikkaamme sitä.",
    },
    bad: {
      training: "Lepo tai hyvin kevyt liike. Ei kovaa treeniä ennen kuin uni ja olo paranevat.",
      food: "Riittävästi energiaa — paasto ei paranna palautumista tässä tilanteessa.",
      recovery: "Jos sydän tykyttää, pyörryttää tai nukut todella huonosti pitkään, hae arvio.",
      durationCheck: "Jatkuva uupumus voi olla sairautta — käännä puoleen tarvittaessa.",
      coachNote: "Krooninen väsymys ei ratkea vain kovemmalla treenillä — etsimään syitä turvallisesti.",
    },
  },
};

const EN: Record<ExceptionId, Record<ExceptionSeverity, ExceptionGuidanceStrings>> = {
  sick: {
    light: {
      training:
        "Keep movement easy: walk, breathing, or 10 minutes of mobility — no hard conditioning.",
      food: "Fluids and small meals; warm drinks can help. No need to force a full plate.",
      recovery: "Rest and sleep first. The calendar can wait.",
      durationCheck: "Re-check tonight. If symptoms continue, rest beats training.",
      coachNote:
        "A light day is the right call — not lazy. You don’t need to prove anything.",
    },
    clear: {
      training: "No hard training. Easy walking only if you feel up to it — otherwise full rest.",
      food: "Simple, easy-to-digest food in small portions. Avoid heavy experiments and alcohol.",
      recovery: "Prioritize sleep and fluids. Keep the day’s load minimal.",
      durationCheck: "Re-check tomorrow morning. Fever or strong weakness means rest continues.",
      coachNote:
        "In this state, nobody needs a full send from you — rebuild in small steps.",
    },
    bad: {
      training: "No gym session. Rest; only very light indoor walking if anything.",
      food: "Simple food when appetite allows — fluids first.",
      recovery: "Full rest. If symptoms are severe or worsening, contact healthcare.",
      durationCheck: "Re-assess every 12–24h. Don’t “earn” training back before you clearly feel better.",
      coachNote:
        "This isn’t weakness — it’s respecting limits. Return to the gym only when you clearly improve.",
    },
  },
  poor_sleep: {
    light: {
      training: "Short, moderate session or easy movement — not a PR day.",
      food: "Steady protein; avoid big sugar spikes that wreck sleep rhythm.",
      recovery: "A nap or 10 minutes to wind down. Keep the evening low-stimulation.",
      durationCheck: "Check tonight: if fatigue persists, we lighten tomorrow.",
      coachNote: "One bad night doesn’t break the week — you don’t need to prove anything today.",
    },
    clear: {
      training: "Light or moderate — avoid max loads and long grinders.",
      food: "Calm meals; moderate caffeine. Hydrate.",
      recovery: "Prioritize sleep tonight. A walk may help — don’t force it.",
      durationCheck: "Re-check tomorrow morning — sleep quality drives load.",
      coachNote: "Sleep debt shows up in performance — we adjust load, not shame.",
    },
    bad: {
      training: "Rest or very easy movement. No heavy training until you sleep better.",
      food: "Light, familiar food — not huge volumes or wild experiments.",
      recovery: "Goal: a longer sleep window tonight. Calm evening routine.",
      durationCheck: "If insomnia continues for multiple nights, consider talking to a professional.",
      coachNote: "Chronic sleep debt is a safety issue in the gym — reduce load until sleep returns.",
    },
  },
  high_stress: {
    light: {
      training: "Moderate training is fine — keep the session short and controlled.",
      food: "Regular meals; avoid long fasting windows on a high-stress day.",
      recovery: "5 minutes of breathing or walking — small resets help recovery.",
      durationCheck: "Quick check tonight: if stress stays high, we lighten tomorrow.",
      coachNote: "Stress is training load too — we reduce total load, not just bar weight.",
    },
    clear: {
      training: "Light or medium — no max attempts. Technique before volume.",
      food: "Familiar foods; avoid extreme restriction today.",
      recovery: "Activate recovery: walk, easy mobility, screen breaks.",
      durationCheck: "Re-check in 1–2 days or when the situation eases.",
      coachNote: "When stress is high, perfect performance isn’t the goal — continuity is.",
    },
    bad: {
      training: "Rest or very easy movement. Avoid heavy neural fatigue in the gym.",
      food: "Simple rhythm — small meals regularly.",
      recovery: "Prioritize sleep and limit doomscrolling. Reach out for support if needed.",
      durationCheck: "If you have severe symptoms (e.g. chest pain, fainting), seek care.",
      coachNote: "High stress + hard training is a risky combo — we choose the safe line.",
    },
  },
  travel: {
    light: {
      training: "Hotel/home workout or walking — keep patterns familiar.",
      food: "Protein + vegetables when possible; avoid an all-snack day.",
      recovery: "Short mobility and water — travel dehydrates.",
      durationCheck: "Re-check when you’re back to a normal rhythm.",
      coachNote: "Travel isn’t failure — we rebuild the week around you.",
    },
    clear: {
      training: "Light endurance + bodyweight or bands — you don’t need a full gym.",
      food: "Practical meals: supermarkets and simple combos.",
      recovery: "Walking and sleep first — time zones and sitting drain you.",
      durationCheck: "Return to normal in 2–3 days — we adjust load accordingly.",
      coachNote: "When routines break, small anchors (protein, walking) are enough.",
    },
    bad: {
      training: "Minimum load: walking and mobility. Rest is OK if the schedule is chaotic.",
      food: "Enough energy — don’t stay hungry through long days.",
      recovery: "Sleep and fluids. If energy crashes, cut other demands.",
      durationCheck: "After you’re home, reset the week calmly — no rush back to maxes.",
      coachNote: "Long or rough travel eats recovery — go lighter without negotiating.",
    },
  },
  no_gym: {
    light: {
      training: "Home/outdoor: bodyweight, dumbbells, or an easy run.",
      food: "Keep meal rhythm — match your normal pattern as well as you can.",
      recovery: "Light stretching and walking support recovery without machines.",
      durationCheck: "When you’re back in a gym, start the first session lighter.",
      coachNote: "The gym isn’t the only place to improve — today we do a smart alternative.",
    },
    clear: {
      training: "Replace the day with conditioning + strength without machines.",
      food: "Protein stays: eggs, skyr, canned fish, beans.",
      recovery: "Keep the night calm — light training isn’t laziness.",
      durationCheck: "Re-check when access changes — no guilt stacking.",
      coachNote: "Obstacles happen — the program bends when the environment doesn’t.",
    },
    bad: {
      training: "Easy home movement; avoid tempo PRs if equipment is missing.",
      food: "Simple shopping: bread + protein + veg — no perfection needed.",
      recovery: "Walking and sleep. If motivation drops, one small step still counts.",
      durationCheck: "When you return, ease in before heavy loads.",
      coachNote: "Without a gym you don’t need a perfect substitute — move sensibly.",
    },
  },
  skipped_session: {
    light: {
      training: "Next session slightly shorter or lighter — no panic.",
      food: "Keep eating normally; don’t punish with hunger.",
      recovery: "Extra walking or easy mobility can feel good.",
      durationCheck: "Next workout: warm up carefully.",
      coachNote: "One missed session doesn’t collapse the week — we continue with intent.",
    },
    clear: {
      training: "Next time reduce volume a bit — rebuild confidently.",
      food: "Avoid compensating with huge intake — steady eating keeps your head steady too.",
      recovery: "Sleep first. If you feel wrecked, don’t double the load immediately.",
      durationCheck: "By week’s end, see if you need one lighter day.",
      coachNote: "A miss is data — we adjust forward, not ruminate.",
    },
    bad: {
      training: "Easy return: technique and warm-ups, no maxes on the first day back.",
      food: "No ‘fix-it fast’ restriction — eat normally and reliably.",
      recovery: "Give yourself a calm evening before the next hard day.",
      durationCheck: "If misses repeat, we restructure the week — not your character.",
      coachNote: "Frequent misses are usually scheduling, not motivation — we tune load.",
    },
  },
  multi_skip: {
    light: {
      training: "Return with 2–3 lighter days before old volume.",
      food: "Steady eating — no radical cuts.",
      recovery: "Walking and sleep — recover before you tighten the screw.",
      durationCheck: "End-of-week review: how many sessions did you get?",
      coachNote: "Multiple misses need a clean reset — not a punishment workout.",
    },
    clear: {
      training: "Recalibrate: duration first, intensity later.",
      food: "Keep protein up — muscle doesn’t vanish in a few days.",
      recovery: "Lower life stress where possible; fewer new experiments, more sleep.",
      durationCheck: "Re-check in 7 days — build a more sustainable rhythm.",
      coachNote: "When the chain breaks, restarting without shame matters most.",
    },
    bad: {
      training: "Start with short sessions; avoid a ‘panic session’ that leaves you sore.",
      food: "No extreme dieting at the same time — one change at a time.",
      recovery: "Recovery first. If life is heavy, reduce training load.",
      durationCheck: "Consider lowering weekly training volume permanently — durability before volume.",
      coachNote: "A long break is a signal, not failure — we build a new base.",
    },
  },
  food_chaos: {
    light: {
      training: "Normal or light training — no need to compensate with brutality.",
      food: "Next 24h: simple rhythm — same breakfast, lunch, dinner idea.",
      recovery: "Water and walking; avoid new chaos the same night.",
      durationCheck: "Tomorrow back to your usual list — one day doesn’t define the week.",
      coachNote: "Food chaos happens — we take back control in small steps.",
    },
    clear: {
      training: "Light movement helps stabilize energy — no maxes.",
      food: "Next meals: protein + vegetables + sensible carbs.",
      recovery: "Sleep fixes a lot — don’t doomscroll late.",
      durationCheck: "Three-day rule: if rhythm returns, continue normally.",
      coachNote: "When food breaks, don’t add guilt — add structure.",
    },
    bad: {
      training: "Light day; avoid hard training if digestion is upset.",
      food: "Simple familiar food; avoid heavy experiments and overeating.",
      recovery: "Hydration and rest. If symptoms persist, seek advice.",
      durationCheck: "Strong or ongoing gut symptoms deserve professional input.",
      coachNote: "No shame — we rebuild routine, not perfection.",
    },
  },
  no_appetite: {
    light: {
      training: "Light movement OK; avoid long hard sessions fasted.",
      food: "Small portions often; fluids and warm drinks may open appetite.",
      recovery: "Calm eating environment — no forcing.",
      durationCheck: "If appetite is gone for several days, book a professional.",
      coachNote: "Appetite can vanish from stress or fatigue — listen to your body.",
    },
    clear: {
      training: "Don’t run long hard sessions without fuel.",
      food: "Fluids + easy protein (smoothie, yogurt, soup).",
      recovery: "Sleep and small steps — not every change at once.",
      durationCheck: "Watch energy and weight — if it worsens, address it.",
      coachNote: "You don’t need to force calories — we find a workable path.",
    },
    bad: {
      training: "Rest or very easy movement. No hard training without adequate energy.",
      food: "If you can’t eat or feel acutely unwell, contact healthcare.",
      recovery: "Full rest and fluids. Don’t add fasting on top.",
      durationCheck: "Persistent loss of appetite often needs professional assessment.",
      coachNote: "This can relate to broader health — we don’t diagnose, but we’ll point you to care when needed.",
    },
  },
  shoulder: {
    light: {
      training: "Avoid painful range; use shoulder-friendly variations.",
      food: "Basic anti-inflammatory eating — no magic needed.",
      recovery: "Rest the irritated pattern; gentle heat may help before easy movement.",
      durationCheck: "If pain doesn’t ease in 48–72h, book physio or a clinician.",
      coachNote: "Shoulders need patience — we swap lifts, not train through pain.",
    },
    clear: {
      training: "No heavy pressing into the painful side — substitutions, light loads.",
      food: "Protein for maintenance; enough calories without forcing.",
      recovery: "Sleep quality affects pain loops — prioritize rest.",
      durationCheck: "No max testing until the movement feels neutral.",
      coachNote: "Pain isn’t weakness — it’s a signal to change technique and load.",
    },
    bad: {
      training: "No heavy push/pull on the painful pattern — painless motion or rest.",
      food: "Basic meals; avoid extremes that add stress.",
      recovery: "Ice and rest the angry shoulder; don’t stretch into sharp pain.",
      durationCheck: "Severe pain, numbness, or post-trauma pain → seek care.",
      coachNote: "Serious shoulder issues belong to professionals — we don’t assess injuries here.",
    },
  },
  knee: {
    light: {
      training: "Swap deep squat for box/pin variations or knee-friendly options.",
      food: "Normal eating — manage weight gently if load aggravates the knee.",
      recovery: "Easy cycling or walking may feel better than running.",
      durationCheck: "If pain/swelling worsens after training, reduce immediately.",
      coachNote: "Knees tolerate load when angles and volume are right — we adjust both.",
    },
    clear: {
      training: "Avoid jumps and deep steps; focus on controlled patterns.",
      food: "Protein and enough energy — don’t slash calories hard at the same time.",
      recovery: "Ice/elevation in the evening if needed.",
      durationCheck: "If pain interferes with walking, stop hard training and get assessed.",
      coachNote: "Knee issues are common — we train so you can stay consistent long-term.",
    },
    bad: {
      training: "No squatting, jumping, or long runs until assessed.",
      food: "Keep weight reasonable — extra weight loads the knees.",
      recovery: "Rest and support if needed. Swelling → cold 10 min.",
      durationCheck: "Locking, major swelling, or instability → seek care.",
      coachNote: "Serious knee pain often needs evaluation — this isn’t a self-fix program.",
    },
  },
  back: {
    light: {
      training: "Avoid heavy pulls and careless spinal rotation — brace the trunk.",
      food: "Normal food; avoid huge meals that pull you into bad positions.",
      recovery: "Walking and easy mobility; break up long sitting.",
      durationCheck: "If pain radiates or feels sharp, book an assessment.",
      coachNote: "Back training needs patient progression — no rush to huge deadlifts.",
    },
    clear: {
      training: "Light core + leg work without rounding.",
      food: "Fiber and fluids — gut can mirror back stiffness.",
      recovery: "Sleep with knees bent can help some people.",
      durationCheck: "No heavy axial loading if pain is strong.",
      coachNote: "Back pain is multifactorial — we adjust training, we don’t diagnose.",
    },
    bad: {
      training: "No heavy lifting. Easy walking if tolerated — otherwise rest.",
      food: "Light meals; avoid wild experiments.",
      recovery: "Rest positions; don’t force painful stretching.",
      durationCheck: "Numbness, bladder issues, or pain with breathing → emergency care.",
      coachNote: "Serious back symptoms belong to professionals — this is a safety boundary.",
    },
  },
  strain_upper: {
    light: {
      training: "Avoid the painful motion for 48h; train the opposite side or easy cardio.",
      food: "Protein for tissue support; stay hydrated.",
      recovery: "Easy blood flow without pain — don’t stretch a fresh tear aggressively.",
      durationCheck: "If pain persists 3–5 days, consider an assessment.",
      coachNote: "Strains heal with patience — no rush back to maxes.",
    },
    clear: {
      training: "No painful pattern; substitute lifts without pulling on the tissue.",
      food: "Basic supportive food; avoid alcohol as a ‘recovery tool’.",
      recovery: "Sleep first. Ice early if it’s acutely angry.",
      durationCheck: "Return progressively: painless motion first.",
      coachNote: "Upper-body strains often need a week or two of sensible loading.",
    },
    bad: {
      training: "Rest the area. No pulls/pushes until movement is painless.",
      food: "Enough energy to heal — no aggressive dieting.",
      recovery: "Bruising, instability, or deformity → get evaluated.",
      durationCheck: "Severe pain or odd shape → seek care.",
      coachNote: "Serious injuries aren’t for internet coaching — we’ll guide you to proper care.",
    },
  },
  strain_lower: {
    light: {
      training: "Avoid painful patterns; easy cycling may substitute walking.",
      food: "Basic meals; protein for tissue maintenance.",
      recovery: "Easy pain-free movement — don’t force stretching.",
      durationCheck: "If limping continues, reduce load further.",
      coachNote: "The lower body carries a lot — let it heal before big volume.",
    },
    clear: {
      training: "No deep squats or sprints — controlled substitutions only.",
      food: "No harsh fasting — healing needs fuel.",
      recovery: "Sleep and easy walking for circulation.",
      durationCheck: "3–7 days sensible before normal training.",
      coachNote: "Lower-body issues can affect the whole chain — we adjust the week.",
    },
    bad: {
      training: "Rest or very easy movement. No jumps or heavy pulls.",
      food: "Eat enough — don’t starve recovery.",
      recovery: "Severe pain or trouble walking → seek care.",
      durationCheck: "Swelling or instability → professional evaluation.",
      coachNote: "Leg pain can be many things — we don’t diagnose, but safety routes you to care.",
    },
  },
  weight_stuck: {
    light: {
      training: "Keep training consistent — small volume or tempo tweak.",
      food: "Fix one thing this week (e.g. oils or drinks) — not everything at once.",
      recovery: "Sleep and stress move the scale — not calories alone.",
      durationCheck: "Use a 2-week window before big conclusions.",
      coachNote: "Weight can stall — we track trends, not single days.",
    },
    clear: {
      training: "Change one variable: steps, session style, or rep scheme.",
      food: "Check protein and hidden fats/oils — common hidden calories.",
      recovery: "Avoid endless tightening — it raises stress.",
      durationCheck: "Monthly big picture: tape and photos, not only the scale.",
      coachNote: "A plateau isn’t failure — we inspect data calmly.",
    },
    bad: {
      training: "Don’t add tons of cardio — it can raise hunger and stress.",
      food: "If you’ve dieted long, consider a maintenance phase with a professional.",
      recovery: "Check sleep and hormones with a clinician if needed.",
      durationCheck: "If health struggles or disordered patterns appear, get support.",
      coachNote: "Weight management is healthcare — we’ll route you when needed.",
    },
  },
  weight_fast: {
    light: {
      training: "Keep strength work — don’t add cardio panic.",
      food: "Add a little energy carefully (e.g. one snack).",
      recovery: "Sleep and stress drive fast drops too — not just calories.",
      durationCheck: "Watch the weekly trend; adjust the goal if it continues.",
      coachNote: "Too-fast loss can cost muscle — we correct gently.",
    },
    clear: {
      training: "Reduce cardio volume slightly; keep strength as the anchor.",
      food: "Add carbs to one meal or a little fat — modestly.",
      recovery: "Check fluids and sodium — they move the scale too.",
      durationCheck: "If weekly loss stays too fast for weeks, talk to a professional.",
      coachNote: "Health is the goal — we don’t rush at any cost.",
    },
    bad: {
      training: "No extra cardio. Rest and adequate fuel first.",
      food: "Increase intake clearly — if you’re afraid to eat, get support.",
      recovery: "Dizziness, fatigue, palpitations → seek care.",
      durationCheck: "Rapid unintended weight loss may need medical evaluation.",
      coachNote: "Fast loss can signal illness — we don’t diagnose, but we’ll point you to care.",
    },
  },
  strength_down: {
    light: {
      training: "Light week: same lifts, fewer sets or loads.",
      food: "Ensure protein and total energy — no starvation spirals.",
      recovery: "Sleep first; fatigue shows in the bar before the mirror.",
      durationCheck: "Give it 1–2 weeks before big conclusions.",
      coachNote: "Strength fluctuates — we look at the whole picture, not one bad day.",
    },
    clear: {
      training: "Deload week: technique and ranges, no maxes.",
      food: "If dieting, consider a small refeed or maintenance calories.",
      recovery: "Stress and sleep are the biggest strength killers.",
      durationCheck: "If the drop lasts weeks, check health and life load.",
      coachNote: "Strength loss can be fatigue, illness, or overload — we adjust the system.",
    },
    bad: {
      training: "Rest or very easy work. Don’t grind maxes while depleted.",
      food: "Enough food — no endless tightening.",
      recovery: "If exhaustion is constant, consider medical review and labs.",
      durationCheck: "Weakness, illness signs, or unexplained loss → professional review.",
      coachNote: "A sustained crash can signal illness — we don’t diagnose illness here.",
    },
  },
  poor_recovery: {
    light: {
      training: "Light training; avoid sets to failure.",
      food: "Enough carbs on training days — not protein-only.",
      recovery: "Walking, easy mobility, sauna lightly — no new hard stimulus.",
      durationCheck: "Re-check in 3–4 days.",
      coachNote: "Recovery isn’t laziness — it’s part of performance.",
    },
    clear: {
      training: "Cut volume 20–40% for a few days.",
      food: "Make sure you eat enough for the training you do.",
      recovery: "Sleep #1. Cut late nights and extra stressors.",
      durationCheck: "By week’s end: if you don’t improve, we reduce again.",
      coachNote: "Poor recovery usually means total load is too high — we cut it.",
    },
    bad: {
      training: "Rest or very easy movement. No hard training until sleep and energy improve.",
      food: "Enough energy — fasting won’t fix this situation.",
      recovery: "Palpitations, dizziness, or chronic insomnia → get evaluated.",
      durationCheck: "Persistent exhaustion may be medical — reach out when needed.",
      coachNote: "Chronic fatigue won’t be fixed by training harder — we look for safe causes.",
    },
  },
};

export function resolveExceptionGuidance(
  locale: Locale,
  id: ExceptionId,
  severity: ExceptionSeverity,
): ExceptionGuidanceStrings {
  const table = locale === "en" ? EN : FI;
  return table[id][severity];
}

export function mergeExceptionIntoDailyPlan(
  plan: CoachDailyPlan,
  active: ActiveExceptionState,
  locale: Locale,
): CoachDailyPlan {
  const g = resolveExceptionGuidance(locale, active.id, active.severity);
  const sep = locale === "en" ? " — " : " — ";
  const headline =
    locale === "en"
      ? "Life happened mode"
      : "Elämä tapahtui -tila";
  const systemLine = `${headline}${sep}${g.coachNote}`;
  return {
    ...plan,
    /** Poikkeustila ohittaa tavallisen live-rivin, jotta signaali näkyy selvästi. */
    systemLine,
    todayFoodTask: `${plan.todayFoodTask}${sep}${g.food}`,
    todayActivityTask: `${plan.todayActivityTask}${sep}${g.training}`,
    foodAdjustmentNote: plan.foodAdjustmentNote
      ? `${plan.foodAdjustmentNote}${sep}${g.recovery}`
      : `${g.recovery}`,
    rebalancePlan: plan.rebalancePlan,
  };
}

export function shouldSuppressWorkoutLink(active: ActiveExceptionState): boolean {
  const { id, severity } = active;
  if (id === "sick" && severity !== "light") return true;
  if (id === "no_gym") return true;
  if (id === "poor_sleep" && severity === "bad") return true;
  if (id === "high_stress" && severity === "bad") return true;
  if (id === "strain_upper" && severity !== "light") return true;
  if (id === "strain_lower" && severity !== "light") return true;
  if ((id === "shoulder" || id === "knee" || id === "back") && severity === "bad")
    return true;
  if (id === "no_appetite" && severity === "bad") return true;
  if (id === "food_chaos" && severity === "bad") return true;
  if (id === "strength_down" && severity === "bad") return true;
  if (id === "poor_recovery" && severity === "bad") return true;
  return false;
}
