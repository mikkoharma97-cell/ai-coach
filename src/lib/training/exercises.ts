/**
 * Liikepankki v1 — yksi lähde: guided, pro, progression, vaihtoehdot, rajoitteet.
 * Vähintään kaksi vaihtoehtoa per liike, syillä (FI/EN).
 */
import type { Level, ProgramTrackId } from "@/types/coach";
import type {
  Exercise,
  ExerciseAlternative,
  ExerciseCategory,
  ExerciseDefinition,
  ExerciseSelectionDebug,
  ExerciseSelectionSlotDebug,
  LimitationTag,
} from "@/types/exercise";

function alt(
  id: string,
  nameFi: string,
  nameEn: string,
  reasonFi: string,
  reasonEn: string,
  targetExerciseId?: string,
): ExerciseAlternative {
  const o: ExerciseAlternative = {
    id,
    nameFi,
    nameEn,
    reasonFi,
    reasonEn,
  };
  if (targetExerciseId) o.targetExerciseId = targetExerciseId;
  return o;
}

function ex(
  partial: Omit<ExerciseDefinition, "alternatives"> & {
    alternatives: ExerciseAlternative[];
  },
): Exercise {
  if (partial.alternatives.length < 2) {
    throw new Error(`Exercise ${partial.id}: vähintään 2 alternatives`);
  }
  return partial;
}

