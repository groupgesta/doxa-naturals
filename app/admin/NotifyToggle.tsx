"use client";

import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import {
  disablePush,
  enablePush,
  isSubscribed,
  pushSupported,
} from "../lib/push";

const bell = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 22Zm7-6.5V11a7 7 0 0 0-5-6.7V3.5a2 2 0 0 0-4 0v.8A7 7 0 0 0 5 11v4.5L3 17.5V19h18v-1.5l-2-2Z" />
  </svg>
);

type State = "checking" | "unsupported" | "off" | "on";

/** Turns push notifications for new orders on or off for this device. */
export default function NotifyToggle({ variant }: { variant: "side" | "icon" }) {
  const [state, setState] = useState<State>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pushSupported()) {
      // Browsers without push (or no VAPID key) just hide the control.
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
      setState(await isSubscribed().then((on) => (on ? "on" : "off")));
    } finally {
      setBusy(false);
    }
  }

  const on = state === "on";
  const label = on ? "Order alerts: on" : "Turn on order alerts";

  if (variant === "icon") {
    return (
      <button
        className="icon-btn"
        onClick={toggle}
        disabled={busy}
        aria-label={label}
        title={label}
        style={on ? undefined : { opacity: 0.55 }}
      >
        {busy ? <Spinner /> : bell}
      </button>
    );
  }
  return (
    <button className="side-link" onClick={toggle} disabled={busy}>
      {busy ? <Spinner /> : bell}
      <span>{label}</span>
    </button>
  );
}
