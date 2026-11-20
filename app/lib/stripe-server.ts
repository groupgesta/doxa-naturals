import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}

/** Lowercase ISO code Stripe charges in. Prices in the shop are whole units. */
export const CURRENCY = (process.env.STRIPE_CURRENCY ?? "mur").toLowerCase();
