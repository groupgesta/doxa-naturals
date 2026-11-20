"use client";

import { useEffect, useState } from "react";
import {
  disablePush,
  enablePush,
  isSubscribed,
  pushSupported,
} from "../lib/push";

type State = "checking" | "unsupported" | "off" | "on";

/** Switch for push notifications on new orders, for this device. */
export default function NotifyToggle({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [state, setState] = useState<State>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pushSupported()) {
      // Browsers without push (or no VAPID key) just hide the switch.
      queueMicrotask(() => setState("unsupported"));
      return;
    }
    void isSubscribed().then((on) => setState(on ? "on" : "off"));
  }, []);

  if (state === "unsupported" || state === "checking") return null;

  async function toggle() {
    setBusy(true);
    try {
      const error = state === "on" ? await disablePush() : await enablePush();
      if (error) window.alert(error);
      setState((await isSubscribed()) ? "on" : "off");
    } finally {
      setBusy(false);
    }
  }

  const on = state === "on";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Order alerts"
      title={
        on ? "Order alerts are on for this device" : "Turn on order alerts"
      }
      className={compact ? "alerts-switch compact" : "alerts-switch"}
      onClick={toggle}
      disabled={busy}
    >
      <span className="alerts-label">Order alerts</span>
      <span className="alerts-track">
        <span className="alerts-thumb">
          {busy && <span className="spinner" />}
        </span>
      </span>
    </button>
  );
}
