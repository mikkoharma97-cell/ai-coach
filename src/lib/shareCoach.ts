/**
 * Web Share API — fallback: copy or no-op.
 */
export async function shareCoachPayload(payload: {
  title: string;
  text: string;
  url?: string;
}): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const url = payload.url ?? window.location.origin;
  if (navigator.share) {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url,
      });
      return true;
    } catch {
      return false;
    }
  }
  try {
    await navigator.clipboard.writeText(`${payload.text}\n${url}`);
    return true;
  } catch {
    return false;
  }
}
