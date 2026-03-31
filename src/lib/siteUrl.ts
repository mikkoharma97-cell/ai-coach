/**
 * Julkinen base-URL metadataan ja absoluuttisiin polkuihin.
 * Vercel: käyttää `VERCEL_URL` (https) jos `NEXT_PUBLIC_SITE_URL` puuttuu.
 */
export function getPublicSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit && /^https?:\/\//i.test(explicit)) {
    return explicit.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/\/$/, "");
    return host.startsWith("http") ? host : `https://${host}`;
  }
  return "http://localhost:3000";
}