/** Ydinliikkeet (40) — kategoriat: push, pull, legs, core, conditioning */
export const ALL_EXERCISES: Exercise[] = [
  ex({
    id: "bench_press",
    nameFi: "Penkkipunnerrus",
    nameEn: "Barbell bench press",
    category: "push",
    primaryMuscles: ["rinta"],
    secondaryMuscles: ["olkapää", "ojentaja"],
    difficulty: "intermediate",
    equipment: ["barbell"],
    limitations: ["shoulder_sensitive", "wrist_sensitive"],
    defaultSets: 3,
    defaultReps: "6–10",
    alternatives: [
      alt(
        "bench_press_alt_db",
        "Käsipainopenkki",
        "Dumbbell bench press",
        "jos olkapää ärtyy tangosta",
        "if the bar irritates your shoulders",
        "dumbbell_flat_press",
      ),
      alt(
        "bench_press_alt_machine",
        "Rintapunnerruslaite",
        "Chest press machine",
        "jos haluat vakaamman liikeradan",
        "if you want a more stable path",
        "cable_fly",
      ),
    ],
  }),
  ex({
    id: "dumbbell_flat_press",
    nameFi: "Vaakapenkki käsipainoilla",
    nameEn: "Flat dumbbell press",
    category: "push",
    primaryMuscles: ["rinta"],
    secondaryMuscles: ["olkapää"],
    difficulty: "beginner",
    equipment: ["dumbbell"],
    limitations: undefined,
    alternatives: [
      alt(
        "db_flat_alt_machine",
        "Pec deck / rintalaite",
        "Pec deck / chest fly machine",
        "jos käsipainot tuntuvat epävakailta",
        "if dumbbells feel unstable",
        "cable_fly",
      ),
      alt(
        "db_flat_alt_smith",
        "Smith-vaakapenkki",
        "Smith machine flat press",
        "jos tarvitset ohjatun radan",
        "if you need a guided bar path",
      ),
    ],
  }),
  ex({
    id: "incline_db_press",
    nameFi: "Vinopenkki käsipainoilla",
    nameEn: "Incline dumbbell press",
    category: "push",
    primaryMuscles: ["rinta ylä"],
    secondaryMuscles: ["olkapää"],
    difficulty: "intermediate",
    equipment: ["dumbbell"],
    limitations: ["shoulder_sensitive"],
    alternatives: [
      alt(
        "incline_alt_smith",
        "Vinopenkki Smithillä",
        "Incline Smith press",
        "jos käsipainot väsyttävät ranteita",
        "if DBs fatigue your wrists",
      ),
      alt(
        "incline_alt_cable",
        "Vinopenkki kaapeleilla",
        "Low incline cable press",
        "jos haluat jatkuvan jännityksen",
        "if you want constant tension",
      ),
    ],
  }),
  ex({
    id: "ohp",
    nameFi: "Pystypunnerrus",
    nameEn: "Overhead press",
    category: "push",
    primaryMuscles: ["olkapää"],
    secondaryMuscles: ["olkapää taka", "vatsa"],
    difficulty: "intermediate",
    equipment: ["barbell"],
    limitations: ["shoulder_sensitive", "wrist_sensitive"],
    alternatives: [
      alt(
        "ohp_alt_smith",
        "Smith pystypunnerrus",
        "Smith overhead press",
        "jos vapaa tanko tuntuu epävarmalta",
        "if the free bar feels uncertain",
      ),
      alt(
        "ohp_alt_machine",
        "Olkapäälaite",
        "Shoulder press machine",
        "jos haluat istuen tukevamman alustan",
        "if you want a seated, stable base",
      ),
    ],
  }),
  ex({
    id: "lateral_raise",
    nameFi: "Vipunostot sivulle",
    nameEn: "Lateral raise",
    category: "push",
    primaryMuscles: ["olkapää sivu"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["dumbbell"],
    limitations: ["shoulder_sensitive"],
    alternatives: [
      alt(
        "lat_raise_alt_cable",
        "Kaapelivipunosto",
        "Cable lateral raise",
        "jos käsipaino tärisee liikaa",
        "if the dumbbell shakes too much",
      ),
      alt(
        "lat_raise_alt_machine",
        "Sivunostolaite",
        "Lateral raise machine",
        "jos haluat täysin vakaan radan",
        "if you want a fully fixed path",
      ),
    ],
  }),
  ex({
    id: "tricep_pushdown",
    nameFi: "Taljaveto ojentajalle (pushdown)",
    nameEn: "Cable triceps pushdown",
    category: "push",
    primaryMuscles: ["ojentaja"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["cable"],
    limitations: ["wrist_sensitive"],
    alternatives: [
      alt(
        "pushdown_alt_rope",
        "Köysi pushdown",
        "Rope pushdown",
        "jos ranne ei pidä suorasta tangosta",
        "if your wrist dislikes the straight bar",
      ),
      alt(
        "pushdown_alt_machine",
        "Ojentajalaite",
        "Triceps machine extension",
        "jos haluat istuen täyden kontrollin",
        "if you want seated full control",
      ),
    ],
  }),
  ex({
    id: "skullcrusher",
    nameFi: "Ranskalainen punnerrus",
    nameEn: "Skull crusher / lying extension",
    category: "push",
    primaryMuscles: ["ojentaja"],
    secondaryMuscles: [],
    difficulty: "intermediate",
    equipment: ["barbell", "dumbbell"],
    limitations: ["wrist_sensitive", "shoulder_sensitive"],
    alternatives: [
      alt("skull_alt_cable", "Kaapeli päälle taljassa", "Cable overhead extension", "jos tanko rasittaa kyynärpäitä", "if the bar bothers elbows"),
      alt("skull_alt_db", "Käsipaino päälle penkissä", "DB lying extension", "jos haluat vapaamman ranteen", "if you want freer wrists"),
    ],
  }),
  ex({
    id: "close_grip_bench",
    nameFi: "Kapea penkkipunnerrus",
    nameEn: "Close-grip bench press",
    category: "push",
    primaryMuscles: ["ojentaja", "rinta"],
    secondaryMuscles: ["olkapää"],
    difficulty: "advanced",
    equipment: ["barbell"],
    limitations: ["wrist_sensitive", "shoulder_sensitive"],
    alternatives: [
      alt("cgb_alt_dip", "Dippaus", "Dip", "jos penkki kuormittaa ranteita", "if bench loads wrists heavily"),
      alt("cgb_alt_pushdown", "Pushdown painopakka", "Heavy pushdown stack", "jos haluat eristää ojentajaa", "if you want triceps isolation"),
    ],
  }),
  ex({
    id: "dip",
    nameFi: "Dippaus",
    nameEn: "Parallel bar dip",
    category: "push",
    primaryMuscles: ["rinta", "ojentaja"],
    secondaryMuscles: ["olkapää"],
    difficulty: "intermediate",
    equipment: ["bodyweight"],
    limitations: ["shoulder_sensitive"],
    alternatives: [
      alt("dip_alt_machine", "Dippauslaite", "Assisted dip machine", "jos oma paino on liikaa", "if bodyweight is too much"),
      alt("dip_alt_pushup", "Kapea punnerrus", "Close-grip push-up", "jos tankoa ei ole", "if no dip station"),
    ],
  }),
  ex({
    id: "cable_fly",
    nameFi: "Kaapeliristikkäisvetä",
    nameEn: "Cable fly / crossover",
    category: "push",
    primaryMuscles: ["rinta"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["cable"],
    limitations: undefined,
    alternatives: [
      alt("fly_alt_pec", "Pec deck", "Pec deck", "jos kaapelit varistavat", "if cables feel awkward"),
      alt(
        "fly_alt_db",
        "Käsipaino fly penkissä",
        "DB fly",
        "jos haluat vapaiden painojen tunteen",
        "if you want free-weight feel",
        "dumbbell_flat_press",
      ),
    ],
  }),
  ex({
    id: "lat_pulldown",
    nameFi: "Ylätalja",
    nameEn: "Lat pulldown",
    category: "pull",
    primaryMuscles: ["lat"],
    secondaryMuscles: ["hauis"],
    difficulty: "beginner",
    equipment: ["machine", "cable"],
    limitations: ["shoulder_sensitive"],
    alternatives: [
      alt("lat_pd_alt_pull", "Leuanveto kuminauhalla", "Banded pull-up", "jos leuanveto ei vielä kulje", "if pull-ups aren’t there yet"),
      alt("lat_pd_alt_row", "Yläsoutu käsipainolla", "Chest-supported DB row", "jos haluat erilaista kulmaa", "if you want a different angle"),
    ],
  }),
  ex({
    id: "pull_up",
    nameFi: "Leuanveto",
    nameEn: "Pull-up",
    category: "pull",
    primaryMuscles: ["lat"],
    secondaryMuscles: ["hauis", "yläselkä"],
    difficulty: "advanced",
    equipment: ["bodyweight"],
    limitations: ["shoulder_sensitive"],
    alternatives: [
      alt("pu_alt_band", "Avustettu leuanveto", "Assisted pull-up", "jos täysi toisto ei onnistu", "if full reps aren’t possible"),
      alt("pu_alt_lat", "Ylätalja", "Lat pulldown", "jos tanko ei ole käytössä", "if no pull-up bar"),
    ],
  }),
  ex({
    id: "barbell_row",
    nameFi: "Kulmasoutu tangolla",
    nameEn: "Barbell row (bent-over)",
    category: "pull",
    primaryMuscles: ["yläselkä"],
    secondaryMuscles: ["hauis", "takaolkapää"],
    difficulty: "intermediate",
    equipment: ["barbell"],
    limitations: ["lower_back_sensitive"],
    alternatives: [
      alt("bb_row_alt_chest", "Penkkiin nojaten soutu", "Chest-supported row", "jos alaselkä väsyy", "if low back tires first"),
      alt("bb_row_alt_machine", "Soutulaite", "Seated row machine", "jos haluat tukea rintaa vasten", "if you want chest support"),
    ],
  }),
  ex({
    id: "dumbbell_row",
    nameFi: "Soutu käsipainolla",
    nameEn: "One-arm dumbbell row",
    category: "pull",
    primaryMuscles: ["lat", "yläselkä"],
    secondaryMuscles: ["hauis"],
    difficulty: "beginner",
    equipment: ["dumbbell"],
    limitations: ["lower_back_sensitive"],
    alternatives: [
      alt("db_row_alt_cable", "Yksipuolinen kaapelisoutu", "Single-arm cable row", "jos penkki ei ole vapaana", "if the bench is taken"),
      alt("db_row_alt_machine", "Alatalja käsipaino-otteella", "Machine row", "jos haluat istuen", "if you prefer seated"),
    ],
  }),
  ex({
    id: "seated_cable_row",
    nameFi: "Istuva kaapelisoutu (alatalja)",
    nameEn: "Seated cable row",
    category: "pull",
    primaryMuscles: ["yläselkä"],
    secondaryMuscles: ["hauis"],
    difficulty: "beginner",
    equipment: ["cable", "machine"],
    limitations: ["lower_back_sensitive"],
    alternatives: [
      alt("scr_alt_tbar", "T-bar soutu", "T-bar row", "jos istuminen tuntuu ahtaalta", "if seated feels cramped"),
      alt("scr_alt_face", "Face pull + kevyt soutu", "Face pull combo", "jos haluat olkapään terveyttä", "if you want shoulder health bias"),
    ],
  }),
  ex({
    id: "face_pull",
    nameFi: "Face pull",
    nameEn: "Face pull",
    category: "pull",
    primaryMuscles: ["takaolkapää"],
    secondaryMuscles: ["olkapää"],
    difficulty: "beginner",
    equipment: ["cable"],
    limitations: ["shoulder_sensitive"],
    alternatives: [
      alt("fp_alt_reverse", "Käänteinen fly taljassa", "Reverse pec deck", "jos köysi ei ole", "if no rope attachment"),
      alt("fp_alt_band", "Kuminauha face pull", "Banded face pull", "jos salilla ruuhkaa", "if the gym is crowded"),
    ],
  }),
  ex({
    id: "barbell_curl",
    nameFi: "Hauiskääntö tangolla",
    nameEn: "Barbell curl",
    category: "pull",
    primaryMuscles: ["hauis"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["barbell"],
    limitations: ["wrist_sensitive"],
    alternatives: [
      alt("bb_curl_alt_ez", "EZ-tanko", "EZ-bar curl", "jos ranne valittaa suoraa tankoa", "if straight bar bothers wrists"),
      alt("bb_curl_alt_db", "Käsipaino vuorokäsin", "Alternating DB curl", "jos tanko kiertää liikaa", "if the bar rotates too much"),
    ],
  }),
  ex({
    id: "hammer_curl",
    nameFi: "Hammerkääntö",
    nameEn: "Hammer curl",
    category: "pull",
    primaryMuscles: ["hauis", "kyynärvarsi"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["dumbbell"],
    limitations: ["wrist_sensitive"],
    alternatives: [
      alt("ham_alt_rope", "Köysi hammer taljassa", "Rope hammer curl", "jos käsipainot loppu", "if DBs are gone"),
      alt("ham_alt_cross", "ristikkäin käsipainolla", "Cross-body hammer", "jos haluat eri kulmaa", "if you want a different angle"),
    ],
  }),
  ex({
    id: "t_bar_row",
    nameFi: "T-bar soutu",
    nameEn: "T-bar row",
    category: "pull",
    primaryMuscles: ["yläselkä"],
    secondaryMuscles: ["hauis"],
    difficulty: "intermediate",
    equipment: ["barbell", "machine"],
    limitations: ["lower_back_sensitive"],
    alternatives: [
      alt("tbar_alt_machine", "T-bar laite", "Chest-supported T-bar", "jos vapaa T-bar tuntuu raskaalta", "if free T-bar feels heavy"),
      alt(
        "tbar_alt_row",
        "Käsipainosoutu penkissä",
        "DB row on bench",
        "jos ei T-bar telineitä",
        "if no T-bar station",
        "dumbbell_row",
      ),
    ],
  }),
  ex({
    id: "back_squat",
    nameFi: "Takakyykky",
    nameEn: "Back squat",
    category: "legs",
    primaryMuscles: ["etureisi", "pakara"],
    secondaryMuscles: ["taka reisi"],
    difficulty: "advanced",
    equipment: ["barbell"],
    limitations: ["knee_sensitive", "lower_back_sensitive"],
    alternatives: [
      alt(
        "sq_alt_smith",
        "Smith-takakyykky",
        "Smith squat",
        "jos tarvitset ohjatun pystysuoran",
        "if you need a vertical track",
        "smith_squat",
      ),
      alt(
        "sq_alt_goblet",
        "Goblet-kyykky",
        "Goblet squat",
        "jos tankokuorma on liikaa",
        "if bar load is too much",
        "lunge",
      ),
    ],
  }),
  ex({
    id: "smith_squat",
    nameFi: "Smith-kyykky",
    nameEn: "Smith machine squat",
    category: "legs",
    primaryMuscles: ["etureisi", "pakara"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["smith"],
    limitations: ["knee_sensitive"],
    alternatives: [
      alt(
        "smith_alt_leg",
        "Jalkaprässi",
        "Leg press",
        "jos polvet kaipaavat istuvaa",
        "if knees prefer seated loading",
        "leg_press",
      ),
      alt(
        "smith_alt_hack",
        "Hack-kyykky",
        "Hack squat",
        "jos Smith varattu",
        "if Smith is busy",
        "hack_squat",
      ),
    ],
  }),
  ex({
    id: "hack_squat",
    nameFi: "Hack-kyykky",
    nameEn: "Hack squat",
    category: "legs",
    primaryMuscles: ["etureisi", "pakara"],
    secondaryMuscles: [],
    difficulty: "intermediate",
    equipment: ["machine"],
    limitations: ["knee_sensitive", "lower_back_sensitive"],
    alternatives: [
      alt(
        "hack_alt_leg",
        "Jalkaprässi",
        "Leg press",
        "jos hack-laite ei ole",
        "if no hack machine",
        "leg_press",
      ),
      alt("hack_alt_vsq", "Pystypainon kyykky", "V-squat", "jos haluat eri kulmaa", "if you want a different angle"),
    ],
  }),
  ex({
    id: "leg_press",
    nameFi: "Jalkaprässi",
    nameEn: "Leg press",
    category: "legs",
    primaryMuscles: ["etureisi", "pakara"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["machine"],
    limitations: ["knee_sensitive", "lower_back_sensitive"],
    alternatives: [
      alt("lp_alt_smith", "Smith-kyykky kevyesti", "Light Smith squat", "jos haluat jalkojen hallintaa seisten", "if you want standing control", "smith_squat"),
      alt("lp_alt_lunge", "Askelkyykky", "Lunge", "jos laite varattu", "if machine is taken", "lunge"),
    ],
  }),
  ex({
    id: "lunge",
    nameFi: "Askelkyykky",
    nameEn: "Walking / static lunge",
    category: "legs",
    primaryMuscles: ["etureisi", "pakara"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["bodyweight", "dumbbell"],
    limitations: ["knee_sensitive", "hip_sensitive"],
    alternatives: [
      alt(
        "lunge_alt_split",
        "Bulgarialainen askel",
        "Bulgarian split squat",
        "jos polvi ei pidä askelista",
        "if knee dislikes stepping",
        "bulgarian_split_squat",
      ),
      alt("lunge_alt_step", "Step-up", "Step-up", "jos tasapaino horjuu", "if balance is shaky"),
    ],
  }),
  ex({
    id: "bulgarian_split_squat",
    nameFi: "Bulgarialainen askelkyykky",
    nameEn: "Bulgarian split squat",
    category: "legs",
    primaryMuscles: ["etureisi", "pakara"],
    secondaryMuscles: [],
    difficulty: "intermediate",
    equipment: ["dumbbell", "bodyweight"],
    limitations: ["knee_sensitive", "hip_sensitive"],
    alternatives: [
      alt("bss_alt_split", "Smith-jakoaskel", "Smith split squat", "jos käsipainot horjuvat", "if DBs feel unstable"),
      alt("bss_alt_leg", "Yksijalka prässi", "Single-leg press", "jos nilkka ei anna jakaa", "if ankle won’t cooperate"),
    ],
  }),
  ex({
    id: "leg_extension",
    nameFi: "Reiden ojennus",
    nameEn: "Leg extension",
    category: "legs",
    primaryMuscles: ["etureisi"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["machine"],
    limitations: ["knee_sensitive"],
    alternatives: [
      alt("ext_alt_goblet", "Goblet-kyykky matala", "Shallow goblet squat", "jos laite ei ole", "if machine unavailable"),
      alt("ext_alt_wall", "Seinää vasten polven ojennus", "Wall quad activation", "jos haluat kevyen aktivoinnin", "if you want light activation"),
    ],
  }),
  ex({
    id: "leg_curl",
    nameFi: "Reiden koukistus",
    nameEn: "Leg curl",
    category: "legs",
    primaryMuscles: ["taka reisi"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["machine"],
    limitations: ["knee_sensitive"],
    alternatives: [
      alt("curl_alt_ball", "Pallo koukistus makuulla", "Stability ball curl", "jos makuulaite varattu", "if prone machine busy"),
      alt("curl_alt_seated", "Istuen koukistus", "Seated leg curl", "jos makuu tuntuu epämukavalta", "if lying feels off"),
    ],
  }),
  ex({
    id: "hip_thrust",
    nameFi: "Lantionnosto",
    nameEn: "Hip thrust",
    category: "legs",
    primaryMuscles: ["pakara"],
    secondaryMuscles: ["taka reisi"],
    difficulty: "intermediate",
    equipment: ["barbell", "bodyweight"],
    limitations: ["hip_sensitive", "lower_back_sensitive"],
    alternatives: [
      alt("ht_alt_glute", "Glute bridge", "Glute bridge", "jos tanko painaa häpäintä", "if bar digs in"),
      alt("ht_alt_smith", "Smith lantionnosto", "Smith hip thrust", "jos haluat ohjatun radan", "if you want a guided path"),
    ],
  }),
  ex({
    id: "rdl",
    nameFi: "RDL / suorinjaloin maastaveto",
    nameEn: "Romanian deadlift",
    category: "legs",
    primaryMuscles: ["taka reisi", "pakara"],
    secondaryMuscles: ["taka ketju"],
    difficulty: "intermediate",
    equipment: ["barbell", "dumbbell"],
    limitations: ["lower_back_sensitive", "hip_sensitive"],
    alternatives: [
      alt(
        "rdl_alt_legcurl",
        "Reiden koukistus",
        "Leg curl",
        "jos eteenkyykky rasittaa alaselkää",
        "if hinging loads the low back",
        "leg_curl",
      ),
      alt("rdl_alt_db", "RDL käsipainolla", "DB RDL", "jos tanko kiertää", "if bar rotation bothers you"),
    ],
  }),
  ex({
    id: "calf_standing",
    nameFi: "Pohkeet seisten",
    nameEn: "Standing calf raise",
    category: "legs",
    primaryMuscles: ["pohje"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["machine", "bodyweight"],
    limitations: ["knee_sensitive"],
    alternatives: [
      alt("calf_s_alt_smith", "Smith pohje", "Smith calf raise", "jos paino puuttuu", "if you need load"),
      alt("calf_s_alt_seated", "Pohje istuen", "Seated calf", "jos akilles on kireä", "if Achilles is tight"),
    ],
  }),
  ex({
    id: "calf_seated",
    nameFi: "Pohkeet istuen",
    nameEn: "Seated calf raise",
    category: "legs",
    primaryMuscles: ["pohje"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["machine"],
    limitations: ["knee_sensitive"],
    alternatives: [
      alt("calf_i_alt_stand", "Pohje seisten", "Standing calf", "jos haluat koko ROM", "if you want full ROM focus"),
      alt("calf_i_alt_leg", "Jalkaprässin pohje", "Leg press calf", "jos istulaite varattu", "if seated machine busy"),
    ],
  }),
  ex({
    id: "hanging_leg_raise",
    nameFi: "Jalkojen nosto",
    nameEn: "Hanging leg raise",
    category: "core",
    primaryMuscles: ["vatsa", "koukistajat"],
    secondaryMuscles: [],
    difficulty: "intermediate",
    equipment: ["bodyweight"],
    limitations: ["shoulder_sensitive"],
    alternatives: [
      alt("hlr_alt_lying", "Makuulla jalannosto", "Lying leg raise", "jos tanko ei kannata", "if hanging hurts grip/shoulder"),
      alt("hlr_alt_captain", "Captain’s chair", "Captain’s chair raise", "jos haluat tukea selälle", "if you want back support"),
    ],
  }),
  ex({
    id: "cable_crunch",
    nameFi: "Vatsarutistus taljassa",
    nameEn: "Cable crunch",
    category: "core",
    primaryMuscles: ["vatsa"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["cable"],
    limitations: ["lower_back_sensitive"],
    alternatives: [
      alt("cc_alt_machine", "Vatsalaite", "Ab machine crunch", "jos talja varattu", "if cable busy"),
      alt("cc_alt_ball", "Pallolla rutistus", "Stability ball crunch", "jos haluat pidemmän liikeradan", "if you want longer ROM"),
    ],
  }),
  ex({
    id: "plank",
    nameFi: "Lankku",
    nameEn: "Plank",
    category: "core",
    primaryMuscles: ["korsetti"],
    secondaryMuscles: ["pakara"],
    difficulty: "beginner",
    equipment: ["bodyweight"],
    limitations: ["shoulder_sensitive", "lower_back_sensitive"],
    alternatives: [
      alt("plank_alt_side", "Sivulankku", "Side plank", "jos etulankku rasittaa ranteeseen", "if front plank hurts wrists"),
      alt("plank_alt_dead", "Dead bug", "Dead bug", "jos lankku tuntuu tylsältä nivelelle", "if plank feels harsh on joints"),
    ],
  }),
  ex({
    id: "ab_wheel",
    nameFi: "Voimapyörä",
    nameEn: "Ab wheel rollout",
    category: "core",
    primaryMuscles: ["vatsa", "korsetti"],
    secondaryMuscles: ["olkapää"],
    difficulty: "advanced",
    equipment: ["bodyweight"],
    limitations: ["lower_back_sensitive", "shoulder_sensitive"],
    alternatives: [
      alt("aw_alt_bar", "Tanko rullaus polvilleen", "Barbell rollout to knees", "jos pyörä puuttuu", "if no wheel"),
      alt("aw_alt_plank", "Lankku pitkänä", "Long-lever plank", "jos alaselkä pelkää", "if low back is cautious"),
    ],
  }),
  ex({
    id: "sit_up",
    nameFi: "Istumaan nousu",
    nameEn: "Sit-up",
    category: "core",
    primaryMuscles: ["vatsa"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["bodyweight"],
    limitations: ["lower_back_sensitive"],
    alternatives: [
      alt("su_alt_decline", "Vinopenkki rutistus", "Decline crunch", "jos perus nousu tuntuu selässä", "if basic sit-up bites back"),
      alt("su_alt_bike", "Polkupyörä", "Bicycle crunch", "jos niska väsyy", "if neck tires"),
    ],
  }),
  ex({
    id: "walk",
    nameFi: "Kävely",
    nameEn: "Walking",
    category: "conditioning",
    primaryMuscles: ["koko keho"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["bodyweight"],
    alternatives: [
      alt("walk_alt_incline", "Juoksumatto kalteva", "Incline treadmill walk", "jos ulkona liukasta", "if outdoors is slippery"),
      alt("walk_alt_nordic", "Sauvakävely", "Nordic walking", "jos haluat lisäkuormaa käsille", "if you want arm load"),
    ],
  }),
  ex({
    id: "bike",
    nameFi: "Pyöräily (ergometri)",
    nameEn: "Stationary bike",
    category: "conditioning",
    primaryMuscles: ["koko keho"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["machine"],
    limitations: ["knee_sensitive"],
    alternatives: [
      alt("bike_alt_rec", "Kotipyörä istuen", "Recumbent bike", "jos polvi ei pidä polkimista", "if knee dislikes flexion"),
      alt("bike_alt_air", "Air bike", "Air bike", "jos haluat kovemman hengityksen", "if you want harder breathing"),
    ],
  }),
  ex({
    id: "elliptical",
    nameFi: "Crosstrainer",
    nameEn: "Elliptical",
    category: "conditioning",
    primaryMuscles: ["koko keho"],
    secondaryMuscles: [],
    difficulty: "beginner",
    equipment: ["machine"],
    limitations: ["knee_sensitive"],
    alternatives: [
      alt("ell_alt_walk", "Kävely", "Brisk walk", "jos crosstrainer varattu", "if elliptical busy"),
      alt("ell_alt_step", "Stepper", "Stepper", "jos haluat matalamman iskun", "if you want lower impact"),
    ],
  }),
  ex({
    id: "stairs",
    nameFi: "Kevyt porrastreeni",
    nameEn: "Light stair climbing",
    category: "conditioning",
    primaryMuscles: ["etureisi", "pohje"],
    secondaryMuscles: [],
    difficulty: "intermediate",
    equipment: ["bodyweight", "machine"],
    limitations: ["knee_sensitive"],
    alternatives: [
      alt("stairs_alt_step", "Stepmill matala", "Low stepmill", "jos polvet ärtyvät portaissa", "if knees hate stairs"),
      alt("stairs_alt_incline", "Juoksumatto kalteva", "Incline walk", "jos portaita ei ole", "if no stairs available"),
    ],
  }),
];

const byId = new Map(ALL_EXERCISES.map((e) => [e.id, e]));

export const EXERCISES_BY_CATEGORY: Record<ExerciseCategory, Exercise[]> = {
  push: [],
  pull: [],
  legs: [],
  core: [],
  conditioning: [],
};

for (const e of ALL_EXERCISES) {
  EXERCISES_BY_CATEGORY[e.category].push(e);
}

export function getExerciseById(id: string): Exercise | undefined {
  return byId.get(id);
}

/** @deprecated käytä getExercisesByCategory */
export function exercisesInCategory(cat: ExerciseCategory): Exercise[] {
  return EXERCISES_BY_CATEGORY[cat];
}

export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return [...EXERCISES_BY_CATEGORY[category]];
}

export function getExerciseAlternatives(id: string): ExerciseAlternative[] {
  return getExerciseById(id)?.alternatives ?? [];
}

/** Taso: beginner = ei advanced + osa intermediate; intermediate = ei advanced paitsi osa; advanced = kaikki */
function exerciseAllowedForTrainingLevel(
  e: Exercise,
  level: Level,
  seed: string,
): boolean {
  if (level === "advanced") return true;
  if (e.difficulty === "beginner") return true;
  if (e.difficulty === "intermediate") {
    if (level === "intermediate") return true;
    return hashToIndex(`${seed}:${e.id}:im`, 3) !== 0;
  }
  if (level === "beginner") return false;
  return hashToIndex(`${seed}:${e.id}:adv`, 5) === 0;
}

export function filterExercisesByTrainingLevel(
  exercises: Exercise[],
  level: Level,
  seed: string,
): Exercise[] {
  return exercises.filter((e) => exerciseAllowedForTrainingLevel(e, level, seed));
}

export function getExercisesForTrainingLevel(
  level: Level,
  seed = "pool",
): Exercise[] {
  return filterExercisesByTrainingLevel(ALL_EXERCISES, level, seed);
}

/**
 * @deprecated käytä getExercisesForTrainingLevel — sama kuin filter koko pankille (legacy-seed).
 */
export function getExercisesForLevel(level: Level): Exercise[] {
  return getExercisesForTrainingLevel(level, "legacy");
}

export function exerciseConflictsWithLimitations(
  ex: Exercise,
  limitations: LimitationTag[] | undefined,
): boolean {
  if (!limitations?.length || !ex.limitations?.length) return false;
  return ex.limitations.some((t) => limitations.includes(t));
}

export function filterExercisesByLimitations(
  exercises: Exercise[],
  limitations: LimitationTag[] | undefined,
): Exercise[] {
  if (!limitations?.length) return exercises;
  return exercises.filter((e) => !exerciseConflictsWithLimitations(e, limitations));
}

function syntheticExerciseFromAlternative(
  parent: Exercise,
  alt: ExerciseAlternative,
): Exercise {
  const alts = parent.alternatives.length >= 2 ? parent.alternatives : [alt];
  return {
    id: alt.id,
    nameFi: alt.nameFi,
    nameEn: alt.nameEn,
    category: parent.category,
    primaryMuscles: parent.primaryMuscles,
    secondaryMuscles: parent.secondaryMuscles,
    difficulty: "beginner",
    equipment: ["machine"],
    limitations: undefined,
    defaultSets: parent.defaultSets,
    defaultReps: parent.defaultReps,
    alternatives: alts,
  };
}

export type ResolveExerciseResult = {
  exercise: Exercise;
  sourceExerciseId: string;
  wasSubstituted: boolean;
  substitutionReasonFi?: string;
  substitutionReasonEn?: string;
};

export function resolveExerciseWithAlternatives(
  exercise: Exercise,
  limitations: LimitationTag[] | undefined,
  _locale: "fi" | "en",
  depth = 0,
): ResolveExerciseResult {
  const lim = limitations ?? [];
  if (!exerciseConflictsWithLimitations(exercise, lim)) {
    return {
      exercise,
      sourceExerciseId: exercise.id,
      wasSubstituted: false,
    };
  }
  if (depth > 5) {
    return {
      exercise,
      sourceExerciseId: exercise.id,
      wasSubstituted: false,
    };
  }
  for (const a of exercise.alternatives) {
    const next =
      a.targetExerciseId != null ? getExerciseById(a.targetExerciseId) : undefined;
    const candidate = next ?? syntheticExerciseFromAlternative(exercise, a);
    if (candidate.id === exercise.id) continue;
    if (!exerciseConflictsWithLimitations(candidate, lim)) {
      return {
        exercise: candidate,
        sourceExerciseId: exercise.id,
        wasSubstituted: true,
        substitutionReasonFi: a.reasonFi,
        substitutionReasonEn: a.reasonEn,
      };
    }
    const chain = resolveExerciseWithAlternatives(candidate, lim, _locale, depth + 1);
    if (!exerciseConflictsWithLimitations(chain.exercise, lim)) {
      return {
        exercise: chain.exercise,
        sourceExerciseId: exercise.id,
        wasSubstituted: true,
        substitutionReasonFi: a.reasonFi,
        substitutionReasonEn: a.reasonEn,
      };
    }
  }
  return {
    exercise,
    sourceExerciseId: exercise.id,
    wasSubstituted: false,
  };
}

export type PickedExerciseSlot = {
  resolved: ResolveExerciseResult;
};

/**
 * Deterministinen valinta: taso → rajoitteet (pool) → hash → resolve vaihtoehtoon tarvittaessa.
 */
export function pickExercisesUnique(
  categories: ExerciseCategory[],
  seed: string,
  trainingLevel: Level,
  limitations?: LimitationTag[],
  programTrackId?: ProgramTrackId,
  locale: "fi" | "en" = "fi",
): { picks: PickedExerciseSlot[]; debug: ExerciseSelectionDebug } {
  const trackSalt = programTrackId ?? "";
  const taken = new Set<string>();
  const picks: PickedExerciseSlot[] = [];
  const slots: ExerciseSelectionSlotDebug[] = [];
  let salt = 0;

  for (const cat of categories) {
    const fullCat = exercisesInCategory(cat);
    const poolSizeCategory = fullCat.length;
    let pool = filterExercisesByTrainingLevel(
      fullCat,
      trainingLevel,
      `${seed}:${trackSalt}`,
    );
    if (pool.length === 0) pool = [...fullCat];

    const poolSizeAfterLevel = pool.length;
    const wouldConflictWithLimitationsCount = pool.filter((e) =>
      exerciseConflictsWithLimitations(e, limitations),
    ).length;

    let limPool = filterExercisesByLimitations(pool, limitations);
    if (limPool.length === 0) limPool = pool;

    const poolForPick = limPool.filter((e) => !taken.has(e.id));
    if (poolForPick.length === 0) continue;

    const baseSeed = `${seed}:${trackSalt}:${cat}:${salt++}`;
    const idx = hashToIndex(baseSeed, poolForPick.length);

    for (let attempt = 0; attempt < poolForPick.length; attempt++) {
      const picked = poolForPick[(idx + attempt) % poolForPick.length];
      const resolved = resolveExerciseWithAlternatives(
        picked,
        limitations,
        locale,
      );
      if (taken.has(resolved.exercise.id)) continue;
      taken.add(resolved.exercise.id);
      picks.push({ resolved });
      slots.push({
        category: cat,
        poolSizeCategory,
        poolSizeAfterLevel,
        wouldConflictWithLimitationsCount,
        pickedExerciseId: picked.id,
        resolvedExerciseId: resolved.exercise.id,
        wasSubstituted: resolved.wasSubstituted,
        substitutionReasonFi: resolved.substitutionReasonFi,
        substitutionReasonEn: resolved.substitutionReasonEn,
      });
      break;
    }
  }

  const selectedFromPoolCount = slots.reduce((a, s) => a + s.poolSizeAfterLevel, 0);
  const filteredByLevelCount = slots.reduce(
    (a, s) => a + (s.poolSizeCategory - s.poolSizeAfterLevel),
    0,
  );
  const filteredByLimitationsCount = slots.reduce(
    (a, s) => a + s.wouldConflictWithLimitationsCount,
    0,
  );

  return {
    picks,
    debug: {
      slots,
      selectedFromPoolCount,
      filteredByLevelCount,
      filteredByLimitationsCount,
    },
  };
}

function hashToIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % mod;
}

