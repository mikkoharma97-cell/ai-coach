/**
 * Temporary debug for interaction audits. Strip or gate before release polish.
 */
export function logButtonClick(componentName: string, action?: string): void {
  if (process.env.NODE_ENV !== "development") return;
  if (action) {
    console.log("BUTTON CLICK", componentName, action);
  } else {
    console.log("BUTTON CLICK", componentName);
  }
}
