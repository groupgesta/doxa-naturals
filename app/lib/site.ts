// Public origin used for canonical URLs, share images and the sitemap.
// Override with NEXT_PUBLIC_SITE_URL (for example a staging domain).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://doxa-naturals.com"
).replace(/\/$/, "");

export const SITE_NAME = "Doxa Naturals";
export const SITE_TITLE = "Doxa Naturals | Haircare for Real Curls & Coils";
export const SITE_DESCRIPTION =
  "Natural-based haircare for curls, coils and textured hair: rosemary sealing butter, flaxseed curl gel, scalp oil and scalp spray. Made in Mauritius, collection in Curepipe, Quatre Bornes and Port Louis.";
