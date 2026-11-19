import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser/server client using the public (anon or publishable) key. Security
// comes from the row level security policies in supabase/schema.sql, not from
// hiding this key. Returns null when the env vars are missing, so the site
// still builds and shows the starting catalogue before Supabase is connected.

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const inBrowser = typeof window !== "undefined";
  client =
    url && key
      ? createClient(url, key, {
          auth: {
            persistSession: inBrowser,
            autoRefreshToken: inBrowser,
            detectSessionInUrl: false,
          },
        })
      : null;
  return client;
}

export const PRODUCT_IMAGE_BUCKET = "product-images";
