/**
 * One daily focus line — varies by package + weekday so Today feels alive.
 */
import type { Locale } from "@/lib/i18n";
import type { ProgramPackageId } from "@/types/coach";
import { normalizeProgramPackageId } from "@/lib/programPackages";

export type DailyFocus = {
  /** Main headline (training or recovery) */
  title: string;
  subtitle: string;
  coachNote: string;
};

function pick<T>(arr: T[], dayIndex: number): T {
  return arr[dayIndex % arr.length];
}

export function getDailyFocus(
  packageId: string | null | undefined,
  dayIndex: number,
  isRestDay: boolean,
  workoutLine: string,
  locale: Locale,
): DailyFocus {
  const id = normalizeProgramPackageId(packageId);
  const fi = locale === "fi";

  if (isRestDay) {
    return {
      title: fi ? "Palautuminen + kevyt liike" : "Recovery + light movement",
      subtitle: fi
        ? "Kävely tai kevyt liikkuvuus riittää."
        : "Walking or easy mobility is enough.",
      coachNote: fi
        ? "Älä säädä. Lepo on osa ohjelmaa."
        : "Don’t overthink it. Rest is part of the plan.",
    };
  }

  const subtitles: Record<ProgramPackageId, [string, string, string]> = {
    steady_start: fi
      ? [
          "Pidä tempo tasaisena.",
          "Sama rytmi koko kierroksen.",
          "Hengitä sarjojen välissä.",
        ]
      : [
          "Keep the tempo even.",
          "Same rhythm through the session.",
          "Breathe between sets.",
        ],
    muscle_rhythm: fi
      ? [
          "Tilavuus ennen uupumusta.",
          "Kontrolloitu tempo.",
          "Viimeinen sarja siisti.",
        ]
      : [
          "Volume before fatigue.",
          "Controlled tempo.",
          "Last set clean.",
        ],
    light_cut: fi
      ? [
          "Kevyt, mutta tarkka.",
          "Syke hallussa.",
          "Liike ennen määrää.",
        ]
      : [
          "Light but precise.",
          "Heart rate in check.",
          "Quality over volume.",
        ],
    performance_block: fi
      ? [
          "Tarkka suoritus.",
          "Kuorma kirjataan mielessä.",
          "Palautuminen alkaa heti jälkeen.",
        ]
      : [
          "Crisp execution.",
          "Load noted in your head.",
          "Recovery starts right after.",
        ],
  };

  const coachNotes: Record<ProgramPackageId, [string, string]> = {
    steady_start: fi
      ? [
          "Yksi hyvä treeni kantaa koko viikkoa.",
          "Tänään ei tarvita täydellisyyttä — tarvitaan tehty.",
        ]
      : [
          "One solid session carries the week.",
          "Today you need done, not perfect.",
        ],
    muscle_rhythm: fi
      ? [
          "Rytmi ratkaisee kasvun — pidä sarjat linjassa.",
          "Tämä päivä syöttää seuraavaa nostopäivää.",
        ]
      : [
          "Rhythm drives growth — keep sets honest.",
          "This session feeds the next lift day.",
        ],
    light_cut: fi
      ? [
          "Treeni ja päivän energia kulkevat samaan suuntaan.",
          "Kevyt liike tukee nälkärajaa.",
        ]
      : [
          "Training and today’s energy pull the same way.",
          "Light work supports hunger control.",
        ],
    performance_block: fi
      ? [
          "Kuorma ja tekniikka samassa paketissa.",
          "Kirjaa suoritus. Jatka eteenpäin.",
        ]
      : [
          "Load and technique in one package.",
          "Log the work. Move on.",
        ],
  };

  return {
    title: workoutLine,
    subtitle: pick(subtitles[id], dayIndex),
    coachNote: pick(coachNotes[id], dayIndex + id.length),
  };
}
