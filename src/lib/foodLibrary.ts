/**
 * Perusruoka-idea — kcal + makrot (appin oma data).
 */
export type FoodLibraryItem = {
  id: string;
  nameFi: string;
  nameEn: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  tags: string[];
};

export const FOOD_LIBRARY: FoodLibraryItem[] = [
  { id: "fl_chicken_rice", nameFi: "Kana + riisi", nameEn: "Chicken + rice", kcal: 520, proteinG: 45, carbsG: 55, fatG: 12, tags: ["meal"] },
  { id: "fl_beef_potato", nameFi: "Jauheliha + peruna", nameEn: "Ground beef + potato", kcal: 580, proteinG: 38, carbsG: 45, fatG: 24, tags: ["meal"] },
  { id: "fl_salmon_rice", nameFi: "Lohi + riisi", nameEn: "Salmon + rice", kcal: 540, proteinG: 42, carbsG: 48, fatG: 18, tags: ["meal"] },
  { id: "fl_quark", nameFi: "Proteiinirahka", nameEn: "High-protein quark", kcal: 180, proteinG: 22, carbsG: 14, fatG: 4, tags: ["snack", "easy"] },
  { id: "fl_oats", nameFi: "Kaurapuuro + marjat", nameEn: "Oats + berries", kcal: 380, proteinG: 14, carbsG: 58, fatG: 10, tags: ["breakfast", "easy"] },
  { id: "fl_eggs_toast", nameFi: "Munat + leipä", nameEn: "Eggs + toast", kcal: 420, proteinG: 26, carbsG: 32, fatG: 20, tags: ["breakfast"] },
  { id: "fl_smoothie", nameFi: "Proteiinismoothie", nameEn: "Protein smoothie", kcal: 320, proteinG: 28, carbsG: 38, fatG: 8, tags: ["snack", "busy"] },
  { id: "fl_salad_chicken", nameFi: "Iso salaatti + kana", nameEn: "Large salad + chicken", kcal: 450, proteinG: 42, carbsG: 28, fatG: 18, tags: ["meal"] },
  { id: "fl_tuna_pasta", nameFi: "Tonnikala-pasta", nameEn: "Tuna pasta", kcal: 560, proteinG: 38, carbsG: 68, fatG: 14, tags: ["meal"] },
  { id: "fl_cottage", nameFi: "Raejuusto + hedelmä", nameEn: "Cottage + fruit", kcal: 240, proteinG: 28, carbsG: 22, fatG: 6, tags: ["snack", "easy"] },
  { id: "fl_wrap", nameFi: "Kana-wrap", nameEn: "Chicken wrap", kcal: 480, proteinG: 36, carbsG: 48, fatG: 16, tags: ["meal", "busy"] },
  { id: "fl_yogurt_granola", nameFi: "Jogurtti + granola", nameEn: "Yogurt + granola", kcal: 400, proteinG: 18, carbsG: 52, fatG: 14, tags: ["breakfast"] },
  { id: "fl_steak_veg", nameFi: "Pihvi + kasvikset", nameEn: "Steak + vegetables", kcal: 620, proteinG: 48, carbsG: 22, fatG: 36, tags: ["meal"] },
  { id: "fl_soup_bread", nameFi: "Keitto + leipä", nameEn: "Soup + bread", kcal: 440, proteinG: 22, carbsG: 52, fatG: 16, tags: ["meal", "busy"] },
  { id: "fl_ready_protein", nameFi: "Valmis proteiiniateria", nameEn: "Ready protein meal", kcal: 500, proteinG: 40, carbsG: 48, fatG: 16, tags: ["quick", "busy", "easy"] },
  { id: "fl_rice_cakes", nameFi: "Riisikakut + levite + kalkkuna", nameEn: "Rice cakes + turkey", kcal: 280, proteinG: 22, carbsG: 30, fatG: 8, tags: ["snack", "easy"] },
  { id: "fl_shake", nameFi: "Heraproteiinijuoma", nameEn: "Whey shake", kcal: 200, proteinG: 30, carbsG: 12, fatG: 4, tags: ["snack", "easy", "busy"] },
  { id: "fl_burrito", nameFi: "Burrito (kana)", nameEn: "Chicken burrito", kcal: 640, proteinG: 38, carbsG: 72, fatG: 22, tags: ["meal", "busy"] },
  { id: "fl_fish_pot", nameFi: "Kala + perunamuusi", nameEn: "Fish + mash", kcal: 520, proteinG: 36, carbsG: 52, fatG: 18, tags: ["meal"] },
  { id: "fl_night_cottage", nameFi: "Iltapala: raejuusto", nameEn: "Evening: cottage cheese", kcal: 200, proteinG: 24, carbsG: 12, fatG: 6, tags: ["snack", "easy"] },
  { id: "fl_skyr_berries", nameFi: "Skyr + marjat + pähkinät", nameEn: "Skyr + berries + nuts", kcal: 310, proteinG: 24, carbsG: 32, fatG: 12, tags: ["breakfast", "easy"] },
  { id: "fl_microwave_bowl", nameFi: "Kaura + muna + pakaste marjat (mikro)", nameEn: "Oats + egg + frozen berries (microwave)", kcal: 360, proteinG: 20, carbsG: 48, fatG: 10, tags: ["breakfast", "busy", "easy"] },
  { id: "fl_deli_salad", nameFi: "Kaupan iso salaatti + broileri", nameEn: "Store salad + grilled chicken", kcal: 420, proteinG: 38, carbsG: 30, fatG: 18, tags: ["meal", "busy"] },
  { id: "fl_minced_pasta", nameFi: "Jauheliha + täysjyväpasta", nameEn: "Minced meat + wholewheat pasta", kcal: 590, proteinG: 40, carbsG: 62, fatG: 20, tags: ["meal"] },
  { id: "fl_tofu_veg", nameFi: "Tofu + nuudeli + kasvikset", nameEn: "Tofu + noodles + vegetables", kcal: 480, proteinG: 28, carbsG: 58, fatG: 16, tags: ["meal"] },
  { id: "fl_halibut_potato", nameFi: "Kampela + uunisperuna", nameEn: "Halibut + oven potato", kcal: 510, proteinG: 40, carbsG: 48, fatG: 16, tags: ["meal"] },
];

export function foodLibrarySample(count = 8): FoodLibraryItem[] {
  return FOOD_LIBRARY.slice(0, count);
}
