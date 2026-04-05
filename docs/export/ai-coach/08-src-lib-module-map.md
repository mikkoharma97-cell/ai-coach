# `src/lib/` — moduulikartta (snapshot)

Tämä on **hakemistorakenne-inventaario**, ei API-dokumentaatio. Tiedostomäärä: ~170+ `.ts`-tiedostoa (päivittyy).

## Tila, tilaus, paywall, build

- `storage.ts`, `subscription.ts`, `paywallPolicy.ts`, `versionStorage.ts`, `buildInfo.ts`, `buildInfo.generated.ts`
- `todayFlowStorage.ts`, `todaySystemStatus.ts`, `todayLiveSubline.ts`, `todayLiveStatus.ts`
- `coachNoProfileRoutePolicy.ts`, `appShellRoutes.ts`

## Päivän suoritus ja “minimum day”

- `dailyEngine.ts`, `dailyFocus.ts`, `dateKey.ts`, `dateKeys.ts`
- `minimumDayStorage.ts`, `coach/minimumDayPlan.ts`
- `dayExecutionStorage.ts`, `thinklessDayStorage.ts`

## Coach-moottorit (`src/lib/coach/` ja juuri)

- `coach/`: `aiDecisionEngine`, `coaching-engine`, `todayDashboardEngine`, `trainingEngine`, `nutritionEngine`, `decisionEngine`, `decisionEngineV2`, `programDecisionEngine`, `exceptionEngine`, `feedbackEngine`, `explanationEngine`, `fullProgressionEngine`, `trainingProgressionEngine`, `activityProgressionEngine`, `nutritionProgressionEngine`, `trainingPrescriptionEngine`, `performanceAnalysis`, `profileNormalizer`, `weekAdaptationEngine`, `splitRecommendationEngine`, `coachEngineBundle`, jne.
- Juuri: `plan.ts`, `programPresets.ts`, `programLibrary.ts`, `programPackages.ts`, `coachProgramCatalog.ts`, `programPreview.ts`, `programPlanTypes.ts`, `programTracks.ts`, `programBlueprints.ts`, `profileProgramResolver.ts`

## Ruoka ja ravitsemus

- `nutrition.ts`, `nutritionLibrary.ts`, `nutritionBlueprints.ts`, `mealEngine.ts`, `mealTemplates.ts`, `mealPackageConfig.ts`, `generateMealPlan.ts`
- `food/`: `foodDayContent`, `macroCorrection`, `barcodeLookup`, `shoppingList`, `dayMacros`, `fallbackMeals`, `mealTiming`, `offPlan`, `foodLogCoverage`, `storeSuggestions`, `weeklySpendDisplay`, `foodSearchExtra`, `foodSearchExtraBatch2`
- `foodStorage.ts`, `foodLibrary.ts`, `foodRecommendationCopy.ts`, `mealSlotShares.ts`, `mealSubstitute.ts`, `mealSlotOverrideStorage.ts`
- `nutrition/generator.ts`, `nutrition/rebalance.ts`, `nutrition/rebalanceCollect.ts`

## Treeni

- `training/`: `generator`, `programPipeline`, `exercises`, `progression`, `quickGymEngine`, `exerciseOverrides`, `noEquipmentFallback`, `trainingIntelligence`
- `exerciseRotationEngine.ts`, `exerciseClassification.ts`, `trainingCategoryLibrary.ts`, `generateWorkoutDay.ts`
- `workout/`: `voiceParser.ts`
- `workoutLogStorage.ts`, `profileTraining.ts`

## Sisältö, RSS, markkinapaikka

- `content/`: `store`, `rss`, `refresh`, `sources`, `selectHighlight`, `getArticles`, `seed`, `normalize`, `profileQuery`
- `marketplace/featuredProducts.ts`

## Täydennys, lisäravinteet, kauppa

- `supplements/`: `recommendationEngine`, `productCatalog`
- `supplementStack.ts`, `supplementPreferencesStorage.ts`
- `groceryCatalog.ts`, `groceryOffers.ts`, `groceryMatchRules.ts`, `groceryStoreResolver.ts`

## Muistutukset ja analytiikka

- `notifications/reminderSchedule.ts`, `notifications/reminderStorage.ts`
- `analytics.ts`, `eventLogger.ts`, `eventsStorage.ts`, `flowLog.ts`

## UI / i18n / debug

- `i18n.ts`, `i18n.messages.ts`
- `uiInteractionDebug.ts`, `overlayStack.ts`

## Muut juuri-tason moduulit (esimerkkejä)

- `adaptive.ts`, `adjustments.ts`, `appUsageMode.ts`, `autopilotStorage.ts`, `coachFeatureToggles.ts`, `coachPresenceCopy.ts`, `coachVoiceQuickParse.ts`, `dataConfidence.ts`, `demoSeed.ts`, `eventLogger.ts`, `exceptionStorage.ts`, `exceptionWeekReview.ts`, `feedbackStorage.ts`, `firstUserProgressUi.ts`, `goalTimeline.ts`, `helpVideos.ts`, `helpVideoStorage.ts`, `intensifierRules.ts`, `landingDemoSettings.ts`, `landingFakeWeek.ts`, `machineScanStorage.ts`, `machineScanHints.ts`, `packageGuidance.ts`, `proAiSuggestions.ts`, `proProgression.ts`, `proSeeds.ts`, `proWorkspace.ts`, `progress.ts`, `progressContinueReason.ts`, `realityScore.ts`, `realityScoreContext.ts`, `review/weekAdaptMap.ts`, `review/nextWeekMomentum.ts`, `review/weeklyTruth.ts`, `review/weeklyCoachAnalysis.ts`, `shareCoach.ts`, `siteUrl.ts`, `streaks.ts`, `activityEnergy.ts`, `activityStorage.ts`, `weekInsight.ts`, `weeklyReview.ts`, `workShiftStorage.ts`, `shiftAdaptation.ts`, `exerciseCoachTips.ts`

**Täydellinen lista:** `find src/lib -name '*.ts' | sort`.
