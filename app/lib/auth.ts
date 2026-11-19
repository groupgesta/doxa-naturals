import { useSyncExternalStore } from "react";
import { getSupabase } from "./supabase";

// Admin sign-in with Supabase Auth (email + password). A signed-in user only
// counts as admin when their id is in the public.admins table (see
// supabase/schema.sql). The database enforces this with row level security, so
// this client check is only for showing the right screen.

let session: boolean | null = null; // null = still checking
const listeners = new Set<() => void>();
let started = false;

function set(next: boolean) {
  if (session === next) return;
  session = next;
  listeners.forEach((l) => l());
}

async function isAdmin(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data } = await sb.rpc("is_admin");
  return data === true;
}

async function refresh() {
  const sb = getSupabase();
  if (!sb) return set(false);
  const { data } = await sb.auth.getSession();
  set(data.session ? await isAdmin() : false);
}

function start() {
  if (started) return;
  started = true;
  const sb = getSupabase();
  if (!sb) return set(false);
  void refresh();
  sb.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") set(false);
  });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  start();
  return () => {
    listeners.delete(cb);
  };
}

/** null on the server and while checking, then true or false. */
export function useAdminSession(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => session,
    () => null,
  );
}

/** Resolves to an error message, or null when signed in. */
export async function signIn(
  email: string,
  password: string,
): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return "Supabase is not connected yet. Add the keys to .env.local.";
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return "Wrong email or password.";
  if (!(await isAdmin())) {
    await sb.auth.signOut();
    return "This account does not have admin access.";
  }
  set(true);
  return null;
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
  set(false);
}
