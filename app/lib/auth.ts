import { useSyncExternalStore } from "react";

// DEMO ONLY. This flags a session in sessionStorage so the dashboard UI can be
// designed and clicked through. It is not security: anyone can set the flag.
// Replace with a server-side session (httpOnly cookie) before real data exists.

const KEY = "doxa:admin-session";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const read = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

/** null on the server and first client render, then true/false. */
export function useAdminSession(): boolean | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function signIn() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {}
  listeners.forEach((l) => l());
}

export function signOut() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
  listeners.forEach((l) => l());
}
