import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Minute-rounded so the snapshot is stable between renders.
const snapshot = () => Math.floor(Date.now() / 60000) * 60000;

/** Current time in ms. null on the server, so prerendering never reads the clock. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}
