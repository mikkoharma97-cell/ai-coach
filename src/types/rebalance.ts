/** Ylisyönnin hallittu tasapainotus — jaettu tyyppi (ei import-syklejä). */
export type OvereatingEvent = {
  date: string;
  extraCalories: number;
  source?: "logged" | "estimated" | "exception";
};

export type RebalancePlan = {
  totalExtraCalories: number;
  daysToBalance: number;
  dailyAdjustmentCalories: number;
  messageFi: string;
  messageEn: string;
};
