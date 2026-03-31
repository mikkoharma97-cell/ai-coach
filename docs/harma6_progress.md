# HÄRMÄ6 — progress (lähdeteksti)

Alkuperäinen muistiinpano (`harma6_progress.txt`):

- yksi pääkäyrä (consistency)
- weekly summary
- coach insight
- daily completion sync

## Missä koodissa

| Pilari | Toteutus |
|--------|----------|
| **Pääkäyrä / consistency** | `ProgressPage` → `DevelopmentTrajectoryCard` (paino + consistency % + putki, `engine.progressTrajectoryLine`) + `ConsistencyCard` (`computeConsistency`). Ei erillistä SVG-käyrää — tiivis “yksi rivi” -näkymä + laajennettavat käyrät. |
| **Weekly summary** | `/review` → `WeeklyReviewScreen` + `generateWeeklyReview` (`src/lib/weeklyReview.ts`). Linkki Progressista: `progress.seeWeeklyReview`. |
| **Coach insight** | `ProgressHeroInsightCard` + `computeProgressHeroInsight`; pääotsikko `progressInterpretationKey` / `progress.pageLead`. |
| **Daily completion sync** | Päivän sulkeminen → `computeStreakSummary`, `StreakSummaryCard`, `StreakRhythmBlock` (Today + Progress). |

**Huom:** Tämä on dokumentoitu scope/vastine — ei automaattisesti “valmis tuotemääritelmä” jokaiselle riville.
