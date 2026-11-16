"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Server snapshot is empty so the prerendered page doesn't bake in the build
// year; the client fills in the current year after hydration.
export default function Year() {
  const year = useSyncExternalStore(
    subscribe,
    () => String(new Date().getFullYear()),
    () => "",
  );
  return <span>{year}</span>;
}
