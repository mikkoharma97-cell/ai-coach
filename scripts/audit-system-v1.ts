/**
 * System audit V1 — aja: npx tsx scripts/audit-system-v1.ts
 * Ei korvaa manuaalista mobiilitestiä; varmistaa moottorin ja profiilihaaroja.
 */
import { generateDailyPlan } from "../src/lib/dailyEngine";
import { emptyAnswers } from "../src/lib/plan";
import { normalizeProgramPackageId } from "../src/lib/programPackages";
import { defaultTrackForPackage } from "../src/lib/programTracks";
import { generateWorkoutDay } from "../src/lib/training/generator";
import type { OnboardingAnswers } from "../src/types/coach";

function assert(name: string, ok: boolean, detail?: string) {
  if (!ok) throw new Error(`${name} FAILED${detail ? `: ${detail}` : ""}`);
  console.log(`AUDIT OK: ${name}`);
}

function withTrack(p: OnboardingAnswers): OnboardingAnswers {
  const pkg = normalizeProgramPackageId(p.selectedPackageId);
  return {
    ...p,
    programTrackId: p.programTrackId ?? defaultTrackForPackage(pkg),
  };
}

/** Käyttäjän pyytämät kombot (tiivistetty profiileiksi) */
function profileBeginnerHome(): OnboardingAnswers {
  return withTrack({
    ...emptyAnswers(),
    goal: "improve_fitness",
    level: "beginner",
    trainingLevel: "beginner",
    trainingVenue: "home",
    daysPerWeek: 3,
    selectedPackageId: "steady_start",
  });
}

function profileBeginnerGym(): OnboardingAnswers {
  return withTrack({
    ...emptyAnswers(),
    goal: "improve_fitness",
    level: "beginner",
    trainingLevel: "beginner",
    trainingVenue: "gym",
    daysPerWeek: 3,
    selectedPackageId: "steady_start",
  });
}

function profileAdvancedGym(): OnboardingAnswers {
  return withTrack({
    ...emptyAnswers(),
    goal: "build_muscle",
    level: "advanced",
    trainingLevel: "advanced",
    trainingVenue: "gym",
    daysPerWeek: 4,
    selectedPackageId: "muscle_rhythm",
  });
}

function profileFatLossBusy(): OnboardingAnswers {
  return withTrack({
    ...emptyAnswers(),
    goal: "lose_weight",
    level: "beginner",
    trainingLevel: "beginner",
    trainingVenue: "gym",
    daysPerWeek: 3,
    biggestChallenge: "lack_of_time",
    lifeSchedule: "busy_day",
    selectedPackageId: "light_cut",
    mealStructure: "three_meals",
    flexibility: "flexible",
  });
}

function profileMuscle5d(): OnboardingAnswers {
  return withTrack({
    ...emptyAnswers(),
    goal: "build_muscle",
    level: "intermediate",
    trainingLevel: "intermediate",
    trainingVenue: "gym",
    daysPerWeek: 5,
    selectedPackageId: "muscle_rhythm",
  });
}

function firstTrainingSlot(
  profile: OnboardingAnswers,
): { dayIndex: number; ids: string[] } | null {
  const pkg = normalizeProgramPackageId(profile.selectedPackageId);
  for (let d = 0; d < 7; d++) {
    const day = generateWorkoutDay({
      package: pkg,
      goal: profile.goal,
      level: profile.level,
      dayIndex: d,
      locale: "fi",
      sourceProfile: profile,
      week: 1,
    });
    if (!day.isRestDay && day.exercises.length > 0) {
      return { dayIndex: d, ids: day.exercises.map((e) => e.id) };
    }
  }
  return null;
}

function dailyKcal(profile: OnboardingAnswers): number {
  const plan = generateDailyPlan(profile, new Date("2026-06-15T12:00:00"), "fi");
  return plan.todayCalories;
}

function auditWorkouts() {
  const profiles: { name: string; p: OnboardingAnswers }[] = [
    { name: "beginner+home", p: profileBeginnerHome() },
    { name: "beginner+gym", p: profileBeginnerGym() },
    { name: "advanced+gym", p: profileAdvancedGym() },
    { name: "fat_loss+busy", p: profileFatLossBusy() },
    { name: "muscle+5d", p: profileMuscle5d() },
  ];

  const signatures: string[] = [];
  for (const { name, p } of profiles) {
    const slot = firstTrainingSlot(p);
    assert(
      `${name}: löytyy treenipäivä liikkeillä`,
      slot != null && slot.ids.length > 0,
      slot ? String(slot.ids.length) : "no day",
    );
    const uniq = new Set(slot!.ids);
    assert(
      `${name}: ei duplikaatti-liikkeitä samana päivänä`,
      uniq.size === slot!.ids.length,
      [...uniq].join(","),
    );
    signatures.push(`${name}:${slot!.ids.sort().join(",")}`);
  }

  const uniqueSigs = new Set(signatures.map((s) => s.split(":")[1]));
  assert(
    "eri profiilit eivät tuota kaikki samaa liikelistausta (vähintään 2 eri allekkain)",
    uniqueSigs.size >= 2,
    `distinct exercise sets: ${uniqueSigs.size}`,
  );
}

function auditNutritionSpread() {
  const a = dailyKcal(profileBeginnerHome());
  const b = dailyKcal(profileFatLossBusy());
  assert(
    "daily kcal eroaa fat_loss vs beginner (ei identtinen)",
    Math.abs(a - b) > 50,
    `a=${a} b=${b}`,
  );
}

auditWorkouts();
auditNutritionSpread();
console.log("AUDIT: kaikki automaattiset tarkistukset OK.");
