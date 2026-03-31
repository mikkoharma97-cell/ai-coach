/**
 * Käyttäjän lisäravinteet — vaikutus päivän proteiiniin (moottori).
 */
export type UserSupplementType =
  | "protein_powder"
  | "creatine"
  | "other";

export type UserSupplementEntry = {
  id: string;
  type: UserSupplementType;
  /** vapaa nimi listalla */
  name: string;
  /** proteiinijauhe: proteiinia g/päivä (annos × kerta); muut 0 */
  proteinGPerDay: number;
  /** kreatiini / muu: kuvaileva (esim. "5g") — ei makrolaskua */
  doseLabel?: string;
};
