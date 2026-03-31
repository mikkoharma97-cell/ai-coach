/** Stable day key for meal rotation / logs — local calendar day */
export function dayKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
