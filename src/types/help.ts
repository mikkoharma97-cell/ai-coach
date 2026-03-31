export type HelpVideoPageId =
  | "today"
  | "food"
  | "plan"
  | "adjustments"
  | "review"
  | "preferences"
  | "workout"
  | "progress"
  | "paywall"
  | "start";

export type HelpVideoItem = {
  pageId: HelpVideoPageId;
  titleFi: string;
  titleEn: string;
  descriptionFi: string;
  descriptionEn: string;
  durationLabelFi: string;
  durationLabelEn: string;
  videoUrl?: string;
  posterUrl?: string;
  bulletsFi?: string[];
  bulletsEn?: string[];
};
