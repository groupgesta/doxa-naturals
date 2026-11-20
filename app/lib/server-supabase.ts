import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Supabase client with the service role key. Server only: it bypasses RLS. */
export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
