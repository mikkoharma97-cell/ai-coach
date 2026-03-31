/**
 * Interaction audit — vain dev. Tuotannossa ei logia.
 */
export function logButtonClick(componentName: string, action?: string): void {
  if (process.env.NODE_ENV !== "development") return;
  console.log("CLICK:", componentName, action ?? "");
}
