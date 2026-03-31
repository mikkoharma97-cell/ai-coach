/**
 * Tuoteplacements — kumppanilinkit (ei upotettua maksua V1).
 * URLit: korvaa oikeilla kaupan osoitteilla kun kumppanuus elää.
 */
export type FeaturedProductCategory = "supplement" | "apparel";

export type FeaturedProductPlacement = {
  id: string;
  brand: string;
  titleFi: string;
  titleEn: string;
  teaserFi: string;
  teaserEn: string;
  url: string;
  category: FeaturedProductCategory;
  featured: boolean;
};

export const FEATURED_PRODUCT_PLACEMENTS: FeaturedProductPlacement[] = [
  {
    id: "feat_ptv_whey",
    brand: "PTVatanen",
    titleFi: "Proteiinilisät",
    titleEn: "Protein line",
    teaserFi: "Käytännöllinen täydennys kun päivän proteiini jää vajaaksi.",
    teaserEn: "Practical top-up when daily protein falls short.",
    url: "https://ptvatanen.fi",
    category: "supplement",
    featured: true,
  },
  {
    id: "feat_sg_apparel",
    brand: "SameGoal",
    titleFi: "Treenivaatteet",
    titleEn: "Training apparel",
    teaserFi: "Yksi linja — sama tavoite, eri päivä.",
    teaserEn: "One line — same goal, different day.",
    url: "https://samegoal.com",
    category: "apparel",
    featured: true,
  },
];
