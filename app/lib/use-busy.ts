import { useCallback, useState } from "react";
import { run } from "./notify";

/**
 * Tracks which store mutation is running. `pending` is the key of the running
 * action (or null), so only the button that was clicked shows a loader while
 * its siblings are just disabled.
 */
export function useBusy(): [
  string | null,
  (key: string, op: () => Promise<string | null>) => void,
] {
  const [pending, setPending] = useState<string | null>(null);
  const start = useCallback(
    (key: string, op: () => Promise<string | null>) => {
      setPending(key);
      void run(op()).finally(() => setPending(null));
    },
    [],
  );
  return [pending, start];
}
