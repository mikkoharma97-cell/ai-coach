/**
 * Laiteskannaus V1 — kuva talteen, ei oikeaa CV:tä vielä.
 */
export type MachineScanRecord = {
  id: string;
  createdAt: string;
  /** data URL tai blob-URL (vain istunto) */
  imageDataUrl: string;
  /** Kun tunnistus tulee myöhemmin */
  guessedMachineType?: string;
  notes: string;
};
